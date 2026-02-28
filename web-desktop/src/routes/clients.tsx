import { createFileRoute } from '@tanstack/react-router'
import { Search, Plus, MoreHorizontal, Mail, Phone, Building2, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export const Route = createFileRoute('/clients')({
  component: ClientsPage,
})

const clients = [
  {
    id: '1',
    name: 'Manuel Fernando',
    company: 'ABC Comercial, Lda',
    email: 'abc@comercial.co.mz',
    phone: '+258 84 123 4567',
    nuit: '123456789',
    address: 'Av. Eduardo Mondlane, 1234, Maputo',
    totalQuotes: 8,
    totalSpent: 125000,
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Manuel+Fernando&background=9CAF88&color=fff',
  },
  {
    id: '2',
    name: 'Ana Maria Santos',
    company: 'XYZ Imports & Export',
    email: 'xyz@imports.co.mz',
    phone: '+258 86 987 6543',
    nuit: '987654321',
    address: 'Rua da Industria, 567, Beira',
    totalQuotes: 12,
    totalSpent: 234500,
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Santos&background=D4A574&color=fff',
  },
  {
    id: '3',
    name: 'Carlos Domingos',
    company: 'Maputo Tech Solutions',
    email: 'geral@maputotech.co.mz',
    phone: '+258 87 456 7890',
    nuit: '456789123',
    address: 'Av. Julius Nyerere, 890, Maputo',
    totalQuotes: 5,
    totalSpent: 89000,
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Domingos&background=B8A9C9&color=fff',
  },
  {
    id: '4',
    name: 'Fatima Abdallah',
    company: 'Nampula Agro Negocios',
    email: 'info@nampulaagro.co.mz',
    phone: '+258 85 789 1234',
    nuit: '789123456',
    address: 'Av. 25 de Setembro, 432, Nampula',
    totalQuotes: 3,
    totalSpent: 45000,
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Fatima+Abdallah&background=D4A5A5&color=fff',
  },
]

function ClientsPage() {
  const { hasRole } = useAuth()

  if (!hasRole('ADMIN')) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-medium">Acesso restrito apenas para administradores.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-boho-coffee mb-1">
            Clientes
          </h1>
          <p className="text-boho-brown">
            Gerencie seus clientes e acompanhe suas atividades
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-xl font-medium transition-colors shadow-boho">
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm mb-1">Total de Clientes</p>
          <p className="text-3xl font-display font-bold text-boho-coffee">24</p>
          <p className="text-boho-sage text-sm mt-1">+3 este mês</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm mb-1">Clientes Ativos</p>
          <p className="text-3xl font-display font-bold text-boho-coffee">20</p>
          <p className="text-boho-sage text-sm mt-1">83% do total</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm mb-1">Receita Total</p>
          <p className="text-3xl font-display font-bold text-boho-coffee">MZN 1.2M</p>
          <p className="text-boho-sage text-sm mt-1">+15% vs mês anterior</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-boho border border-boho-beige mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-taupe" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              className="w-full pl-12 pr-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:border-boho-terracotta transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <select className="px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta">
              <option>Todos os status</option>
              <option>Ativos</option>
              <option>Inativos</option>
            </select>
            <select className="px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta">
              <option>Ordenar por</option>
              <option>Nome</option>
              <option>Data</option>
              <option>Valor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige hover:shadow-boho-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <img 
                  src={client.avatar}
                  alt={client.name}
                  className="w-16 h-16 rounded-2xl border-2 border-boho-beige"
                />
                <div>
                  <h3 className="font-display font-semibold text-lg text-boho-coffee">
                    {client.name}
                  </h3>
                  <p className="text-boho-brown text-sm">{client.company}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-boho-sand rounded-lg text-boho-taupe transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-boho-taupe" />
                <span className="text-boho-brown">{client.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-boho-taupe" />
                <span className="text-boho-brown">{client.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-boho-taupe" />
                <span className="text-boho-brown">NUIT: {client.nuit}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-boho-taupe" />
                <span className="text-boho-brown truncate">{client.address}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-boho-beige">
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-boho-taupe">Cotações</p>
                  <p className="font-semibold text-boho-coffee">{client.totalQuotes}</p>
                </div>
                <div>
                  <p className="text-xs text-boho-taupe">Total Gasto</p>
                  <p className="font-semibold text-boho-coffee">
                    MZN {client.totalSpent.toLocaleString('pt-MZ')}
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-boho-sand hover:bg-boho-beige text-boho-coffee rounded-lg font-medium transition-colors">
                Ver detalhes
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
