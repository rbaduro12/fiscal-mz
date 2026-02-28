import { createFileRoute } from '@tanstack/react-router'
import { 
  CreditCard, CheckCircle, Clock, AlertCircle, Download, 
  ArrowRight, Smartphone, Banknote, Shield,
  ChevronRight, Eye, X
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/my-payments')({
  component: MyPaymentsPage,
})

const MOCK_PAYMENTS = [
  {
    id: 'PAY-2024-0001',
    description: 'Fatura FT/2024/0001 - Janeiro 2024',
    amount: 15000,
    method: 'M-Pesa',
    date: '2024-02-05',
    status: 'CONFIRMADO',
    reference: 'MP240205123456',
    documentId: 'FT/2024/0001'
  },
  {
    id: 'PAY-2024-0002',
    description: 'Proforma PF/2024/0001 - Despacho Aduaneiro',
    amount: 8500,
    method: 'Transferência Bancária',
    date: null,
    status: 'PENDENTE',
    reference: null,
    documentId: 'PF/2024/0001',
    dueDate: '2024-02-15'
  },
  {
    id: 'PAY-2024-0003',
    description: 'Fatura FT/2024/0002 - Fevereiro 2024',
    amount: 15000,
    method: null,
    date: null,
    status: 'PENDENTE',
    reference: null,
    documentId: 'FT/2024/0002',
    dueDate: '2024-03-05'
  },
  {
    id: 'PAY-2023-0156',
    description: 'Fatura FT/2023/0156 - Registro Empresa',
    amount: 25000,
    method: 'M-Pesa',
    date: '2023-12-18',
    status: 'CONFIRMADO',
    reference: 'MP231218789012',
    documentId: 'FT/2023/0156'
  }
]

function MyPaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState<typeof MOCK_PAYMENTS[0] | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'mpesa' | 'bank' | 'card' | null>(null)
  const [paymentStep, setPaymentStep] = useState<'method' | 'confirm' | 'processing' | 'success'>('method')
  const [mpesaPhone, setMpesaPhone] = useState('')

  const pendingPayments = MOCK_PAYMENTS.filter(p => p.status === 'PENDENTE')
  const completedPayments = MOCK_PAYMENTS.filter(p => p.status === 'CONFIRMADO')
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      'CONFIRMADO': { 
        bg: 'bg-boho-sage/10', 
        text: 'text-boho-sage', 
        label: 'Confirmado',
        icon: CheckCircle
      },
      'PENDENTE': { 
        bg: 'bg-boho-mustard/10', 
        text: 'text-boho-mustard', 
        label: 'Pendente',
        icon: Clock
      },
      'FALHADO': { 
        bg: 'bg-red-100', 
        text: 'text-red-600', 
        label: 'Falhado',
        icon: AlertCircle
      }
    }
    return configs[status] || configs['PENDENTE']
  }

  const handlePayment = (payment: typeof MOCK_PAYMENTS[0]) => {
    setSelectedPayment(payment)
    setShowPaymentModal(true)
    setPaymentStep('method')
    setSelectedMethod(null)
  }

  const processPayment = async () => {
    setPaymentStep('processing')
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000))
    setPaymentStep('success')
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-boho-coffee mb-1">
            Meus Pagamentos
          </h1>
          <p className="text-boho-brown">
            Gerencie seus pagamentos e visualize histórico
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-boho-terracotta to-boho-coffee rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-white/80 text-sm">Pendentes</span>
          </div>
          <p className="text-3xl font-display font-bold">
            MZN {totalPending.toLocaleString('pt-MZ')}
          </p>
          <p className="text-white/80 text-sm mt-1">
            {pendingPayments.length} pagamento(s) pendente(s)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-boho-sage/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-boho-sage" />
            </div>
            <span className="text-boho-brown text-sm">Confirmados</span>
          </div>
          <p className="text-3xl font-display font-bold text-boho-coffee">
            {completedPayments.length}
          </p>
          <p className="text-boho-brown text-sm mt-1">
            Este ano
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-boho-mustard/10 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-boho-mustard" />
            </div>
            <span className="text-boho-brown text-sm">Método preferido</span>
          </div>
          <p className="text-3xl font-display font-bold text-boho-coffee">
            M-Pesa
          </p>
          <p className="text-boho-brown text-sm mt-1">
            80% dos pagamentos
          </p>
        </div>
      </div>

      {/* Pending Payments Section */}
      {pendingPayments.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-display font-semibold text-boho-coffee">
                Pagamentos Pendentes
              </h2>
              <p className="text-sm text-boho-brown">
                Efetue o pagamento para evitar atrasos
              </p>
            </div>
            <span className="px-4 py-2 bg-boho-mustard/10 text-boho-mustard rounded-full text-sm font-medium">
              {pendingPayments.length} pendente(s)
            </span>
          </div>

          <div className="space-y-4">
            {pendingPayments.map((payment) => (
              <div 
                key={payment.id}
                className="p-4 border border-boho-beige rounded-xl hover:border-boho-terracotta transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm text-boho-terracotta">
                        {payment.documentId}
                      </span>
                      <span className="px-2 py-1 bg-boho-mustard/10 text-boho-mustard text-xs rounded-full">
                        Pendente
                      </span>
                      {payment.dueDate && new Date(payment.dueDate) < new Date() && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                          Atrasado
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-boho-coffee">{payment.description}</h3>
                    <p className="text-sm text-boho-brown">
                      Vencimento: {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('pt-MZ') : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-mono font-bold text-boho-coffee">
                      MZN {payment.amount.toLocaleString('pt-MZ')}
                    </p>
                    <button
                      onClick={() => handlePayment(payment)}
                      className="flex items-center gap-2 px-6 py-3 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-xl font-medium transition-colors"
                    >
                      Pagar agora
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-semibold text-boho-coffee">
              Histórico de Pagamentos
            </h2>
            <p className="text-sm text-boho-brown">
              Todos os seus pagamentos realizados
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-boho-beige hover:border-boho-terracotta rounded-xl text-boho-brown hover:text-boho-terracotta transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-boho-beige">
                <th className="text-left py-3 px-4 text-sm font-medium text-boho-taupe">Referência</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-boho-taupe">Descrição</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-boho-taupe">Data</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-boho-taupe">Valor</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-boho-taupe">Método</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-boho-taupe">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PAYMENTS.map((payment) => {
                const statusConfig = getStatusConfig(payment.status)
                const StatusIcon = statusConfig.icon
                
                return (
                  <tr key={payment.id} className="border-b border-boho-beige/50 hover:bg-boho-sand/30 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-boho-coffee">{payment.id}</span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-boho-coffee">{payment.description}</p>
                      {payment.documentId && (
                        <p className="text-xs text-boho-taupe">Doc: {payment.documentId}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-boho-brown">
                      {payment.date 
                        ? new Date(payment.date).toLocaleDateString('pt-MZ')
                        : '-'
                      }
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-boho-coffee">
                      MZN {payment.amount.toLocaleString('pt-MZ')}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {payment.method ? (
                        <span className="text-sm text-boho-brown">{payment.method}</span>
                      ) : (
                        <span className="text-sm text-boho-taupe">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {payment.status === 'PENDENTE' ? (
                          <button
                            onClick={() => handlePayment(payment)}
                            className="px-3 py-1.5 bg-boho-terracotta hover:bg-boho-coffee text-white text-xs rounded-lg transition-colors"
                          >
                            Pagar
                          </button>
                        ) : (
                          <>
                            <button className="p-2 hover:bg-boho-sand rounded-lg text-boho-taupe hover:text-boho-coffee transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-boho-sand rounded-lg text-boho-taupe hover:text-boho-coffee transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-boho-coffee p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-semibold">
                  {paymentStep === 'success' ? 'Pagamento Confirmado!' : 'Efetuar Pagamento'}
                </h3>
                {paymentStep !== 'success' && (
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {paymentStep !== 'success' && (
                <div className="mt-4">
                  <p className="text-white/80 text-sm">{selectedPayment.description}</p>
                  <p className="text-3xl font-display font-bold mt-2">
                    MZN {selectedPayment.amount.toLocaleString('pt-MZ')}
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {paymentStep === 'method' && (
                <div className="space-y-4">
                  <p className="text-boho-coffee font-medium mb-4">Selecione o método de pagamento:</p>
                  
                  <button
                    onClick={() => setSelectedMethod('mpesa')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === 'mpesa' 
                        ? 'border-boho-terracotta bg-boho-terracotta/5' 
                        : 'border-boho-beige hover:border-boho-terracotta'
                    }`}
                  >
                    <div className="w-12 h-12 bg-boho-sage/10 rounded-xl flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-boho-sage" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-boho-coffee">M-Pesa</p>
                      <p className="text-sm text-boho-brown">Pagamento via celular</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-boho-taupe" />
                  </button>

                  <button
                    onClick={() => setSelectedMethod('bank')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === 'bank' 
                        ? 'border-boho-terracotta bg-boho-terracotta/5' 
                        : 'border-boho-beige hover:border-boho-terracotta'
                    }`}
                  >
                    <div className="w-12 h-12 bg-boho-mustard/10 rounded-xl flex items-center justify-center">
                      <Banknote className="w-6 h-6 text-boho-mustard" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-boho-coffee">Transferência Bancária</p>
                      <p className="text-sm text-boho-brown">Depósito ou transferência</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-boho-taupe" />
                  </button>

                  <button
                    onClick={() => setSelectedMethod('card')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === 'card' 
                        ? 'border-boho-terracotta bg-boho-terracotta/5' 
                        : 'border-boho-beige hover:border-boho-terracotta'
                    }`}
                  >
                    <div className="w-12 h-12 bg-boho-coffee/10 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-boho-coffee" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-boho-coffee">Cartão de Crédito/Débito</p>
                      <p className="text-sm text-boho-brown">Visa, Mastercard</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-boho-taupe" />
                  </button>

                  <button
                    onClick={() => selectedMethod && setPaymentStep('confirm')}
                    disabled={!selectedMethod}
                    className="w-full py-3 bg-boho-terracotta hover:bg-boho-coffee disabled:opacity-50 text-white rounded-xl font-medium transition-colors mt-4"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {paymentStep === 'confirm' && selectedMethod === 'mpesa' && (
                <div className="space-y-4">
                  <div className="bg-boho-sage/10 rounded-xl p-4 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-boho-sage" />
                    <p className="text-sm text-boho-coffee">
                      Você receberá um prompt no seu celular para confirmar o pagamento
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-boho-coffee mb-2">
                      Número M-Pesa
                    </label>
                    <input
                      type="tel"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="+258 84 XXX XXXX"
                      className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPaymentStep('method')}
                      className="flex-1 py-3 border border-boho-beige hover:border-boho-terracotta text-boho-coffee rounded-xl font-medium transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={processPayment}
                      disabled={!mpesaPhone}
                      className="flex-1 py-3 bg-boho-terracotta hover:bg-boho-coffee disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                    >
                      Confirmar Pagamento
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 relative">
                    <div className="absolute inset-0 border-4 border-boho-beige rounded-full" />
                    <div className="absolute inset-0 border-4 border-boho-terracotta rounded-full border-t-transparent animate-spin" />
                  </div>
                  <p className="text-boho-coffee font-medium">Processando pagamento...</p>
                  <p className="text-sm text-boho-brown mt-1">
                    Aguarde a confirmação do {selectedMethod === 'mpesa' ? 'M-Pesa' : 'banco'}
                  </p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-boho-sage/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-boho-sage" />
                  </div>
                  <h4 className="text-xl font-display font-semibold text-boho-coffee mb-2">
                    Pagamento Confirmado!
                  </h4>
                  <p className="text-boho-brown mb-6">
                    Seu pagamento de MZN {selectedPayment.amount.toLocaleString('pt-MZ')} foi processado com sucesso.
                  </p>
                  <div className="bg-boho-cream rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm text-boho-taupe">Referência:</p>
                    <p className="font-mono text-boho-coffee">MP240215{Math.floor(Math.random() * 1000000)}</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full py-3 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-xl font-medium transition-colors"
                  >
                    Concluir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
