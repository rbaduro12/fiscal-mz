import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Search, Building2, Phone, Mail, MapPin, MoreVertical, Loader2 } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { useClientes, useCriarEntidade } from '@/hooks/use-entidades'
import { useState } from 'react'

export const Route = createFileRoute('/clients')({
  component: ClientsPage,
})

function ClientsPage() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const { data, isLoading } = useClientes({ search, limit: 50 })
  const criarEntidade = useCriarEntidade()
  
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    nuit: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
  })
  
  const clientes = data?.items || []
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await criarEntidade.mutateAsync({
        ...novoCliente,
        tipo: 'CLIENTE'
      })
      setShowModal(false)
      setNovoCliente({ nome: '', nuit: '', email: '', telefone: '', endereco: '', cidade: '' })
    } catch (error: any) {
      alert('Erro ao criar cliente: ' + error.message)
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-boho-accent animate-spin" />
          <p className="text-boho-brown">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-boho-coffee">Clientes</h1>
          <p className="text-boho-brown mt-1">Gerencie seus clientes e fornecedores</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-boho-accent hover:bg-boho-accent-hover text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Novo Cliente
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
            placeholder="Buscar cliente por nome, NUIT ou email..."
            className="w-full pl-10 pr-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
          />
        </div>
      </FiscalCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm">Total de Clientes</p>
          <p className="text-2xl font-bold text-boho-coffee">{clientes.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm">Ativos</p>
          <p className="text-2xl font-bold text-boho-sage">
            {clientes.filter(c => c.ativo).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm">Com Email</p>
          <p className="text-2xl font-bold text-boho-accent">
            {clientes.filter(c => c.email).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm">Este Mês</p>
          <p className="text-2xl font-bold text-boho-mustard">+0</p>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientes.map((cliente) => (
          <FiscalCard key={cliente.id} className="hover:shadow-boho-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-boho-accent/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-boho-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-boho-coffee">{cliente.nome}</h3>
                  <p className="text-sm text-boho-brown">NUIT: {cliente.nuit}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-boho-sand rounded-lg text-boho-taupe">
                <MoreVertical size={18} />
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              {cliente.email && (
                <div className="flex items-center gap-2 text-boho-brown">
                  <Mail size={14} className="text-boho-taupe" />
                  {cliente.email}
                </div>
              )}
              {cliente.telefone && (
                <div className="flex items-center gap-2 text-boho-brown">
                  <Phone size={14} className="text-boho-taupe" />
                  {cliente.telefone}
                </div>
              )}
              {(cliente.endereco || cliente.cidade) && (
                <div className="flex items-center gap-2 text-boho-brown">
                  <MapPin size={14} className="text-boho-taupe" />
                  {cliente.endereco}{cliente.endereco && cliente.cidade ? ', ' : ''}{cliente.cidade}
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-boho-beige flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs ${
                cliente.ativo 
                  ? 'bg-boho-sage/10 text-boho-sage' 
                  : 'bg-boho-brown/10 text-boho-brown'
              }`}>
                {cliente.ativo ? 'Ativo' : 'Inativo'}
              </span>
              <Link
                to={`/quotes/new`}
                className="text-sm text-boho-accent hover:underline"
              >
                Criar cotação →
              </Link>
            </div>
          </FiscalCard>
        ))}
      </div>

      {/* Empty State */}
      {clientes.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-boho-taupe mx-auto mb-4" />
          <p className="text-boho-brown mb-2">Nenhum cliente encontrado</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-boho-accent hover:underline"
          >
            Cadastrar primeiro cliente
          </button>
        </div>
      )}

      {/* Modal Novo Cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-semibold text-boho-coffee mb-6">Novo Cliente</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-boho-brown block mb-2">Nome *</label>
                <input
                  type="text"
                  required
                  value={novoCliente.nome}
                  onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                  className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  placeholder="Nome da empresa ou pessoa"
                />
              </div>
              
              <div>
                <label className="text-sm text-boho-brown block mb-2">NUIT *</label>
                <input
                  type="text"
                  required
                  value={novoCliente.nuit}
                  onChange={(e) => setNovoCliente({ ...novoCliente, nuit: e.target.value })}
                  className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  placeholder="123456789"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-boho-brown block mb-2">Email</label>
                  <input
                    type="email"
                    value={novoCliente.email}
                    onChange={(e) => setNovoCliente({ ...novoCliente, email: e.target.value })}
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="text-sm text-boho-brown block mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={novoCliente.telefone}
                    onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                    placeholder="+258 84 123 4567"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-boho-brown block mb-2">Endereço</label>
                <input
                  type="text"
                  value={novoCliente.endereco}
                  onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                  className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  placeholder="Av. Principal, 123"
                />
              </div>
              
              <div>
                <label className="text-sm text-boho-brown block mb-2">Cidade</label>
                <input
                  type="text"
                  value={novoCliente.cidade}
                  onChange={(e) => setNovoCliente({ ...novoCliente, cidade: e.target.value })}
                  className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  placeholder="Maputo"
                />
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
                  disabled={criarEntidade.isPending}
                  className="flex-1 py-3 px-4 bg-boho-accent hover:bg-boho-accent-hover disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {criarEntidade.isPending ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
