import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Search, Filter, MoreVertical, Loader2, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useCotacoes } from '@/hooks/use-documentos'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { FiscalBadge } from '@/components/ui/fiscal-badge'

export const Route = createFileRoute('/quotes')({
  component: QuotesPage,
})

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'RASCUNHO', label: 'Rascunho' },
  { value: 'EMITIDA', label: 'Emitida' },
  { value: 'ACEITE', label: 'Aceite' },
  { value: 'REJEITADA', label: 'Rejeitada' },
  { value: 'PROCESSADA', label: 'Processada' },
]

function QuotesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError, error } = useCotacoes({
    estado: statusFilter || undefined,
    page,
    limit,
  })

  const cotacoes = data?.items || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / limit)

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
          <p className="text-boho-brown mb-4">{error?.message || 'Não foi possível carregar as cotações.'}</p>
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
        <Link
          to="/quotes/new"
          className="flex items-center gap-2 px-6 py-3 bg-boho-accent hover:bg-boho-accent-hover text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nova Cotação
        </Link>
      </div>

      {/* Filters */}
      <FiscalCard className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-boho-taupe" size={20} />
            <input
              type="text"
              placeholder="Buscar cotações por número ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-accent/50 focus:border-boho-accent transition-all"
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
              className="pl-10 pr-8 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50 focus:border-boho-accent transition-all appearance-none cursor-pointer"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </FiscalCard>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm">Total</p>
          <p className="text-2xl font-bold text-boho-coffee">{total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm">Rascunhos</p>
          <p className="text-2xl font-bold text-boho-mustard">
            {cotacoes.filter((c: any) => c.estado === 'RASCUNHO').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm">Emitidas</p>
          <p className="text-2xl font-bold text-boho-accent">
            {cotacoes.filter((c: any) => c.estado === 'EMITIDA').length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-boho border border-boho-beige">
          <p className="text-boho-taupe text-sm">Aceites</p>
          <p className="text-2xl font-bold text-boho-sage">
            {cotacoes.filter((c: any) => c.estado === 'ACEITE').length}
          </p>
        </div>
      </div>

      {/* Quotes Table */}
      <FiscalCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-boho-beige">
                <th className="text-left py-4 px-4 text-boho-taupe font-medium">Nº Cotação</th>
                <th className="text-left py-4 px-4 text-boho-taupe font-medium">Cliente</th>
                <th className="text-left py-4 px-4 text-boho-taupe font-medium">Data Emissão</th>
                <th className="text-left py-4 px-4 text-boho-taupe font-medium">Validade</th>
                <th className="text-right py-4 px-4 text-boho-taupe font-medium">Valor</th>
                <th className="text-center py-4 px-4 text-boho-taupe font-medium">Status</th>
                <th className="py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {cotacoes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-boho-brown">
                    <div className="flex flex-col items-center gap-3">
                      <FileTextIcon className="w-12 h-12 text-boho-taupe" />
                      <p>Nenhuma cotação encontrada</p>
                      <Link
                        to="/quotes/new"
                        className="text-boho-accent hover:text-boho-accent-hover font-medium"
                      >
                        Criar primeira cotação
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                cotacoes.map((cotacao: any) => (
                  <tr key={cotacao.id} className="border-b border-boho-beige/50 hover:bg-boho-sand/30 transition-colors">
                    <td className="py-4 px-4">
                      <Link
                        to={`/quotes/${cotacao.id}`}
                        className="text-boho-accent font-mono font-medium hover:underline"
                      >
                        {cotacao.numeroCompleto}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-boho-coffee">
                      {cotacao.entidade?.nome || 'Cliente não identificado'}
                    </td>
                    <td className="py-4 px-4 text-boho-brown">
                      {new Date(cotacao.dataEmissao).toLocaleDateString('pt-MZ')}
                    </td>
                    <td className="py-4 px-4 text-boho-brown">
                      {cotacao.dataValidade 
                        ? new Date(cotacao.dataValidade).toLocaleDateString('pt-MZ')
                        : 'N/A'
                      }
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-boho-coffee">
                      MZN {(cotacao.totalPagar || 0).toLocaleString('pt-MZ')}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <FiscalBadge status={cotacao.estado} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/quotes/${cotacao.id}`}
                        className="p-2 hover:bg-boho-sand rounded-lg text-boho-taupe hover:text-boho-coffee transition-colors"
                      >
                        <MoreVertical size={18} />
                      </Link>
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
              Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-boho-beige rounded-lg text-boho-brown hover:bg-boho-sand disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-boho-coffee">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
