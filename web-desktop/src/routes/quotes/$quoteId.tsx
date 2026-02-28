import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Check, X, RefreshCw, Clock } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { FiscalBadge } from '@/components/ui/fiscal-badge'
import { useState } from 'react'

export const Route = createFileRoute('/quotes/$quoteId')({
  component: QuoteDetailPage,
})

function QuoteDetailPage() {
  const { quoteId } = Route.useParams()
  const [showCounterOffer, setShowCounterOffer] = useState(false)
  const [counterAmount, setCounterAmount] = useState('')

  const quote = {
    id: quoteId,
    client: 'ABC Lda.',
    clientNuit: '123456789',
    clientEmail: 'contato@abclda.co.mz',
    clientPhone: '+258 84 123 4567',
    amount: 12500,
    date: '2024-01-15',
    validUntil: '2024-01-30',
    status: 'EM_NEGOCIACAO',
    items: [
      { description: 'Serviço de Consultoria Fiscal', qty: 10, price: 500, total: 5000 },
      { description: 'Elaboração de Documentos', qty: 5, price: 800, total: 4000 },
      { description: 'Taxa de Despacho Aduaneiro', qty: 1, price: 3500, total: 3500 },
    ],
    history: [
      { event: 'COTAÇÃO_CRIADA', date: '2024-01-15T10:30:00', actor: 'Você', notes: 'Cotação enviada ao cliente' },
      { event: 'VISUALIZADA', date: '2024-01-15T14:22:00', actor: 'ABC Lda.', notes: 'Cliente visualizou a cotação' },
      { event: 'CONTRA_PROPOSTA', date: '2024-01-16T09:15:00', actor: 'ABC Lda.', notes: 'Proposta: MZN 11.000' },
      { event: 'CONTRA_PROPOSTA', date: '2024-01-16T11:30:00', actor: 'Você', notes: 'Contra-proposta: MZN 12.500' },
    ],
  }

  const handleAccept = () => {
    console.log('Accept quote')
  }

  const handleReject = () => {
    console.log('Reject quote')
  }

  const handleCounterOffer = () => {
    if (showCounterOffer) {
      console.log('Submit counter offer:', counterAmount)
      setShowCounterOffer(false)
    } else {
      setShowCounterOffer(true)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/quotes" className="p-2 hover:bg-fm-tertiary rounded-lg text-fm-muted">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-fm-primary">Cotação {quoteId}</h1>
          <div className="flex items-center gap-3 mt-1">
            <FiscalBadge status={quote.status as any} />
            <span className="text-fm-muted">Válida até {quote.validUntil}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-6">Timeline da Negociação</h2>
            <div className="space-y-6">
              {quote.history.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-fm-accent-10 flex items-center justify-center">
                      {event.event === 'COTAÇÃO_CRIADA' && <Clock className="w-5 h-5 text-fm-accent" />}
                      {event.event === 'VISUALIZADA' && <Check className="w-5 h-5 text-fm-success" />}
                      {event.event === 'CONTRA_PROPOSTA' && <RefreshCw className="w-5 h-5 text-fm-warning" />}
                    </div>
                    {index < quote.history.length - 1 && (
                      <div className="w-px flex-1 bg-fm-default my-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-fm-primary">{event.event.replace(/_/g, ' ')}</span>
                      <span className="text-sm text-fm-muted">{new Date(event.date).toLocaleString('pt-MZ')}</span>
                    </div>
                    <p className="text-fm-muted">{event.actor}</p>
                    {event.notes && (
                      <p className="text-sm text-[#8B949E] mt-1 bg-fm-primary p-2 rounded">{event.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </FiscalCard>

          {/* Items */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4">Itens da Cotação</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-fm-default">
                  <th className="text-left py-3 text-fm-muted font-medium">Descrição</th>
                  <th className="text-center py-3 text-fm-muted font-medium">Qtd</th>
                  <th className="text-right py-3 text-fm-muted font-medium">Preço</th>
                  <th className="text-right py-3 text-fm-muted font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, i) => (
                  <tr key={i} className="border-b border-fm-default/50">
                    <td className="py-3 text-fm-primary">{item.description}</td>
                    <td className="py-3 text-center text-fm-muted">{item.qty}</td>
                    <td className="py-3 text-right font-mono text-fm-muted">
                      MZN {item.price.toLocaleString('pt-MZ')}
                    </td>
                    <td className="py-3 text-right font-mono text-fm-primary">
                      MZN {item.total.toLocaleString('pt-MZ')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="py-4 text-right font-medium text-fm-primary">Total:</td>
                  <td className="py-4 text-right font-mono text-xl font-bold text-fm-accent">
                    MZN {quote.amount.toLocaleString('pt-MZ')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </FiscalCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4">Dados do Cliente</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-fm-muted">Nome</label>
                <p className="text-fm-primary">{quote.client}</p>
              </div>
              <div>
                <label className="text-xs text-fm-muted">NUIT</label>
                <p className="text-fm-primary font-mono">{quote.clientNuit}</p>
              </div>
              <div>
                <label className="text-xs text-fm-muted">Email</label>
                <p className="text-fm-primary">{quote.clientEmail}</p>
              </div>
              <div>
                <label className="text-xs text-fm-muted">Telefone</label>
                <p className="text-fm-primary">{quote.clientPhone}</p>
              </div>
            </div>
          </FiscalCard>

          {/* Actions */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4">Ações</h2>
            <div className="space-y-3">
              {showCounterOffer ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-fm-muted block mb-2">Nova contra-proposta (MZN)</label>
                    <input
                      type="number"
                      value={counterAmount}
                      onChange={(e) => setCounterAmount(e.target.value)}
                      placeholder="Ex: 11000"
                      className="w-full px-3 py-2 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCounterOffer}
                      className="flex-1 px-4 py-2 bg-fm-accent hover:bg-[#4F5BC0] text-white rounded-lg font-medium"
                    >
                      Enviar
                    </button>
                    <button
                      onClick={() => setShowCounterOffer(false)}
                      className="px-4 py-2 border border-fm-default hover:border-[#6E7681] text-fm-muted rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleAccept}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-fm-success hover:bg-[#059669] text-white rounded-lg font-medium transition-colors"
                  >
                    <Check size={18} />
                    Aceitar Cotação
                  </button>
                  <button
                    onClick={handleCounterOffer}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-fm-accent hover:bg-[#4F5BC0] text-white rounded-lg font-medium transition-colors"
                  >
                    <RefreshCw size={18} />
                    Contra-Proposta
                  </button>
                  <button
                    onClick={handleReject}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-fm-error text-fm-error hover:bg-fm-error-10 rounded-lg font-medium transition-colors"
                  >
                    <X size={18} />
                    Rejeitar
                  </button>
                </>
              )}
            </div>
          </FiscalCard>
        </div>
      </div>
    </div>
  )
}
