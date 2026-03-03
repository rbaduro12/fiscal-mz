import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { 
  Package, AlertTriangle, ArrowDownLeft, ArrowUpRight, 
  Search, RefreshCw, TrendingUp,
  Archive, AlertCircle, CheckCircle2
} from 'lucide-react'
import { useResumoStock, useAlertasStock, useEntradaStock, useSaidaStock, useAjusteStock } from '@/hooks/use-stock'
import { useProdutos } from '@/hooks/use-artigos'
import { formatCurrency } from '@/lib/utils'

export const Route = createFileRoute('/stock')({
  component: StockPage,
})

function StockPage() {
  const [activeTab, setActiveTab] = useState<'resumo' | 'alertas'>('resumo')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState<'entrada' | 'saida' | 'ajuste' | null>(null)
  
  const { data: resumo, isLoading: loadingResumo } = useResumoStock()
  const { data: alertas, isLoading: loadingAlertas } = useAlertasStock()
  const { data: produtos } = useProdutos({ limit: 100 })
  
  const entradaMutation = useEntradaStock()
  const saidaMutation = useSaidaStock()
  const ajusteMutation = useAjusteStock()
  
  const [formData, setFormData] = useState({
    artigoId: '',
    quantidade: 0,
    quantidadeReal: 0,
    motivo: '',
    observacoes: '',
    referencia: ''
  })
  
  const handleEntrada = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await entradaMutation.mutateAsync({
        artigoId: formData.artigoId,
        quantidade: formData.quantidade,
        observacoes: formData.observacoes,
        referencia: formData.referencia
      })
      setShowModal(null)
      setFormData({ artigoId: '', quantidade: 0, quantidadeReal: 0, motivo: '', observacoes: '', referencia: '' })
    } catch (error) {
      console.error('Erro na entrada:', error)
    }
  }
  
  const handleSaida = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await saidaMutation.mutateAsync({
        artigoId: formData.artigoId,
        quantidade: formData.quantidade,
        observacoes: formData.observacoes,
        referencia: formData.referencia
      })
      setShowModal(null)
      setFormData({ artigoId: '', quantidade: 0, quantidadeReal: 0, motivo: '', observacoes: '', referencia: '' })
    } catch (error) {
      console.error('Erro na saída:', error)
    }
  }
  
  const handleAjuste = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await ajusteMutation.mutateAsync({
        artigoId: formData.artigoId,
        quantidadeReal: formData.quantidadeReal,
        motivo: formData.motivo
      })
      setShowModal(null)
      setFormData({ artigoId: '', quantidade: 0, quantidadeReal: 0, motivo: '', observacoes: '', referencia: '' })
    } catch (error) {
      console.error('Erro no ajuste:', error)
    }
  }
  
  const filteredResumo = resumo?.filter(item => 
    item.descricao.toLowerCase().includes(search.toLowerCase()) ||
    item.codigo.toLowerCase().includes(search.toLowerCase())
  ) || []
  
  const totalArtigos = resumo?.length || 0
  const totalValor = resumo?.reduce((acc, item) => acc + (item.valorTotal || 0), 0) || 0
  const totalAlertas = alertas?.length || 0
  const stockZero = resumo?.filter(item => item.stockAtual === 0).length || 0
  
  const getStockStatus = (atual: number, minimo: number) => {
    if (atual === 0) return { label: 'Sem Stock', color: 'bg-red-100 text-red-700 border-red-200' }
    if (atual <= minimo) return { label: 'Crítico', color: 'bg-orange-100 text-orange-700 border-orange-200' }
    if (atual <= minimo * 2) return { label: 'Baixo', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
    return { label: 'Normal', color: 'bg-green-100 text-green-700 border-green-200' }
  }
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-boho-coffee mb-2">
          Gestão de Stock
        </h1>
        <p className="text-boho-brown">
          Controle de inventário e movimentações
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-boho-beige shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-boho-sage/20 rounded-xl flex items-center justify-center">
              <Archive className="w-6 h-6 text-boho-sage" />
            </div>
            <div>
              <p className="text-sm text-boho-brown">Total de Artigos</p>
              <p className="text-2xl font-bold text-boho-coffee">{totalArtigos}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-boho-beige shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-boho-terracotta/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-boho-terracotta" />
            </div>
            <div>
              <p className="text-sm text-boho-brown">Valor Total</p>
              <p className="text-2xl font-bold text-boho-coffee">{formatCurrency(totalValor)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-boho-beige shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-boho-brown">Alertas</p>
              <p className="text-2xl font-bold text-orange-600">{totalAlertas}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-boho-beige shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-boho-brown">Sem Stock</p>
              <p className="text-2xl font-bold text-red-600">{stockZero}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setShowModal('entrada')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
        >
          <ArrowDownLeft size={20} />
          Entrada de Stock
        </button>
        <button
          onClick={() => setShowModal('saida')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors"
        >
          <ArrowUpRight size={20} />
          Saída de Stock
        </button>
        <button
          onClick={() => setShowModal('ajuste')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
        >
          <RefreshCw size={20} />
          Ajuste de Stock
        </button>
        
        <div className="flex-1" />
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-boho-taupe" size={20} />
          <input
            type="text"
            placeholder="Pesquisar artigo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50 w-64"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-boho-beige shadow-sm overflow-hidden">
        <div className="flex border-b border-boho-beige">
          <button
            onClick={() => setActiveTab('resumo')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'resumo' 
                ? 'text-boho-terracotta border-b-2 border-boho-terracotta' 
                : 'text-boho-brown hover:text-boho-coffee'
            }`}
          >
            <Package className="inline-block w-4 h-4 mr-2" />
            Resumo de Stock
          </button>
          <button
            onClick={() => setActiveTab('alertas')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'alertas' 
                ? 'text-boho-terracotta border-b-2 border-boho-terracotta' 
                : 'text-boho-brown hover:text-boho-coffee'
            }`}
          >
            <AlertTriangle className="inline-block w-4 h-4 mr-2" />
            Alertas
            {totalAlertas > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {totalAlertas}
              </span>
            )}
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'resumo' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-boho-beige">
                    <th className="text-left py-3 px-4 font-semibold text-boho-coffee">Código</th>
                    <th className="text-left py-3 px-4 font-semibold text-boho-coffee">Descrição</th>
                    <th className="text-center py-3 px-4 font-semibold text-boho-coffee">Stock Atual</th>
                    <th className="text-center py-3 px-4 font-semibold text-boho-coffee">Mínimo</th>
                    <th className="text-right py-3 px-4 font-semibold text-boho-coffee">Valor Total</th>
                    <th className="text-center py-3 px-4 font-semibold text-boho-coffee">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-boho-coffee">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingResumo ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-boho-brown">
                        <RefreshCw className="inline-block w-6 h-6 animate-spin mr-2" />
                        Carregando...
                      </td>
                    </tr>
                  ) : filteredResumo.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-boho-brown">
                        Nenhum artigo encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredResumo.map((item) => {
                      const status = getStockStatus(item.stockAtual, item.stockMinimo)
                      return (
                        <tr key={item.artigoId} className="border-b border-boho-beige/50 hover:bg-boho-cream/50">
                          <td className="py-3 px-4 text-boho-coffee font-medium">{item.codigo}</td>
                          <td className="py-3 px-4 text-boho-brown">{item.descricao}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-bold ${
                              item.stockAtual <= item.stockMinimo ? 'text-red-600' : 'text-boho-coffee'
                            }`}>
                              {item.stockAtual}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-boho-brown">{item.stockMinimo}</td>
                          <td className="py-3 px-4 text-right font-medium text-boho-coffee">
                            {formatCurrency(item.valorTotal)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setFormData({ ...formData, artigoId: item.artigoId })
                                  setShowModal('entrada')
                                }}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Entrada"
                              >
                                <ArrowDownLeft size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setFormData({ ...formData, artigoId: item.artigoId })
                                  setShowModal('saida')
                                }}
                                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Saída"
                              >
                                <ArrowUpRight size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setFormData({ ...formData, artigoId: item.artigoId })
                                  setShowModal('ajuste')
                                }}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ajuste"
                              >
                                <RefreshCw size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'alertas' && (
            <div className="space-y-4">
              {loadingAlertas ? (
                <div className="py-8 text-center text-boho-brown">
                  <RefreshCw className="inline-block w-6 h-6 animate-spin mr-2" />
                  Carregando...
                </div>
              ) : alertas?.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-boho-coffee mb-2">Sem Alertas</h3>
                  <p className="text-boho-brown">Todos os artigos têm stock adequado</p>
                </div>
              ) : (
                alertas?.map((alerta) => (
                  <div key={alerta.artigoId} className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-boho-coffee">{alerta.descricao}</h4>
                      <p className="text-sm text-boho-brown">Código: {alerta.codigo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-boho-brown">
                        Stock Atual: <span className="font-bold text-red-600">{alerta.stockAtual}</span>
                      </p>
                      <p className="text-sm text-boho-brown">
                        Mínimo: {alerta.stockMinimo}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFormData({ ...formData, artigoId: alerta.artigoId })
                        setShowModal('entrada')
                      }}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Repor Stock
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      {showModal === 'entrada' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-boho-coffee mb-4 flex items-center gap-2">
              <ArrowDownLeft className="text-green-600" />
              Entrada de Stock
            </h3>
            <form onSubmit={handleEntrada} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-boho-brown mb-1">Produto</label>
                <select
                  value={formData.artigoId}
                  onChange={(e) => setFormData({ ...formData, artigoId: e.target.value })}
                  className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {produtos?.map((artigo: any) => (
                    <option key={artigo.id} value={artigo.id}>
                      {artigo.codigo} - {artigo.descricao} (Stock: {artigo.stockAtual || 0})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-boho-brown mb-1">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-boho-brown mb-1">Referência (opcional)</label>
                <input
                  type="text"
                  value={formData.referencia}
                  onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                  className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  placeholder="Ex: NF-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-boho-brown mb-1">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-4 py-2 border border-boho-beige text-boho-brown rounded-xl hover:bg-boho-cream transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={entradaMutation.isPending}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {entradaMutation.isPending ? 'Processando...' : 'Confirmar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showModal === 'saida' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-boho-coffee mb-4 flex items-center gap-2">
              <ArrowUpRight className="text-orange-600" />
              Saída de Stock
            </h3>
            <form onSubmit={handleSaida} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-boho-brown mb-1">Produto</label>
                <select
                  value={formData.artigoId}
                  onChange={(e) => setFormData({ ...formData, artigoId: e.target.value })}
                  className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {produtos?.map((artigo: any) => (
                    <option key={artigo.id} value={artigo.id}>
                      {artigo.codigo} - {artigo.descricao} (Stock: {artigo.stockAtual || 0})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-boho-brown mb-1">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-boho-brown mb-1">Referência (opcional)</label>
                <input
                  type="text"
                  value={formData.referencia}
                  onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                  className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  placeholder="Ex: FT-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-boho-brown mb-1">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-4 py-2 border border-boho-beige text-boho-brown rounded-xl hover:bg-boho-cream transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saidaMutation.isPending}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {saidaMutation.isPending ? 'Processando...' : 'Confirmar Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showModal === 'ajuste' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-boho-coffee mb-4 flex items-center gap-2">
              <RefreshCw className="text-blue-600" />
              Ajuste de Stock
            </h3>
            <form onSubmit={handleAjuste} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-boho-brown mb-1">Produto</label>
                <select
                  value={formData.artigoId}
                  onChange={(e) => setFormData({ ...formData, artigoId: e.target.value })}
                  className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {produtos?.map((artigo: any) => (
                    <option key={artigo.id} value={artigo.id}>
                      {artigo.codigo} - {artigo.descricao} (Stock: {artigo.stockAtual || 0})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-boho-brown mb-1">Quantidade Real (Contagem Física)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.quantidadeReal}
                  onChange={(e) => setFormData({ ...formData, quantidadeReal: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-boho-brown mb-1">Motivo do Ajuste</label>
                <select
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  required
                >
                  <option value="">Selecione o motivo</option>
                  <option value="Inventário físico">Inventário físico</option>
                  <option value="Quebra">Quebra</option>
                  <option value="Avaria">Avaria</option>
                  <option value="Erro de entrada">Erro de entrada</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 px-4 py-2 border border-boho-beige text-boho-brown rounded-xl hover:bg-boho-cream transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={ajusteMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {ajusteMutation.isPending ? 'Processando...' : 'Confirmar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
