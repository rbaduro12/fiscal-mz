import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2, Calculator } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { useState, useMemo } from 'react'
import { useClientes } from '@/hooks/use-entidades'
import { useArtigos } from '@/hooks/use-artigos'
import { useCreateQuote } from '@/hooks/use-quote-workflow'
import { ClienteSelector, ItemSelector, type ItemCotacao } from '@/components/cotacoes'

export const Route = createFileRoute('/quotes/new')({
  component: NewQuotePage,
})

function NewQuotePage() {
  const navigate = useNavigate()

  // Dados da API
  const { data: clientesData, isLoading: isLoadingClientes } = useClientes({ limit: 100 })
  const { data: artigosData, isLoading: isLoadingArtigos } = useArtigos({ limit: 100 })
  const criarCotacao = useCreateQuote()

  // Estado do formulário
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null)
  const [validadeDias, setValidadeDias] = useState(30)
  const [observacoes, setObservacoes] = useState('')
  const [itens, setItens] = useState<ItemCotacao[]>([
    { descricao: '', quantidade: 1, precoUnitario: 0, desconto: 0, taxaIva: 16 },
  ])

  const clientes = clientesData || []
  const artigos = artigosData || []

  // Cálculos
  const totais = useMemo(() => {
    return itens.reduce(
      (acc, item) => {
        const valorSemIva = item.quantidade * item.precoUnitario * (1 - item.desconto / 100)
        const valorIva = valorSemIva * (item.taxaIva / 100)
        return {
          subtotal: acc.subtotal + valorSemIva,
          totalIva: acc.totalIva + valorIva,
          total: acc.total + valorSemIva + valorIva,
        }
      },
      { subtotal: 0, totalIva: 0, total: 0 }
    )
  }, [itens])

  const handleSubmit = async () => {
    if (!clienteSelecionado) {
      alert('Selecione um cliente')
      return
    }

    if (itens.some((i) => !i.descricao || i.quantidade <= 0 || i.precoUnitario < 0)) {
      alert('Preencha todos os itens corretamente')
      return
    }

    try {
      await criarCotacao.mutateAsync({
        clienteId: clienteSelecionado.id,
        itens: itens.map((i) => ({
          artigoId: i.artigoId!,
          codigo: i.codigo,
          descricao: i.descricao,
          quantidade: i.quantidade,
          precoUnitario: i.precoUnitario,
          desconto: i.desconto,
          taxaIva: i.taxaIva,
        })),
        validadeDias,
        observacoes,
      })
      alert('Cotação criada com sucesso!')
      navigate({ to: '/quotes' })
    } catch (error: any) {
      alert(error.message || 'Erro ao criar cotação')
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
          <p className="text-boho-brown mt-1">Crie uma nova proposta comercial para seu cliente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cliente */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4 text-boho-coffee flex items-center gap-2">
              <span className="w-6 h-6 bg-boho-accent text-white rounded-full flex items-center justify-center text-sm">1</span>
              Selecionar Cliente
            </h2>
            <ClienteSelector
              clientes={clientes}
              clienteSelecionado={clienteSelecionado}
              onSelect={setClienteSelecionado}
              onClear={() => setClienteSelecionado(null)}
              disabled={criarCotacao.isPending}
            />

            {clienteSelecionado && (
              <div className="mt-4 flex items-center gap-4">
                <label className="text-sm text-boho-brown">Validade:</label>
                <select
                  value={validadeDias}
                  onChange={(e) => setValidadeDias(Number(e.target.value))}
                  disabled={criarCotacao.isPending}
                  className="px-4 py-2 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                >
                  <option value={7}>7 dias</option>
                  <option value={15}>15 dias</option>
                  <option value={30}>30 dias</option>
                  <option value={60}>60 dias</option>
                  <option value={90}>90 dias</option>
                </select>
              </div>
            )}
          </FiscalCard>

          {/* Itens */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4 text-boho-coffee flex items-center gap-2">
              <span className="w-6 h-6 bg-boho-accent text-white rounded-full flex items-center justify-center text-sm">2</span>
              Adicionar Itens
            </h2>
            <ItemSelector
              artigos={artigos}
              itens={itens}
              onChange={setItens}
              disabled={criarCotacao.isPending}
            />
          </FiscalCard>

          {/* Observações */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4 text-boho-coffee flex items-center gap-2">
              <span className="w-6 h-6 bg-boho-accent text-white rounded-full flex items-center justify-center text-sm">3</span>
              Observações (Opcional)
            </h2>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais, termos e condições..."
              rows={4}
              disabled={criarCotacao.isPending}
              className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-accent/50 resize-none"
            />
          </FiscalCard>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <FiscalCard className="sticky top-8">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="text-boho-accent" size={20} />
              <h2 className="text-lg font-semibold text-boho-coffee">Resumo</h2>
            </div>

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
                  MZN {totais.total.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleSubmit}
                disabled={criarCotacao.isPending || !clienteSelecionado}
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

            {!clienteSelecionado && (
              <p className="mt-3 text-sm text-boho-mustard text-center">
                Selecione um cliente para continuar
              </p>
            )}
          </FiscalCard>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Dica</h3>
            <p className="text-sm text-blue-600">
              Após criar a cotação, você poderá enviá-la diretamente para o cliente por email
              ou compartilhar o link de acesso.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
