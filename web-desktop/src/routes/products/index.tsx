import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Search, Package, MoreVertical, Loader2 } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { useArtigos, useCriarArtigo } from '@/hooks/use-artigos'
import { useState } from 'react'

export const Route = createFileRoute('/products/')({
  component: ProductsPage,
})

function ProductsPage() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const { data, isLoading } = useArtigos({ search, limit: 50 })
  const criarArtigo = useCriarArtigo()
  
  const [novoArtigo, setNovoArtigo] = useState({
    codigo: '',
    descricao: '',
    precoUnitario: 0,
    ivaPercent: 16,
    stock: 0,
    categoria: '',
  })
  
  const artigos = data?.items || []
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await criarArtigo.mutateAsync(novoArtigo)
      setShowModal(false)
      setNovoArtigo({ codigo: '', descricao: '', precoUnitario: 0, ivaPercent: 16, stock: 0, categoria: '' })
    } catch (error: any) {
      alert('Erro ao criar artigo: ' + error.message)
    }
  }
  
  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: 'Sem Stock', color: 'bg-red-100 text-red-600' }
    if (stock < 10) return { label: 'Baixo', color: 'bg-orange-100 text-orange-600' }
    return { label: 'Normal', color: 'bg-boho-sage/10 text-boho-sage' }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-boho-accent animate-spin" />
          <p className="text-boho-brown">Carregando artigos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-boho-coffee">Artigos</h1>
          <p className="text-boho-brown mt-1">Gerencie seus produtos e serviços</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-boho-accent hover:bg-boho-accent-hover text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Novo Artigo
        </button>
      </div>

      {/* Search */}
      <FiscalCard className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-boho-taupe" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar artigo por código ou descrição..."
            className="w-full pl-10 pr-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
          />
        </div>
      </FiscalCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm">Total de Artigos</p>
          <p className="text-2xl font-bold text-boho-coffee">{artigos.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm">Valor do Stock</p>
          <p className="text-2xl font-bold text-boho-accent">
            MZN {artigos.reduce((acc, a) => acc + (a.stock * a.precoUnitario), 0).toLocaleString('pt-MZ')}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm">Sem Stock</p>
          <p className="text-2xl font-bold text-red-500">
            {artigos.filter(a => a.stock <= 0).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm">Baixo Stock</p>
          <p className="text-2xl font-bold text-boho-mustard">
            {artigos.filter(a => a.stock > 0 && a.stock < 10).length}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artigos.map((artigo) => {
          const stockStatus = getStockStatus(artigo.stock)
          
          return (
            <FiscalCard key={artigo.id} className="hover:shadow-boho-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-boho-accent/10 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-boho-accent" />
                  </div>
                  <div>
                    <p className="font-mono text-xs text-boho-taupe">{artigo.codigo}</p>
                    <h3 className="font-medium text-boho-coffee">{artigo.descricao}</h3>
                  </div>
                </div>
                <button className="p-2 hover:bg-boho-sand rounded-lg text-boho-taupe">
                  <MoreVertical size={18} />
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-boho-brown">Preço</p>
                  <p className="font-mono text-lg font-bold text-boho-coffee">
                    MZN {artigo.precoUnitario?.toLocaleString('pt-MZ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-boho-brown">IVA</p>
                  <p className="font-medium text-boho-coffee">{artigo.ivaPercent}%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-boho-beige">
                <span className="text-sm text-boho-brown">Stock: {artigo.stock}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${stockStatus.color}`}>
                  {stockStatus.label}
                </span>
              </div>
            </FiscalCard>
          )
        })}
      </div>

      {/* Empty State */}
      {artigos.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-boho-taupe mx-auto mb-4" />
          <p className="text-boho-brown mb-2">Nenhum artigo encontrado</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-boho-accent hover:underline"
          >
            Cadastrar primeiro artigo
          </button>
        </div>
      )}

      {/* Modal Novo Artigo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-semibold text-boho-coffee mb-6">Novo Artigo</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-boho-brown block mb-2">Código *</label>
                  <input
                    type="text"
                    required
                    value={novoArtigo.codigo}
                    onChange={(e) => setNovoArtigo({ ...novoArtigo, codigo: e.target.value })}
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                    placeholder="ART001"
                  />
                </div>
                <div>
                  <label className="text-sm text-boho-brown block mb-2">Categoria</label>
                  <input
                    type="text"
                    value={novoArtigo.categoria}
                    onChange={(e) => setNovoArtigo({ ...novoArtigo, categoria: e.target.value })}
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                    placeholder="Geral"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-boho-brown block mb-2">Descrição *</label>
                <input
                  type="text"
                  required
                  value={novoArtigo.descricao}
                  onChange={(e) => setNovoArtigo({ ...novoArtigo, descricao: e.target.value })}
                  className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  placeholder="Descrição do artigo"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-boho-brown block mb-2">Preço (MZN)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={novoArtigo.precoUnitario}
                    onChange={(e) => setNovoArtigo({ ...novoArtigo, precoUnitario: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-boho-brown block mb-2">IVA %</label>
                  <select
                    value={novoArtigo.ivaPercent}
                    onChange={(e) => setNovoArtigo({ ...novoArtigo, ivaPercent: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={10}>10%</option>
                    <option value={16}>16%</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-boho-brown block mb-2">Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={novoArtigo.stock}
                    onChange={(e) => setNovoArtigo({ ...novoArtigo, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 border border-boho-beige hover:border-boho-brown text-boho-brown rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criarArtigo.isPending}
                  className="flex-1 py-3 px-4 bg-boho-accent hover:bg-boho-accent-hover disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {criarArtigo.isPending ? 'Salvando...' : 'Salvar Artigo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
