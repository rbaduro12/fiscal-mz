import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Plus, Trash2, Loader2, Search, Package, User } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { useState, useMemo } from 'react'
import { useClientes } from '@/hooks/use-entidades'
import { useArtigos } from '@/hooks/use-artigos'
import { useCriarCotacao } from '@/hooks/use-documentos'
import { useCalculoIVA } from '@/hooks/use-fiscal'

export const Route = createFileRoute('/quotes/new')({
  component: NewQuotePage,
})

interface ItemCotacao {
  artigoId?: string
  descricao: string
  quantidade: number
  precoUnitario: number
  descontoPercent: number
  ivaPercent: number
}

function NewQuotePage() {
  const navigate = useNavigate()
  const { calcularIVA, calcularTotalComIVA } = useCalculoIVA()
  
  // Dados da API
  const { data: clientesData, isLoading: isLoadingClientes } = useClientes({ limit: 100 })
  const { data: artigosData, isLoading: isLoadingArtigos } = useArtigos({ limit: 100 })
  const criarCotacao = useCriarCotacao()
  
  // Estado do formulário
  const [entidadeId, setEntidadeId] = useState('')
  const [validadeDias, setValidadeDias] = useState(30)
  const [observacoes, setObservacoes] = useState('')
  const [itens, setItens] = useState<ItemCotacao[]>([
    { descricao: '', quantidade: 1, precoUnitario: 0, descontoPercent: 0, ivaPercent: 16 }
  ])
  
  // Filtros de busca
  const [buscaCliente, setBuscaCliente] = useState('')
  const [buscaArtigo, setBuscaArtigo] = useState('')
  
  const clientes = clientesData?.items || []
  const artigos = artigosData?.items || []
  
  // Filtrar clientes
  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente) return clientes.slice(0, 10)
    return clientes.filter(c => 
      c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
      c.nuit?.includes(buscaCliente)
    ).slice(0, 10)
  }, [clientes, buscaCliente])
  
  // Filtrar artigos
  const artigosFiltrados = useMemo(() => {
    if (!buscaArtigo) return artigos.slice(0, 10)
    return artigos.filter(a => 
      a.descricao.toLowerCase().includes(buscaArtigo.toLowerCase()) ||
      a.codigo.toLowerCase().includes(buscaArtigo.toLowerCase())
    ).slice(0, 10)
  }, [artigos, buscaArtigo])
  
  // Cliente selecionado
  const clienteSelecionado = clientes.find(c => c.id === entidadeId)
  
  const addItem = () => {
    setItens([...itens, { descricao: '', quantidade: 1, precoUnitario: 0, descontoPercent: 0, ivaPercent: 16 }])
  }
  
  const removeItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index))
    }
  }
  
  const updateItem = (index: number, field: keyof ItemCotacao, value: any) => {
    const newItens = [...itens]
    newItens[index] = { ...newItens[index], [field]: value }
    setItens(newItens)
  }
  
  const selecionarArtigo = (index: number, artigoId: string) => {
    const artigo = artigos.find(a => a.id === artigoId)
    if (artigo) {
      const newItens = [...itens]
      newItens[index] = {
        ...newItens[index],
        artigoId: artigo.id,
        descricao: artigo.descricao,
        precoUnitario: artigo.precoUnitario,
        ivaPercent: artigo.ivaPercent || 16
      }
      setItens(newItens)
    }
  }
  
  // Cálculos
  const totais = useMemo(() => {
    return itens.reduce((acc, item) => {
      const valor = item.quantidade * item.precoUnitario * (1 - item.descontoPercent / 100)
      const { iva, total } = calcularIVA(valor, item.ivaPercent as 16 | 10 | 5 | 0)
      return {
        subtotal: acc.subtotal + valor,
        totalIva: acc.totalIva + iva,
        totalPagar: acc.totalPagar + total
      }
    }, { subtotal: 0, totalIva: 0, totalPagar: 0 })
  }, [itens, calcularIVA])
  
  const handleSubmit = async () => {
    if (!entidadeId) {
      alert('Selecione um cliente')
      return
    }
    
    if (itens.some(i => !i.descricao || i.quantidade <= 0 || i.precoUnitario < 0)) {
      alert('Preencha todos os itens corretamente')
      return
    }
    
    try {
      await criarCotacao.mutateAsync({
        entidadeId,
        itens: itens.map(i => ({
          artigoId: i.artigoId!,
          quantidade: i.quantidade,
          precoUnitario: i.precoUnitario,
          descontoPercent: i.descontoPercent
        })),
        validadeDias
      })
      navigate({ to: '/quotes' })
    } catch (error: any) {
      alert('Erro ao criar cotação: ' + (error.message || 'Erro desconhecido'))
    }
  }
  
  const isLoading = isLoadingClientes || isLoadingArtigos
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-boho-accent animate-spin" />
          <p className="text-boho-brown">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/quotes" className="p-2 hover:bg-boho-sand rounded-lg text-boho-brown transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-boho-coffee">Nova Cotação</h1>
          <p className="text-boho-brown mt-1">Crie uma nova cotação para seu cliente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4 text-boho-coffee">Dados do Cliente</h2>
            
            {!clienteSelecionado ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-boho-taupe" size={20} />
                  <input
                    type="text"
                    value={buscaCliente}
                    onChange={(e) => setBuscaCliente(e.target.value)}
                    placeholder="Buscar cliente por nome ou NUIT..."
                    className="w-full pl-10 pr-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  />
                </div>
                
                {clientesFiltrados.length > 0 && (
                  <div className="border border-boho-beige rounded-lg overflow-hidden">
                    {clientesFiltrados.map((cliente) => (
                      <button
                        key={cliente.id}
                        onClick={() => {
                          setEntidadeId(cliente.id)
                          setBuscaCliente('')
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-boho-sand border-b border-boho-beige last:border-0 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-boho-accent/10 rounded-full flex items-center justify-center">
                            <User size={16} className="text-boho-accent" />
                          </div>
                          <div>
                            <p className="font-medium text-boho-coffee">{cliente.nome}</p>
                            <p className="text-sm text-boho-brown">NUIT: {cliente.nuit}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {buscaCliente && clientesFiltrados.length === 0 && (
                  <p className="text-sm text-boho-brown text-center py-4">
                    Nenhum cliente encontrado.{' '}
                    <Link to="/clients/new" className="text-boho-accent hover:underline">
                      Cadastrar novo cliente
                    </Link>
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-boho-sand/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-boho-accent/10 rounded-full flex items-center justify-center">
                      <User size={20} className="text-boho-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-boho-coffee">{clienteSelecionado.nome}</p>
                      <p className="text-sm text-boho-brown">NUIT: {clienteSelecionado.nuit}</p>
                      {clienteSelecionado.email && (
                        <p className="text-sm text-boho-taupe">{clienteSelecionado.email}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setEntidadeId('')}
                    className="text-sm text-boho-accent hover:underline"
                  >
                    Alterar
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <label className="text-sm text-boho-brown block mb-2">Validade (dias)</label>
              <select
                value={validadeDias}
                onChange={(e) => setValidadeDias(Number(e.target.value))}
                className="px-4 py-2 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
              >
                <option value={7}>7 dias</option>
                <option value={15}>15 dias</option>
                <option value={30}>30 dias</option>
                <option value={60}>60 dias</option>
                <option value={90}>90 dias</option>
              </select>
            </div>
          </FiscalCard>

          {/* Items */}
          <FiscalCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-boho-coffee">Itens</h2>
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-boho-accent hover:bg-boho-accent-hover text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                Adicionar Item
              </button>
            </div>

            <div className="space-y-4">
              {itens.map((item, index) => (
                <div key={index} className="p-4 bg-boho-sand/30 rounded-lg space-y-3">
                  {/* Seleção de artigo */}
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <Package size={18} className="text-boho-taupe" />
                      <input
                        type="text"
                        value={buscaArtigo}
                        onChange={(e) => setBuscaArtigo(e.target.value)}
                        placeholder="Buscar artigo por código ou descrição..."
                        className="flex-1 px-3 py-2 bg-white border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                      />
                    </div>
                    
                    {buscaArtigo && artigosFiltrados.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-boho-beige rounded-lg shadow-lg max-h-48 overflow-auto">
                        {artigosFiltrados.map((artigo) => (
                          <button
                            key={artigo.id}
                            onClick={() => {
                              selecionarArtigo(index, artigo.id)
                              setBuscaArtigo('')
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-boho-sand border-b border-boho-beige last:border-0 transition-colors"
                          >
                            <p className="font-medium text-boho-coffee">{artigo.descricao}</p>
                            <p className="text-sm text-boho-brown">
                              {artigo.codigo} • MZN {artigo.precoUnitario.toLocaleString('pt-MZ')} • IVA {artigo.ivaPercent}%
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Campos do item */}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-6">
                      <label className="text-xs text-boho-brown block mb-1">Descrição</label>
                      <input
                        type="text"
                        value={item.descricao}
                        onChange={(e) => updateItem(index, 'descricao', e.target.value)}
                        placeholder="Descrição do item"
                        className="w-full px-3 py-2 bg-white border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-boho-brown block mb-1">Qtd</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantidade}
                        onChange={(e) => updateItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-white border border-boho-beige rounded-lg text-boho-coffee text-center focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-boho-brown block mb-1">Preço</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.precoUnitario}
                        onChange={(e) => updateItem(index, 'precoUnitario', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white border border-boho-beige rounded-lg text-boho-coffee text-right focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-boho-brown block mb-1">IVA %</label>
                      <select
                        value={item.ivaPercent}
                        onChange={(e) => updateItem(index, 'ivaPercent', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={10}>10%</option>
                        <option value={16}>16%</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Total da linha */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-boho-brown">Desconto %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={item.descontoPercent}
                        onChange={(e) => updateItem(index, 'descontoPercent', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-white border border-boho-beige rounded text-boho-coffee text-right text-sm focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-boho-brown">Total: </span>
                      <span className="font-mono font-medium text-boho-coffee">
                        MZN {(item.quantidade * item.precoUnitario * (1 - item.descontoPercent / 100) * (1 + item.ivaPercent / 100)).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {itens.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FiscalCard>
          
          {/* Observações */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4 text-boho-coffee">Observações</h2>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais (opcional)"
              rows={3}
              className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-accent/50 resize-none"
            />
          </FiscalCard>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <FiscalCard className="sticky top-8">
            <h2 className="text-lg font-semibold mb-4 text-boho-coffee">Resumo</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-boho-beige">
                <span className="text-boho-brown">Subtotal</span>
                <span className="font-mono text-boho-coffee">
                  MZN {totais.subtotal.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-boho-beige">
                <span className="text-boho-brown">IVA</span>
                <span className="font-mono text-boho-coffee">
                  MZN {totais.totalIva.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-boho-coffee font-medium">Total</span>
                <span className="font-mono text-2xl font-bold text-boho-accent">
                  MZN {totais.totalPagar.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleSubmit}
                disabled={criarCotacao.isPending || !entidadeId}
                className="w-full py-3 px-4 bg-boho-accent hover:bg-boho-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {criarCotacao.isPending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Cotação'
                )}
              </button>
              <Link
                to="/quotes"
                className="block w-full py-3 px-4 text-center border border-boho-beige hover:border-boho-brown text-boho-brown rounded-lg font-medium transition-colors"
              >
                Cancelar
              </Link>
            </div>
            
            {!entidadeId && (
              <p className="mt-3 text-sm text-boho-mustard text-center">
                Selecione um cliente para continuar
              </p>
            )}
          </FiscalCard>
        </div>
      </div>
    </div>
  )
}
