import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, Search, Filter, MoreVertical } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { FiscalBadge } from '@/components/ui/fiscal-badge'

export const Route = createFileRoute('/quotes')({
  component: QuotesPage,
})

const quotes = [
  { id: 'C/2024/0042', client: 'ABC Lda.', amount: 12500, status: 'EM_NEGOCIACAO', date: '2024-01-15' },
  { id: 'C/2024/0041', client: 'XYZ Comercial', amount: 8900, status: 'PENDENTE', date: '2024-01-14' },
  { id: 'C/2024/0040', client: 'Mega Store', amount: 23400, status: 'ACEITE', date: '2024-01-13' },
  { id: 'C/2024/0039', client: 'Global Services', amount: 15600, status: 'REJEITADA', date: '2024-01-12' },
  { id: 'C/2024/0038', client: 'Tech Solutions', amount: 32100, status: 'FATURADA', date: '2024-01-10' },
]

function QuotesPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-fm-primary">Cotações</h1>
          <p className="text-fm-muted mt-1">Gerencie suas cotações e negociações</p>
        </div>
        <Link
          to="/quotes/new"
          className="flex items-center gap-2 px-6 py-3 bg-fm-accent hover:bg-fm-accent-hover text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Nova Cotação
        </Link>
      </div>

      {/* Filters */}
      <FiscalCard className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-fm-muted" size={20} />
            <input
              type="text"
              placeholder="Buscar cotações..."
              className="w-full pl-10 pr-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary placeholder:text-fm-muted focus:outline-none focus:border-fm-accent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 border border-fm-default rounded-lg text-fm-muted hover:border-fm-accent transition-colors">
            <Filter size={18} />
            Filtros
          </button>
        </div>
      </FiscalCard>

      {/* Quotes Table */}
      <FiscalCard>
        <table className="w-full">
          <thead>
            <tr className="border-b border-fm-default">
              <th className="text-left py-4 px-4 text-fm-muted font-medium">Nº Cotação</th>
              <th className="text-left py-4 px-4 text-fm-muted font-medium">Cliente</th>
              <th className="text-left py-4 px-4 text-fm-muted font-medium">Data</th>
              <th className="text-right py-4 px-4 text-fm-muted font-medium">Valor</th>
              <th className="text-center py-4 px-4 text-fm-muted font-medium">Status</th>
              <th className="py-4 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.id} className="border-b border-fm-default/50 hover:bg-fm-primary/50">
                <td className="py-4 px-4">
                  <Link
                    to={'/quotes/$quoteId'} params={{ quoteId: quote.id }}
                    className="text-fm-accent font-mono font-medium hover:underline"
                  >
                    {quote.id}
                  </Link>
                </td>
                <td className="py-4 px-4 text-fm-primary">{quote.client}</td>
                <td className="py-4 px-4 text-fm-muted">{quote.date}</td>
                <td className="py-4 px-4 text-right font-mono">
                  MZN {quote.amount.toLocaleString('pt-MZ')}
                </td>
                <td className="py-4 px-4 text-center">
                  <FiscalBadge status={quote.status as any} />
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="p-2 hover:bg-fm-tertiary rounded-lg text-fm-muted">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </FiscalCard>
    </div>
  )
}
