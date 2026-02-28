import { createFileRoute } from '@tanstack/react-router'
import { CreditCard, Banknote, Shield, X, Check, Loader2 } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { FiscalBadge } from '@/components/ui/fiscal-badge'
import { useState } from 'react'

export const Route = createFileRoute('/payments')({
  component: PaymentsPage,
})

const payments = [
  { id: 'PAY-001', proforma: 'P/2024/0015', client: 'ABC Lda.', amount: 12500, method: 'M-Pesa', status: 'PAGO', date: '2024-01-15' },
  { id: 'PAY-002', proforma: 'P/2024/0014', client: 'XYZ Comercial', amount: 8900, method: 'Numerário', status: 'PENDENTE', date: '2024-01-14' },
  { id: 'PAY-003', proforma: 'P/2024/0013', client: 'Mega Store', amount: 23400, method: 'Escrow', status: 'EM_PROCESSAMENTO', date: '2024-01-13' },
  { id: 'PAY-004', proforma: 'P/2024/0012', client: 'Global Services', amount: 15600, method: 'Cartão', status: 'FALHADO', date: '2024-01-12' },
]

function PaymentsPage() {
  const [showModal, setShowModal] = useState(false)
  const [selectedProforma, setSelectedProforma] = useState<string | null>(null)

  const handleNewPayment = (proformaId: string) => {
    setSelectedProforma(proformaId)
    setShowModal(true)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-primary">Pagamentos</h1>
        <p className="text-fm-muted mt-1">Gerencie pagamentos e transações</p>
      </div>

      {/* Payment Methods Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <PaymentMethodCard
          icon={<CreditCard className="w-6 h-6" />}
          name="M-Pesa"
          count={12}
          volume="MZN 125.000"
          color="from-purple-500/20 to-purple-600/10"
        />
        <PaymentMethodCard
          icon={<Banknote className="w-6 h-6" />}
          name="Numerário"
          count={8}
          volume="MZN 45.000"
          color="from-green-500/20 to-green-600/10"
        />
        <PaymentMethodCard
          icon={<CreditCard className="w-6 h-6" />}
          name="Cartão"
          count={5}
          volume="MZN 67.000"
          color="from-blue-500/20 to-blue-600/10"
        />
        <PaymentMethodCard
          icon={<Shield className="w-6 h-6" />}
          name="Escrow"
          count={3}
          volume="MZN 89.000"
          color="from-amber-500/20 to-amber-600/10"
        />
      </div>

      {/* Payments Table */}
      <FiscalCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Transações Recentes</h2>
          <button
            onClick={() => handleNewPayment('P/2024/0016')}
            className="px-4 py-2 bg-fm-accent hover:bg-[#4F5BC0] text-white rounded-lg font-medium transition-colors"
          >
            Novo Pagamento
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-fm-default">
              <th className="text-left py-4 px-4 text-fm-muted font-medium">ID</th>
              <th className="text-left py-4 px-4 text-fm-muted font-medium">Proforma</th>
              <th className="text-left py-4 px-4 text-fm-muted font-medium">Cliente</th>
              <th className="text-left py-4 px-4 text-fm-muted font-medium">Método</th>
              <th className="text-right py-4 px-4 text-fm-muted font-medium">Valor</th>
              <th className="text-center py-4 px-4 text-fm-muted font-medium">Status</th>
              <th className="text-left py-4 px-4 text-fm-muted font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-fm-default/50 hover:bg-fm-primary/50">
                <td className="py-4 px-4 text-fm-accent font-mono font-medium">{payment.id}</td>
                <td className="py-4 px-4 text-fm-primary">{payment.proforma}</td>
                <td className="py-4 px-4 text-fm-primary">{payment.client}</td>
                <td className="py-4 px-4">
                  <span className="flex items-center gap-2 text-fm-muted">
                    {payment.method === 'M-Pesa' && <CreditCard size={16} />}
                    {payment.method === 'Numerário' && <Banknote size={16} />}
                    {payment.method === 'Escrow' && <Shield size={16} />}
                    {payment.method}
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-mono">
                  MZN {payment.amount.toLocaleString('pt-MZ')}
                </td>
                <td className="py-4 px-4 text-center">
                  <FiscalBadge status={payment.status as any} />
                </td>
                <td className="py-4 px-4 text-fm-muted">{payment.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </FiscalCard>

      {/* Payment Modal */}
      {showModal && (
        <PaymentModal
          proformaId={selectedProforma}
          amount={12500}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function PaymentMethodCard({ icon, name, count, volume, color }: {
  icon: React.ReactNode
  name: string
  count: number
  volume: string
  color: string
}) {
  return (
    <FiscalCard className={`bg-gradient-to-br ${color} border-transparent`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-fm-primary/50 rounded-lg text-fm-primary">
          {icon}
        </div>
        <span className="text-2xl font-bold text-fm-primary">{count}</span>
      </div>
      <h3 className="text-fm-primary font-medium mb-1">{name}</h3>
      <p className="text-sm text-fm-muted">Volume: {volume}</p>
    </FiscalCard>
  )
}

// Payment Modal Component
function PaymentModal({ proformaId, amount, onClose }: { proformaId: string | null; amount: number; onClose: () => void }) {
  const [step, setStep] = useState<'method' | 'summary' | 'processing' | 'success'>('method')
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [, setIsProcessing] = useState(false)

  const methods = [
    { id: 'mpesa', name: 'M-Pesa', icon: <CreditCard size={24} />, description: 'Pagamento via M-Pesa' },
    { id: 'cash', name: 'Numerário', icon: <Banknote size={24} />, description: 'Pagamento em dinheiro' },
    { id: 'card', name: 'Cartão', icon: <CreditCard size={24} />, description: 'Cartão de crédito/débito' },
    { id: 'escrow', name: 'Escrow', icon: <Shield size={24} />, description: 'Pagamento em escrow' },
  ]

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
    setStep('summary')
  }

  const handleConfirm = () => {
    setStep('processing')
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setStep('success')
    }, 3000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-lg bg-fm-secondary rounded-2xl border border-fm-default shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-fm-default">
          <div>
            <h2 className="text-xl font-bold text-fm-primary">
              {step === 'method' && 'Método de Pagamento'}
              {step === 'summary' && 'Confirmar Pagamento'}
              {step === 'processing' && 'Processando...'}
              {step === 'success' && 'Pagamento Concluído'}
            </h2>
            <p className="text-sm text-fm-muted mt-1">
              {proformaId && `Proforma: ${proformaId}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-fm-tertiary rounded-lg text-fm-muted"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'method' && (
            <div className="space-y-3">
              {methods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className="w-full flex items-center gap-4 p-4 bg-fm-primary hover:bg-fm-tertiary border border-fm-default hover:border-[#5E6AD2] rounded-xl transition-colors text-left"
                >
                  <div className="p-3 bg-fm-accent/10 rounded-lg text-fm-accent">
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-fm-primary font-medium">{method.name}</h3>
                    <p className="text-sm text-fm-muted">{method.description}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-fm-default" />
                </button>
              ))}
            </div>
          )}

          {step === 'summary' && (
            <div className="space-y-6">
              <div className="p-4 bg-fm-primary rounded-xl space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-fm-muted">Proforma</span>
                  <span className="text-fm-primary font-mono">{proformaId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-fm-muted">Método</span>
                  <span className="text-fm-primary">
                    {methods.find(m => m.id === selectedMethod)?.name}
                  </span>
                </div>
                <div className="border-t border-fm-default pt-3 flex justify-between">
                  <span className="text-fm-primary font-medium">Total a Pagar</span>
                  <span className="text-2xl font-bold text-fm-accent font-mono">
                    MZN {amount.toLocaleString('pt-MZ')}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('method')}
                  className="flex-1 py-3 border border-fm-default hover:border-[#6E7681] text-fm-muted rounded-lg font-medium transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 bg-fm-accent hover:bg-[#4F5BC0] text-white rounded-lg font-medium transition-colors"
                >
                  Confirmar Pagamento
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-fm-default rounded-full" />
                <div className="absolute inset-0 border-4 border-[#5E6AD2] rounded-full border-t-transparent animate-spin" />
                <Loader2 className="absolute inset-0 m-auto text-fm-accent animate-spin" size={24} />
              </div>
              <h3 className="text-lg font-medium text-fm-primary mb-2">Processando pagamento</h3>
              <p className="text-fm-muted">Aguarde enquanto processamos sua transação...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-[#10B981]/10 rounded-full flex items-center justify-center">
                <Check className="text-[#10B981]" size={32} />
              </div>
              <h3 className="text-lg font-medium text-fm-primary mb-2">Pagamento confirmado!</h3>
              <p className="text-fm-muted mb-6">
                O pagamento de MZN {amount.toLocaleString('pt-MZ')} foi processado com sucesso.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 bg-fm-accent hover:bg-[#4F5BC0] text-white rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
