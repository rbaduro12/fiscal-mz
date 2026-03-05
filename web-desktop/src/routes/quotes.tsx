import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus, Search, Filter, MoreVertical, Loader2, AlertTriangle, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useSentQuotes, useReceivedQuotes } from '@/hooks/use-quote-workflow'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { StatusBadge } from '@/components/cotacoes/status-badge'
import type { Cotacao } from '@/services/cotacoes.service'

export const Route = createFileRoute('/quotes')({
  component: QuotesPage,
})

const statusOptions = [
  { value: '', label: 'Todos os Status' },
  { value: 'RASCUNHO', label: 'Rascunho' },
  { value: 'ENVIADA', label: 'Enviada' },
  { value: 'ACEITE', label: 'Aceite' },
  { value: 'REJEITADA', label: 'Rejeitada' },
  { value: 'CONVERTIDA', label: 'Convertida' },
  { value: 'EXPIRADA', label: 'Expirada' },
]

const tabs = [
  { id: 'enviadas', label: 'Enviadas', icon: FileText },
  { id: 'recebidas', label: 'Recebidas', icon: FileText },
]

function QuotesPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('enviadas')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const { data: cotacoesEnviadas = [], isLoading: isLoadingEnviadas, isError, error } = useSentQuotes({
    status: statusFilter || undefined,
    page,
    limit,
  })

  const { data: cotacoesRecebidas = [], isLoading: isLoadingRecebidas } = useReceivedQuotes({
    status: statusFilter || undefined,
    page,
    limit,
  })

  const cotacoes = activeTab === 'enviadas' ? cotacoesEnviadas : cotacoesRecebidas
  const isLoading = activeTab === 'enviadas' ? isLoadingEnviadas : isLoadingRecebidas

  // Filtrar por busca
  const cotacoesFiltradas = search
    ? cotacoes.filter((c: Cotacao) =>
        c.numero.toLowerCase().includes(search.toLowerCase())
      )
    : cotacoes

  const total = cotacoesFiltradas.length
  const totalPages = Math.ceil(total / limit)

  // Estatísticas
  const stats = {
    total: cotacoes.length,
    enviadas: cotacoes.filter((c: Cotacao) => c.status === 'ENVIADA').length,
    aceites: cotacoes.filter((c: Cotacao) => c.status === 'ACEITE').length,
    convertidas: cotacoes.filter((c: Cotacao) => c.status === 'CONVERTIDA').length,
    valorTotal: cotacoes.reduce((acc: number, c: Cotacao) => acc + Number(c.total), 0),
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-boho-accent animate-spin" />
          <p className="text-boho-brown">Carregando cotações...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-boho-coffee mb-2">Erro ao carregar cotações</h2>
          <p className="text-boho-brown mb-4">{(error as Error)?.message || 'Não foi possível carregar as cotações.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-boho-accent text-white rounded-lg hover:bg-boho-accent-hover transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-boho-coffee">Cotações</h1>
          <p className="text-boho-brown mt-1">Gerencie suas cotações e propostas comerciais</p>
        </div>
        <button
          onClick={() => navigate({ to: '/quotes/new' })}
          className="flex items-center gap-2 px-6 py-3 bg-boho-accent hover:bg-boho-accent-hover text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nova Cotação
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <FiscalCard className="bg-gradient-to-br from-boho-accent/5 to-boho-accent/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-boho-accent/20 rounded-xl flex items-center justify-center">
              <FileText className="text-boho-accent" size={24} />
            </div>
            <div>
              <p className="text-sm text-boho-taupe">Total Cotações</p>
              <p className="text-2xl font-bold text-boho-coffee">{stats.total}</p>
            </div>
          </div>
        </FiscalCard>

        <FiscalCard className="bg-gradient-to-br from-blue-50 to-blue-100/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Clock className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-boho-taupe">Enviadas</p>
              <p className="text-2xl font-bold text-boho-coffee">{stats.enviadas}</p>
            </div>
          </div>
        </FiscalCard>

        <FiscalCard className="bg-gradient-to-br from-green-50 to-green-100/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-boho-taupe">Aceites</p>
              <p className="text-2xl font-bold text-boho-coffee">{stats.aceites}</p>
            </div>
          </div>
        </FiscalCard>

        <FiscalCard className="bg-gradient-to-br from-purple-50 to-purple-100/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-boho-taupe">Valor Total</p>
              <p className="text-2xl font-bold text-boho-coffee">
                MZN {stats.valorTotal.toLocaleString('pt-MZ')}
              </p>
            </div>
          </div>
        </FiscalCard>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-boho-beige">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setPage(1)
              }}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-boho-accent border-boho-accent'
                  : 'text-boho-brown border-transparent hover:text-boho-coffee'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <FiscalCard className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-boho-taupe" size={20} />
            <input
              type="text"
              placeholder="Buscar por número da cotação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-boho-taupe" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="pl-10 pr-8 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50 cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FiscalCard>

      {/* Quotes Table */}
      <FiscalCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-boho-beige">
                <th className="text-left py-4 px-4 text-boho-taupe font-medium">Nº Cotação</th>
                <th className="text-left py-4 px-4 text-boho-taupe font-medium">Cliente</th>
                <th className="text-left py-4 px-4 text-boho-taupe font-medium">Data</th>
                <th className="text-left py-4 px-4 text-boho-taupe font-medium">Validade</th>
                <th className="text-right py-4 px-4 text-boho-taupe font-medium">Valor</th>
                <th className="text-center py-4 px-4 text-boho-taupe font-medium">Status</th>
                <th className="py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {cotacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 text-boho-taupe" />
                      <p className="text-boho-brown">
                        {activeTab === 'enviadas' 
                          ? 'Nenhuma cotação enviada' 
                          : 'Nenhuma cotação recebida'}
                      </p>
                      {activeTab === 'enviadas' && (
                        <button
                          onClick={() => navigate({ to: '/quotes/new' })}
                          className="text-boho-accent hover:text-boho-accent-hover font-medium"
                        >
                          Criar primeira cotação
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                cotacoesFiltradas.map((cotacao: Cotacao) => (
                  <tr
                    key={cotacao.id}
                    className="border-b border-boho-beige/50 hover:bg-boho-sand/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <a
                        href={`/quotes/${cotacao.id}`}
                        className="text-boho-accent font-mono font-medium hover:underline"
                      >
                        {cotacao.numero}
                      </a>
                    </td>
                    <td className="py-4 px-4 text-boho-coffee">
                      Cliente #{cotacao.clienteId?.slice(0, 8)}
                    </td>
                    <td className="py-4 px-4 text-boho-brown">
                      {new Date(cotacao.createdAt).toLocaleDateString('pt-MZ')}
                    </td>
                    <td className="py-4 px-4 text-boho-brown">
                      {cotacao.dataExpiracao
                        ? new Date(cotacao.dataExpiracao).toLocaleDateString('pt-MZ')
                        : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-boho-coffee">
                      MZN {Number(cotacao.total).toLocaleString('pt-MZ')}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={cotacao.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <a
                        href={`/quotes/${cotacao.id}`}
                        className="p-2 hover:bg-boho-sand rounded-lg text-boho-taupe hover:text-boho-coffee transition-colors"
                      >
                        <MoreVertical size={18} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-boho-beige">
            <p className="text-sm text-boho-brown">
              Mostrando {Math.min((page - 1) * limit + 1, total)} - {Math.min(page * limit, total)} de {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-boho-beige rounded-lg text-boho-brown hover:bg-boho-sand disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-boho-coffee">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-boho-beige rounded-lg text-boho-brown hover:bg-boho-sand disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </FiscalCard>
    </div>
  )
}
