import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Package, Plus, Search, Store, Wrench, TrendingUp, AlertTriangle, Box, Edit2, Trash2 } from 'lucide-react'
import { useArtigos, useProdutos, useServicos, useCriarArtigo } from '@/hooks/use-artigos'
import { formatCurrency } from '@/lib/utils'
import type { Artigo } from '@/hooks/use-artigos'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

function ProductsPage() {
  const [activeTab, setActiveTab] = useState<'todos' | 'produtos' | 'servicos'>('todos')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  
  const { data: todosArtigos, isLoading: loadingTodos } = useArtigos({ search, limit: 100 })
  const { data: produtos, isLoading: loadingProdutos } = useProdutos({ search, limit: 100 })
  const { data: servicos, isLoading: loadingServicos } = useServicos({ search, limit: 100 })
  const criarArtigo = useCriarArtigo()
  
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    tipo: 'PRODUTO' as 'PRODUTO' | 'SERVICO',
    precoUnitario: 0,
    ivaPercent: 16,
    stockAtual: 0,
    stockMinimo: 0,
    stockMaximo: 0,
    categoria: '',
  })
  
  const artigos = activeTab === 'produtos' ? produtos : 
                  activeTab === 'servicos' ? servicos : 
                  todosArtigos
  
  const totalProdutos = produtos?.length || 0
  const totalServicos = servicos?.length || 0
  const valorTotalStock = produtos?.reduce((acc: number, p: Artigo) => acc + ((p.stockAtual || 0) * p.precoUnitario), 0) || 0
  const produtosBaixoStock = produtos?.filter((p: Artigo) => (p.stockAtual || 0) <= (p.stockMinimo || 0)).length || 0
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await criarArtigo.mutateAsync(formData)
      setShowModal(false)
      setFormData({
        codigo: '',
        descricao: '',
        tipo: 'PRODUTO',
        precoUnitario: 0,
        ivaPercent: 16,
        stockAtual: 0,
        stockMinimo: 0,
        stockMaximo: 0,
        categoria: '',
      })
    } catch (error) {
      console.error('Erro ao criar:', error)
    }
  }
  
  const getStockStatus = (artigo: Artigo) => {
    if (artigo.tipo === 'SERVICO') return { label: 'Serviço', color: 'bg-blue-100 text-blue-700' }
    if ((artigo.stockAtual || 0) === 0) return { label: 'Sem Stock', color: 'bg-red-100 text-red-700' }
    if ((artigo.stockAtual || 0) <= (artigo.stockMinimo || 0)) return { label: 'Crítico', color: 'bg-orange-100 text-orange-700' }
    if ((artigo.stockAtual || 0) <= ((artigo.stockMinimo || 0) * 2)) return { label: 'Baixo', color: 'bg-yellow-100 text-yellow-700' }
    return { label: 'Normal', color: 'bg-green-100 text-green-700' }
  }
  
  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-boho-coffee mb-2">
            Produtos & Serviços
          </h1>
          <p className="text-boho-brown">
            Gestão completa do catálogo de artigos
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-boho-terracotta to-boho-mustard text-white rounded-xl font-medium shadow-boho hover:opacity-90 transition-all"
        >
          <Plus size={20} />
          Novo Artigo
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-boho-beige shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-boho-sage/20 rounded-xl flex items-center justify-center">
              <Box className="w-6 h-6 text-boho-sage" />
            </div>
            <div>
              <p className="text-sm text-boho-brown">Produtos</p>
              <p className="text-2xl font-bold text-boho-coffee">{totalProdutos}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-boho-beige shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-boho-brown">Serviços</p>
              <p className="text-2xl font-bold text-boho-coffee">{totalServicos}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-boho-beige shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-boho-terracotta/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-boho-terracotta" />
            </div>
            <div>
              <p className="text-sm text-boho-brown">Valor em Stock</p>
              <p className="text-2xl font-bold text-boho-coffee">{formatCurrency(valorTotalStock)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-boho-beige shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-boho-brown">Stock Baixo</p>
              <p className="text-2xl font-bold text-orange-600">{produtosBaixoStock}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-boho-beige shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-boho-beige gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('todos')}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTab === 'todos' 
                  ? 'bg-boho-terracotta text-white' 
                  : 'text-boho-brown hover:bg-boho-cream'
              }`}
            >
              <Store size={18} />
              Todos ({todosArtigos?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('produtos')}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTab === 'produtos' 
                  ? 'bg-boho-sage text-white' 
                  : 'text-boho-brown hover:bg-boho-cream'
              }`}
            >
              <Package size={18} />
              Produtos ({totalProdutos})
            </button>
            <button
              onClick={() => setActiveTab('servicos')}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                activeTab === 'servicos' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-boho-brown hover:bg-boho-cream'
              }`}
            >
              <Wrench size={18} />
              Serviços ({totalServicos})
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-boho-taupe" size={20} />
            <input
              type="text"
              placeholder="Pesquisar artigo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50 w-64"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-boho-cream/50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-boho-coffee">Código</th>
                <th className="text-left py-3 px-4 font-semibold text-boho-coffee">Descrição</th>
                <th className="text-center py-3 px-4 font-semibold text-boho-coffee">Tipo</th>
                <th className="text-right py-3 px-4 font-semibold text-boho-coffee">Preço</th>
                <th className="text-center py-3 px-4 font-semibold text-boho-coffee">IVA</th>
                {activeTab !== 'servicos' && (
                  <>
                    <th className="text-center py-3 px-4 font-semibold text-boho-coffee">Stock</th>
                    <th className="text-center py-3 px-4 font-semibold text-boho-coffee">Status</th>
                  </>
                )}
                <th className="text-center py-3 px-4 font-semibold text-boho-coffee">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loadingTodos || loadingProdutos || loadingServicos ? (
                <tr>
                  <td colSpan={activeTab === 'servicos' ? 6 : 8} className="py-8 text-center text-boho-brown">
                    Carregando...
                  </td>
                </tr>
              ) : artigos?.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'servicos' ? 6 : 8} className="py-8 text-center text-boho-brown">
                    Nenhum artigo encontrado
                  </td>
                </tr>
              ) : (
                artigos?.map((artigo: Artigo) => {
                  const status = getStockStatus(artigo)
                  return (
                    <tr key={artigo.id} className="border-b border-boho-beige/50 hover:bg-boho-cream/30">
                      <td className="py-3 px-4 font-medium text-boho-coffee">{artigo.codigo}</td>
                      <td className="py-3 px-4 text-boho-brown">{artigo.descricao}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          artigo.tipo === 'PRODUTO' 
                            ? 'bg-boho-sage/20 text-boho-sage' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {artigo.tipo === 'PRODUTO' ? 'Produto' : 'Serviço'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(artigo.precoUnitario)}
                      </td>
                      <td className="py-3 px-4 text-center text-boho-brown">{artigo.ivaPercent}%</td>
                      {activeTab !== 'servicos' && artigo.tipo === 'PRODUTO' && (
                        <>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-medium ${
                              (artigo.stockAtual || 0) <= (artigo.stockMinimo || 0) ? 'text-red-600' : 'text-boho-coffee'
                            }`}>
                              {artigo.stockAtual || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                        </>
                      )}
                      {activeTab === 'servicos' && (
                        <>
                          <td className="py-3 px-4 text-center text-boho-taupe">-</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 text-boho-brown hover:text-boho-terracotta hover:bg-boho-terracotta/10 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-1.5 text-boho-brown hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
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
      </div>
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-boho-coffee mb-6 flex items-center gap-2">
              <Plus className="text-boho-terracotta" />
              Novo Artigo
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-4 p-4 bg-boho-cream/30 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="PRODUTO"
                    checked={formData.tipo === 'PRODUTO'}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'PRODUTO' })}
                    className="w-4 h-4 text-boho-terracotta"
                  />
                  <Package className="w-5 h-5 text-boho-sage" />
                  <span className="font-medium text-boho-coffee">Produto (Físico)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="SERVICO"
                    checked={formData.tipo === 'SERVICO'}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'SERVICO' })}
                    className="w-4 h-4 text-boho-terracotta"
                  />
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-boho-coffee">Serviço</span>
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-boho-brown mb-1">Código *</label>
                  <input
                    type="text"
                    required
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                    placeholder="Ex: PROD001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-boho-brown mb-1">Categoria</label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                    placeholder="Ex: Electrónica"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-boho-brown mb-1">Descrição *</label>
                <input
                  type="text"
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  placeholder="Nome completo do artigo"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-boho-brown mb-1">Preço Unitário (MZN) *</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    required
                    value={formData.precoUnitario}
                    onChange={(e) => setFormData({ ...formData, precoUnitario: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-boho-brown mb-1">Taxa IVA (%)</label>
                  <select
                    value={formData.ivaPercent}
                    onChange={(e) => setFormData({ ...formData, ivaPercent: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  >
                    <option value={0}>0% (Isento)</option>
                    <option value={5}>5%</option>
                    <option value={10}>10%</option>
                    <option value={16}>16% (Padrão)</option>
                  </select>
                </div>
              </div>
              
              {formData.tipo === 'PRODUTO' && (
                <div className="p-4 bg-boho-cream/30 rounded-xl">
                  <h4 className="font-medium text-boho-coffee mb-4 flex items-center gap-2">
                    <Box size={18} />
                    Configuração de Stock
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-boho-brown mb-1">Stock Inicial</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.stockAtual}
                        onChange={(e) => setFormData({ ...formData, stockAtual: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-boho-brown mb-1">Stock Mínimo</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.stockMinimo}
                        onChange={(e) => setFormData({ ...formData, stockMinimo: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-boho-brown mb-1">Stock Máximo</label>
                      <input
                        type="number"
                        min={0}
                        value={formData.stockMaximo}
                        onChange={(e) => setFormData({ ...formData, stockMaximo: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-boho-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-boho-beige text-boho-brown rounded-xl hover:bg-boho-cream transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criarArtigo.isPending}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-boho-terracotta to-boho-mustard text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {criarArtigo.isPending ? 'A gravar...' : 'Criar Artigo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
