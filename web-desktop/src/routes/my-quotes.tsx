import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  Plus, Search, Filter, Eye, CheckCircle, X, 
  MessageSquare, Download, Calendar, RefreshCw,
  Clock, DollarSign, FileText
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/my-quotes')({
  component: MyQuotesPage,
})

const MOCK_QUOTES = [
  {
    id: 'C/2024/0001',
    description: 'Consultoria Fiscal - Q1 2024',
    amount: 45000,
    status: 'ACEITE',
    date: '2024-01-15',
    validUntil: '2024-02-15',
    items: [
      { description: 'Consultoria mensal', qty: 3, price: 15000, total: 45000 }
    ],
    history: [
      { date: '2024-01-15', action: 'Cotação criada', actor: 'Sistema' },
      { date: '2024-01-16', action: 'Visualizada', actor: 'Você' },
      { date: '2024-01-17', action: 'Aceite', actor: 'Você' }
    ]
  },
  {
    id: 'C/2024/0002',
    description: 'Despacho Aduaneiro - Container 40ft',
    amount: 8500,
    status: 'EM_NEGOCIACAO',
    date: '2024-01-20',
    validUntil: '2024-02-05',
    items: [
      { description: 'Despacho container 40ft', qty: 1, price: 8500, total: 8500 },
      { description: 'Taxa de armazenagem', qty: 1, price: 2500, total: 2500 }
    ],
    history: [
      { date: '2024-01-20', action: 'Cotação criada', actor: 'Sistema' },
      { date: '2024-01-21', action: 'Contra-proposta enviada', actor: 'Você' }
    ],
    counterOffer: {
      proposedAmount: 7500,
      reason: 'Orçamento limitado para este trimestre'
    }
  },
  {
    id: 'C/2024/0003',
    description: 'Elaboração de Documentos Fiscais',
    amount: 12000,
    status: 'PENDENTE',
    date: '2024-02-01',
    validUntil: '2024-02-15',
    items: [
      { description: 'Declarações IVA', qty: 3, price: 3000, total: 9000 },
      { description: 'Relatório trimestral', qty: 1, price: 3000, total: 3000 }
    ],
    history: [
      { date: '2024-02-01', action: 'Cotação criada', actor: 'Sistema' }
    ]
  },
  {
    id: 'C/2024/0004',
    description: 'Auditoria Fiscal Completa',
    amount: 75000,
    status: 'REJEITADA',
    date: '2024-01-10',
    validUntil: '2024-01-25',
    items: [
      { description: 'Auditoria anual', qty: 1, price: 75000, total: 75000 }
    ],
    history: [
      { date: '2024-01-10', action: 'Cotação criada', actor: 'Sistema' },
      { date: '2024-01-12', action: 'Rejeitada', actor: 'Você', reason: 'Valor acima do orçamento' }
    ]
  },
  {
    id: 'C/2024/0005',
    description: 'Registro de Empresa',
    amount: 25000,
    status: 'FATURADA',
    date: '2023-12-15',
    validUntil: '2023-12-30',
    items: [
      { description: 'Abertura de empresa', qty: 1, price: 25000, total: 25000 }
    ],
    history: [
      { date: '2023-12-15', action: 'Cotação criada', actor: 'Sistema' },
      { date: '2023-12-16', action: 'Aceite', actor: 'Você' },
      { date: '2023-12-17', action: 'Faturada', actor: 'Sistema' },
      { date: '2023-12-18', action: 'Paga', actor: 'Você' }
    ],
    invoice: 'FT/2023/0156'
  }
]

function MyQuotesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedQuote, setSelectedQuote] = useState<typeof MOCK_QUOTES[0] | null>(null)
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false)
  const [counterAmount, setCounterAmount] = useState('')
  const [counterReason, setCounterReason] = useState('')

  const filteredQuotes = MOCK_QUOTES.filter(quote => {
    const matchesSearch = quote.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      'ACEITE': { 
        bg: 'bg-boho-sage/10', 
        text: 'text-boho-sage', 
        label: 'Aceite',
        icon: CheckCircle
      },
      'EM_NEGOCIACAO': { 
        bg: 'bg-boho-mustard/10', 
        text: 'text-boho-mustard', 
        label: 'Em Negociação',
        icon: MessageSquare
      },
      'PENDENTE': { 
        bg: 'bg-boho-terracotta/10', 
        text: 'text-boho-terracotta', 
        label: 'Pendente',
        icon: Clock
      },
      'REJEITADA': { 
        bg: 'bg-red-100', 
        text: 'text-red-600', 
        label: 'Rejeitada',
        icon: X
      },
      'FATURADA': { 
        bg: 'bg-boho-coffee/10', 
        text: 'text-boho-coffee', 
        label: 'Faturada',
        icon: DollarSign
      }
    }
    return configs[status] || configs['PENDENTE']
  }

  const handleAcceptQuote = (quoteId: string) => {
    console.log('Aceitar cotação:', quoteId)
    // Implementar aceite
  }

  const handleRejectQuote = (quoteId: string) => {
    console.log('Rejeitar cotação:', quoteId)
    // Implementar rejeição
  }

  const handleCounterOffer = () => {
    console.log('Enviar contra-proposta:', { quoteId: selectedQuote?.id, amount: counterAmount, reason: counterReason })
    setShowCounterOfferModal(false)
    setCounterAmount('')
    setCounterReason('')
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-boho-coffee mb-1">
            Minhas Cotações
          </h1>
          <p className="text-boho-brown">
            Gerencie suas solicitações e acompanhe negociações
          </p>
        </div>
        <button
          className="flex items-center justify-center gap-2 px-6 py-3 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-xl font-medium transition-colors shadow-boho"
        >
          <Plus size={20} />
          Nova Cotação
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-boho border border-boho-beige mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-taupe" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cotações..."
              className="w-full pl-12 pr-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:border-boho-terracotta transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta"
            >
              <option value="ALL">Todos os status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM_NEGOCIACAO">Em Negociação</option>
              <option value="ACEITE">Aceite</option>
              <option value="FATURADA">Faturada</option>
              <option value="REJEITADA">Rejeitada</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-3 border border-boho-beige hover:border-boho-terracotta rounded-xl text-boho-brown hover:text-boho-terracotta transition-colors">
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Todas', count: MOCK_QUOTES.length, color: 'bg-boho-coffee' },
          { label: 'Pendentes', count: MOCK_QUOTES.filter(q => q.status === 'PENDENTE').length, color: 'bg-boho-terracotta' },
          { label: 'Em Negociação', count: MOCK_QUOTES.filter(q => q.status === 'EM_NEGOCIACAO').length, color: 'bg-boho-mustard' },
          { label: 'Aceites', count: MOCK_QUOTES.filter(q => q.status === 'ACEITE').length, color: 'bg-boho-sage' },
          { label: 'Faturadas', count: MOCK_QUOTES.filter(q => q.status === 'FATURADA').length, color: 'bg-boho-coffee' },
        ].map((stat, i) => (
          <button
            key={i}
            onClick={() => setStatusFilter(stat.label === 'Todas' ? 'ALL' : stat.label.toUpperCase().replace(' ', '_'))}
            className={`p-4 rounded-xl border transition-all text-left ${
              (stat.label === 'Todas' && statusFilter === 'ALL') || 
              statusFilter === stat.label.toUpperCase().replace(' ', '_')
                ? 'bg-white border-boho-terracotta shadow-boho'
                : 'bg-white border-boho-beige hover:border-boho-terracotta'
            }`}
          >
            <p className="text-2xl font-display font-bold text-boho-coffee">{stat.count}</p>
            <p className="text-sm text-boho-brown">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Quotes List */}
      <div className="space-y-4">
        {filteredQuotes.map((quote) => {
          const statusConfig = getStatusConfig(quote.status)
          const StatusIcon = statusConfig.icon
          const isExpired = new Date(quote.validUntil) < new Date()

          return (
            <div 
              key={quote.id}
              className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige hover:shadow-boho-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left - Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${statusConfig.bg}`}>
                      <StatusIcon className={`w-6 h-6 ${statusConfig.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <span className="font-mono text-sm text-boho-terracotta">{quote.id}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                        {isExpired && quote.status === 'PENDENTE' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                            Expirada
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-display font-semibold text-boho-coffee">
                        {quote.description}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-boho-brown mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Criada em {new Date(quote.date).toLocaleDateString('pt-MZ')}
                    </span>
                    <span>•</span>
                    <span className={isExpired ? 'text-red-500' : ''}>
                      Válida até {new Date(quote.validUntil).toLocaleDateString('pt-MZ')}
                    </span>
                    <span>•</span>
                    <span>{quote.items.length} item(s)</span>
                  </div>

                  {/* Items Preview */}
                  <div className="bg-boho-cream rounded-xl p-4 mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-boho-taupe">
                          <th className="text-left py-2">Descrição</th>
                          <th className="text-center py-2">Qtd</th>
                          <th className="text-right py-2">Preço</th>
                          <th className="text-right py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.items.map((item, idx) => (
                          <tr key={idx} className="text-boho-coffee">
                            <td className="py-2">{item.description}</td>
                            <td className="text-center py-2">{item.qty}</td>
                            <td className="text-right py-2 font-mono">
                              MZN {item.price.toLocaleString('pt-MZ')}
                            </td>
                            <td className="text-right py-2 font-mono font-medium">
                              MZN {item.total.toLocaleString('pt-MZ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Counter Offer Info */}
                  {quote.counterOffer && (
                    <div className="bg-boho-mustard/10 border border-boho-mustard/20 rounded-xl p-4 mb-4">
                      <p className="text-sm font-medium text-boho-coffee mb-1">
                        Contra-proposta enviada
                      </p>
                      <p className="text-sm text-boho-brown">
                        Valor proposto: <span className="font-mono font-medium text-boho-mustard">
                          MZN {quote.counterOffer.proposedAmount.toLocaleString('pt-MZ')}
                        </span>
                      </p>
                      <p className="text-sm text-boho-brown mt-1">
                        Motivo: {quote.counterOffer.reason}
                      </p>
                    </div>
                  )}

                  {/* Invoice Info */}
                  {quote.invoice && (
                    <div className="flex items-center gap-2 text-sm text-boho-sage">
                      <DollarSign className="w-4 h-4" />
                      <span>Faturada: <span className="font-mono">{quote.invoice}</span></span>
                    </div>
                  )}
                </div>

                {/* Right - Actions */}
                <div className="lg:text-right">
                  <p className="text-3xl font-display font-bold text-boho-coffee mb-4">
                    MZN {quote.amount.toLocaleString('pt-MZ')}
                  </p>
                  
                  <div className="flex flex-wrap lg:flex-col gap-2">
                    <button
                      onClick={() => setSelectedQuote(quote)}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-boho-brown hover:text-boho-coffee hover:bg-boho-sand rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver detalhes
                    </button>

                    {quote.status === 'PENDENTE' && !isExpired && (
                      <>
                        <button
                          onClick={() => handleAcceptQuote(quote.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-boho-sage hover:bg-boho-olive text-white rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aceitar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuote(quote)
                            setShowCounterOfferModal(true)
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-boho-mustard hover:bg-boho-coffee text-white rounded-lg transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Contra-proposta
                        </button>
                        <button
                          onClick={() => handleRejectQuote(quote.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Rejeitar
                        </button>
                      </>
                    )}

                    {quote.status === 'EM_NEGOCIACAO' && (
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-boho-mustard hover:bg-boho-coffee text-white rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Ver negociação
                      </button>
                    )}

                    {quote.status === 'ACEITE' && (
                      <Link
                        to="/my-payments"
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-lg transition-colors"
                      >
                        <DollarSign className="w-4 h-4" />
                        Efetuar pagamento
                      </Link>
                    )}

                    {quote.status === 'FATURADA' && (
                      <>
                        <Link
                          to="/my-payments"
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-boho-sage hover:bg-boho-olive text-white rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Pagar agora
                        </Link>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 text-boho-brown hover:text-boho-coffee hover:bg-boho-sand rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                          Baixar proforma
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {filteredQuotes.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-boho border border-boho-beige">
            <div className="w-20 h-20 bg-boho-sand/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-boho-taupe" />
            </div>
            <h3 className="text-xl font-display font-semibold text-boho-coffee mb-2">
              Nenhuma cotação encontrada
            </h3>
            <p className="text-boho-brown mb-6">
              {searchTerm 
                ? 'Tente ajustar seus filtros de busca'
                : 'Você ainda não possui cotações. Solicite uma agora!'
              }
            </p>
            <button
              className="inline-flex items-center gap-2 px-6 py-3 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nova Cotação
            </button>
          </div>
        )}
      </div>

      {/* Counter Offer Modal */}
      {showCounterOfferModal && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-display font-semibold text-boho-coffee mb-2">
              Enviar Contra-proposta
            </h3>
            <p className="text-boho-brown mb-6">
              {selectedQuote.id} - Valor original: MZN {selectedQuote.amount.toLocaleString('pt-MZ')}
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-boho-coffee mb-2">
                  Valor Proposto (MZN)
                </label>
                <input
                  type="number"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  placeholder="Ex: 7500"
                  className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-boho-coffee mb-2">
                  Motivo (opcional)
                </label>
                <textarea
                  value={counterReason}
                  onChange={(e) => setCounterReason(e.target.value)}
                  placeholder="Explique o motivo da contra-proposta..."
                  rows={3}
                  className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta resize-none"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCounterOfferModal(false)
                  setCounterAmount('')
                  setCounterReason('')
                }}
                className="flex-1 py-3 border border-boho-beige hover:border-boho-terracotta text-boho-coffee rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCounterOffer}
                disabled={!counterAmount}
                className="flex-1 py-3 bg-boho-terracotta hover:bg-boho-coffee disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
              >
                Enviar Proposta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
