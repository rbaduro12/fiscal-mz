import { createFileRoute, Link } from '@tanstack/react-router'
import { CreditCard, ArrowRight, Loader2, CheckCircle, Clock, AlertCircle, QrCode } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { FiscalBadge } from '@/components/ui/fiscal-badge'
import { useProformas } from '@/hooks/use-documentos'
import { useState } from 'react'

export const Route = createFileRoute('/payments')({
  component: PaymentsPage,
})

const metodosPagamento = [
  { id: 'MPESA', nome: 'M-Pesa', cor: 'bg-red-500', icon: '📱' },
  { id: 'EMOLA', nome: 'E-Mola', cor: 'bg-blue-500', icon: '💳' },
  { id: 'BIM', nome: 'BIM Pay', cor: 'bg-green-500', icon: '🏦' },
  { id: 'CASH', nome: 'Dinheiro', cor: 'bg-yellow-500', icon: '💵' },
  { id: 'CARTAO', nome: 'Cartão', cor: 'bg-purple-500', icon: '💳' },
]

function PaymentsPage() {
  const { data: proformasData, isLoading } = useProformas({ estado: 'EMITIDA', limit: 20 })
  const [proformaSelecionada, setProformaSelecionada] = useState<string | null>(null)
  const [metodoSelecionado, setMetodoSelecionado] = useState<string>('')
  const [telefone, setTelefone] = useState('')
  const [valorPago, setValorPago] = useState('')
  const [processing, setProcessing] = useState(false)
  
  const proformas = proformasData?.items || []
  
  const proformaAtual = proformas.find(p => p.id === proformaSelecionada)
  
  const handlePagamento = async () => {
    if (!proformaSelecionada || !metodoSelecionado) return
    
    setProcessing(true)
    // Simulação de processamento - em produção chamaria a API
    await new Promise(r => setTimeout(r, 2000))
    setProcessing(false)
    alert('Pagamento processado com sucesso!')
    setProformaSelecionada(null)
    setMetodoSelecionado('')
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-boho-accent animate-spin" />
          <p className="text-boho-brown">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-boho-coffee">Pagamentos</h1>
        <p className="text-boho-brown mt-1">Efetue pagamentos de proformas e faturas</p>
      </div>

      {!proformaSelecionada ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <FiscalCard className="bg-gradient-to-br from-boho-terracotta/10 to-boho-terracotta/5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-boho-terracotta/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-boho-terracotta" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-boho-coffee">
                    MZN {proformas.reduce((acc, p) => acc + (p.totalPagar || 0), 0).toLocaleString('pt-MZ')}
                  </p>
                  <p className="text-sm text-boho-brown">Total a pagar</p>
                </div>
              </div>
            </FiscalCard>

            <FiscalCard className="bg-gradient-to-br from-boho-mustard/10 to-boho-mustard/5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-boho-mustard/10 rounded-lg">
                  <Clock className="w-6 h-6 text-boho-mustard" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-boho-coffee">{proformas.length}</p>
                  <p className="text-sm text-boho-brown">Proformas pendentes</p>
                </div>
              </div>
            </FiscalCard>

            <FiscalCard className="bg-gradient-to-br from-boho-sage/10 to-boho-sage/5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-boho-sage/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-boho-sage" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-boho-coffee">0</p>
                  <p className="text-sm text-boho-brown">Pagamentos hoje</p>
                </div>
              </div>
            </FiscalCard>
          </div>

          {/* Lista de Proformas */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4 text-boho-coffee">Proformas Pendentes</h2>
            
            {proformas.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-boho-sage mx-auto mb-4" />
                <p className="text-boho-brown">Nenhuma proforma pendente!</p>
                <p className="text-sm text-boho-taupe mt-2">Todas as suas proformas estão pagas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proformas.map((proforma) => (
                  <div 
                    key={proforma.id}
                    className="p-4 border border-boho-beige rounded-xl hover:border-boho-accent transition-colors cursor-pointer"
                    onClick={() => {
                      setProformaSelecionada(proforma.id)
                      setValorPago(proforma.totalPagar?.toString() || '')
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-boho-accent/10 rounded-xl flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-boho-accent" />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-boho-accent">{proforma.numeroCompleto}</p>
                          <p className="font-medium text-boho-coffee">{proforma.entidade?.nome}</p>
                          <p className="text-sm text-boho-brown">
                            Vence em {proforma.dataValidade 
                              ? new Date(proforma.dataValidade).toLocaleDateString('pt-MZ')
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xl font-bold text-boho-coffee">
                          MZN {proforma.totalPagar?.toLocaleString('pt-MZ')}
                        </p>
                        <FiscalBadge status="PENDENTE" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FiscalCard>
        </>
      ) : (
        /* Tela de Pagamento */
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setProformaSelecionada(null)}
            className="mb-4 text-boho-accent hover:underline flex items-center gap-2"
          >
            <ArrowRight className="rotate-180" size={16} />
            Voltar para lista
          </button>
          
          <FiscalCard>
            <div className="text-center mb-6">
              <p className="text-boho-brown mb-2">Pagamento da proforma</p>
              <p className="font-mono text-3xl font-bold text-boho-coffee">{proformaAtual?.numeroCompleto}</p>
              <p className="text-4xl font-bold text-boho-accent mt-4">
                MZN {proformaAtual?.totalPagar?.toLocaleString('pt-MZ')}
              </p>
            </div>
            
            {/* Métodos de Pagamento */}
            <div className="mb-6">
              <label className="text-sm text-boho-brown block mb-3">Selecione o método de pagamento</label>
              <div className="grid grid-cols-3 gap-3">
                {metodosPagamento.map((metodo) => (
                  <button
                    key={metodo.id}
                    onClick={() => setMetodoSelecionado(metodo.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      metodoSelecionado === metodo.id
                        ? 'border-boho-accent bg-boho-accent/10'
                        : 'border-boho-beige hover:border-boho-accent/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{metodo.icon}</div>
                    <p className="text-sm font-medium text-boho-coffee">{metodo.nome}</p>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Campos específicos por método */}
            {metodoSelecionado && (
              <div className="space-y-4 mb-6">
                {(metodoSelecionado === 'MPESA' || metodoSelecionado === 'EMOLA' || metodoSelecionado === 'BIM') && (
                  <div>
                    <label className="text-sm text-boho-brown block mb-2">Número de telefone</label>
                    <input
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="+258 84 123 4567"
                      className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                    />
                    <p className="text-xs text-boho-taupe mt-1">
                      Você receberá uma notificação no seu telemóvel para confirmar o pagamento.
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm text-boho-brown block mb-2">Valor a pagar</label>
                  <input
                    type="number"
                    value={valorPago}
                    onChange={(e) => setValorPago(e.target.value)}
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                  />
                </div>
              </div>
            )}
            
            {/* QR Code para mobile */}
            {metodoSelecionado && (
              <div className="text-center mb-6 p-4 bg-boho-sand/30 rounded-xl">
                <QrCode className="w-8 h-8 text-boho-accent mx-auto mb-2" />
                <p className="text-sm text-boho-brown">
                  Prefere pagar pelo telemóvel?
                </p>
                <p className="text-xs text-boho-taupe">
                  Escaneie o QR code com a sua app bancária
                </p>
                <div className="w-32 h-32 bg-white mx-auto mt-3 rounded-lg flex items-center justify-center border border-boho-beige">
                  <span className="text-xs text-boho-taupe">QR Code</span>
                </div>
              </div>
            )}
            
            {/* Botão de pagamento */}
            <button
              onClick={handlePagamento}
              disabled={!metodoSelecionado || processing}
              className="w-full py-4 bg-boho-accent hover:bg-boho-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Confirmar Pagamento
                </>
              )}
            </button>
            
            <div className="mt-4 flex items-center gap-2 justify-center text-sm text-boho-taupe">
              <AlertCircle size={16} />
              <span>Pagamento seguro processado localmente</span>
            </div>
          </FiscalCard>
        </div>
      )}
    </div>
  )
}
