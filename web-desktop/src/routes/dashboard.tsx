import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  DollarSign, FileText, CheckCircle, Clock, 
  AlertCircle, ArrowUpRight, ArrowRight, Plus, Download,
  CreditCard, Receipt, Package, Eye, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

// Mock data para o dashboard do cliente
const MOCK_QUOTES = [
  {
    id: 'C/2024/0001',
    description: 'Consultoria Fiscal - Q1 2024',
    amount: 45000,
    status: 'ACEITE',
    date: '2024-01-15',
    validUntil: '2024-02-15',
    items: [
      { description: 'Consultoria mensal', qty: 3, price: 15000 }
    ]
  },
  {
    id: 'C/2024/0002',
    description: 'Despacho Aduaneiro - Container',
    amount: 8500,
    status: 'EM_NEGOCIACAO',
    date: '2024-01-20',
    validUntil: '2024-02-05',
    items: [
      { description: 'Despacho container 40ft', qty: 1, price: 8500 }
    ]
  },
  {
    id: 'C/2024/0003',
    description: 'Elaboração de Documentos',
    amount: 12000,
    status: 'PENDENTE',
    date: '2024-02-01',
    validUntil: '2024-02-15',
    items: [
      { description: 'Declarações fiscais', qty: 5, price: 2400 }
    ]
  }
]

const MOCK_DOCUMENTS = [
  {
    id: 'FT/2024/0001',
    type: 'FATURA',
    description: 'Serviços Janeiro 2024',
    amount: 15000,
    date: '2024-01-31',
    status: 'PAGO',
    downloadUrl: '#'
  },
  {
    id: 'PF/2024/0001',
    type: 'PROFORMA',
    description: 'Despacho Aduaneiro',
    amount: 8500,
    date: '2024-02-01',
    status: 'PENDENTE',
    downloadUrl: '#'
  },
  {
    id: 'FT/2024/0002',
    type: 'FATURA',
    description: 'Serviços Fevereiro 2024',
    amount: 15000,
    date: '2024-02-28',
    status: 'PENDENTE',
    downloadUrl: '#'
  }
]

const MOCK_PAYMENTS = [
  {
    id: 'PAY-2024-0001',
    description: 'Fatura FT/2024/0001',
    amount: 15000,
    method: 'M-Pesa',
    date: '2024-02-05',
    status: 'CONFIRMADO'
  },
  {
    id: 'PAY-2024-0002',
    description: 'Proforma PF/2024/0001',
    amount: 8500,
    method: 'Transferência',
    date: '2024-02-10',
    status: 'PENDENTE'
  }
]

function DashboardPage() {
  const { user } = useAuth()

  const stats = {
    totalSpent: 125000,
    pendingPayments: 23500,
    activeQuotes: 3,
    totalDocuments: 8
  }

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
        icon: Clock
      },
      'PENDENTE': { 
        bg: 'bg-boho-terracotta/10', 
        text: 'text-boho-terracotta', 
        label: 'Pendente',
        icon: AlertCircle
      },
      'PAGO': { 
        bg: 'bg-boho-sage/10', 
        text: 'text-boho-sage', 
        label: 'Pago',
        icon: CheckCircle
      },
      'CONFIRMADO': { 
        bg: 'bg-boho-sage/10', 
        text: 'text-boho-sage', 
        label: 'Confirmado',
        icon: CheckCircle
      }
    }
    return configs[status] || configs['PENDENTE']
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-boho-sage/20 text-boho-sage text-sm font-medium rounded-full">
            {new Date().toLocaleDateString('pt-MZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <h1 className="text-4xl font-display font-bold text-boho-coffee mb-2">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-boho-brown">
          Bem-vindo ao seu portal. Aqui está o resumo das suas atividades.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-boho border border-boho-beige hover:shadow-boho-lg hover:border-boho-terracotta transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 bg-boho-terracotta/10 rounded-lg flex items-center justify-center group-hover:bg-boho-terracotta transition-colors">
            <Plus className="w-5 h-5 text-boho-terracotta group-hover:text-white" />
          </div>
          <div>
            <p className="font-medium text-boho-coffee">Nova Cotação</p>
            <p className="text-xs text-boho-brown">Solicitar serviço</p>
          </div>
        </div>

        <Link
          to="/my-payments"
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-boho border border-boho-beige hover:shadow-boho-lg hover:border-boho-sage transition-all group"
        >
          <div className="w-10 h-10 bg-boho-sage/10 rounded-lg flex items-center justify-center group-hover:bg-boho-sage transition-colors">
            <CreditCard className="w-5 h-5 text-boho-sage group-hover:text-white" />
          </div>
          <div>
            <p className="font-medium text-boho-coffee">Efetuar Pagamento</p>
            <p className="text-xs text-boho-brown">Pagar faturas</p>
          </div>
        </Link>

        <Link
          to="/my-documents"
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-boho border border-boho-beige hover:shadow-boho-lg hover:border-boho-mustard transition-all group"
        >
          <div className="w-10 h-10 bg-boho-mustard/10 rounded-lg flex items-center justify-center group-hover:bg-boho-mustard transition-colors">
            <Download className="w-5 h-5 text-boho-mustard group-hover:text-white" />
          </div>
          <div>
            <p className="font-medium text-boho-coffee">Documentos</p>
            <p className="text-xs text-boho-brown">Baixar faturas</p>
          </div>
        </Link>

        <Link
          to="/profile"
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-boho border border-boho-beige hover:shadow-boho-lg hover:border-boho-coffee transition-all group"
        >
          <div className="w-10 h-10 bg-boho-coffee/10 rounded-lg flex items-center justify-center group-hover:bg-boho-coffee transition-colors">
            <FileText className="w-5 h-5 text-boho-coffee group-hover:text-white" />
          </div>
          <div>
            <p className="font-medium text-boho-coffee">Meu Perfil</p>
            <p className="text-xs text-boho-brown">Dados da empresa</p>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Gasto"
          value={`MZN ${stats.totalSpent.toLocaleString('pt-MZ')}`}
          change="+15% vs mês anterior"
          trend="up"
          icon={<DollarSign className="w-6 h-6" />}
          color="terracotta"
        />
        <StatCard
          title="A Pagar"
          value={`MZN ${stats.pendingPayments.toLocaleString('pt-MZ')}`}
          change="2 faturas"
          trend="neutral"
          icon={<Clock className="w-6 h-6" />}
          color="mustard"
        />
        <StatCard
          title="Cotações Ativas"
          value={stats.activeQuotes.toString()}
          change="1 em negociação"
          trend="up"
          icon={<FileText className="w-6 h-6" />}
          color="sage"
        />
        <StatCard
          title="Documentos"
          value={stats.totalDocuments.toString()}
          change="3 este mês"
          trend="up"
          icon={<Receipt className="w-6 h-6" />}
          color="coffee"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Minhas Cotações */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-semibold text-boho-coffee">
                  Minhas Cotações
                </h2>
                <p className="text-sm text-boho-brown mt-1">
                  Acompanhe o status das suas solicitações
                </p>
              </div>
              <Link
                to="/my-quotes"
                className="flex items-center gap-2 text-boho-terracotta hover:text-boho-coffee font-medium text-sm transition-colors"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {MOCK_QUOTES.map((quote) => {
                const statusConfig = getStatusConfig(quote.status)
                
                return (
                  <div 
                    key={quote.id}
                    className="p-4 border border-boho-beige rounded-xl hover:shadow-boho transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                          <Package className={`w-5 h-5 ${statusConfig.text}`} />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-boho-terracotta">{quote.id}</p>
                          <p className="font-medium text-boho-coffee">{quote.description}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pl-12">
                      <div className="flex items-center gap-4 text-sm text-boho-brown">
                        <span>Validade: {new Date(quote.validUntil).toLocaleDateString('pt-MZ')}</span>
                        <span>•</span>
                        <span>{quote.items.length} item(s)</span>
                      </div>
                      <p className="font-mono font-semibold text-boho-coffee">
                        MZN {quote.amount.toLocaleString('pt-MZ')}
                      </p>
                    </div>

                    {/* Actions based on status */}
                    <div className="flex items-center justify-end gap-3 mt-4 pl-12">
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-sm text-boho-brown hover:text-boho-coffee hover:bg-boho-sand rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalhes
                      </button>
                      
                      {quote.status === 'PENDENTE' && (
                        <button className="px-4 py-2 bg-boho-terracotta hover:bg-boho-coffee text-white text-sm rounded-lg transition-colors">
                          Aceitar
                        </button>
                      )}
                      
                      {quote.status === 'EM_NEGOCIACAO' && (
                        <button className="px-4 py-2 bg-boho-mustard hover:bg-boho-coffee text-white text-sm rounded-lg transition-colors">
                          Contra-proposta
                        </button>
                      )}
                      
                      {quote.status === 'ACEITE' && (
                        <Link
                          to="/my-payments"
                          className="px-4 py-2 bg-boho-sage hover:bg-boho-olive text-white text-sm rounded-lg transition-colors"
                        >
                          Pagar
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              className="flex items-center justify-center gap-2 w-full mt-6 py-3 border-2 border-dashed border-boho-beige hover:border-boho-terracotta text-boho-brown hover:text-boho-terracotta rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Solicitar nova cotação
            </button>
          </div>

          {/* Documentos Recentes */}
          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-semibold text-boho-coffee">
                  Documentos Fiscais Recentes
                </h2>
                <p className="text-sm text-boho-brown mt-1">
                  Faturas e proformas emitidas
                </p>
              </div>
              <Link
                to="/my-documents"
                className="flex items-center gap-2 text-boho-terracotta hover:text-boho-coffee font-medium text-sm transition-colors"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-boho-beige">
                    <th className="text-left py-3 px-4 text-sm font-medium text-boho-taupe">Documento</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-boho-taupe">Data</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-boho-taupe">Valor</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-boho-taupe">Status</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_DOCUMENTS.slice(0, 3).map((doc) => {
                    const statusConfig = getStatusConfig(doc.status)
                    
                    return (
                      <tr key={doc.id} className="border-b border-boho-beige/50 hover:bg-boho-sand/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${doc.type === 'FATURA' ? 'bg-boho-terracotta/10' : 'bg-boho-mustard/10'}`}>
                              <Receipt className={`w-4 h-4 ${doc.type === 'FATURA' ? 'text-boho-terracotta' : 'text-boho-mustard'}`} />
                            </div>
                            <div>
                              <p className="font-mono text-sm text-boho-coffee">{doc.id}</p>
                              <p className="text-xs text-boho-brown">{doc.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-boho-brown">
                          {new Date(doc.date).toLocaleDateString('pt-MZ')}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-boho-coffee">
                          MZN {doc.amount.toLocaleString('pt-MZ')}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 hover:bg-boho-sand rounded-lg text-boho-taupe hover:text-boho-coffee transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                            {doc.status === 'PENDENTE' && (
                              <Link
                                to="/my-payments"
                                className="px-3 py-1.5 bg-boho-terracotta hover:bg-boho-coffee text-white text-xs rounded-lg transition-colors"
                              >
                                Pagar
                              </Link>
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info Card */}
          <div className="bg-gradient-to-br from-boho-coffee to-boho-brown rounded-2xl p-6 text-white">
            <h3 className="font-display font-semibold text-lg mb-4">Dados da Empresa</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-white/60">Nome</p>
                <p className="font-medium">{user?.companyName || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-white/60">NUIT</p>
                <p className="font-medium">{user?.nuit || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-white/60">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-white/60">Telefone</p>
                <p className="font-medium">{user?.phone || 'Não informado'}</p>
              </div>
            </div>
            <Link
              to="/profile"
              className="flex items-center justify-center gap-2 w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
            >
              Editar dados
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pagamentos Pendentes */}
          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <h3 className="font-display font-semibold text-lg text-boho-coffee mb-4">
              Pagamentos Pendentes
            </h3>
            <div className="space-y-3">
              {MOCK_PAYMENTS.filter(p => p.status === 'PENDENTE').map((payment) => (
                <div key={payment.id} className="p-3 bg-boho-sand/30 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-boho-coffee">{payment.description}</p>
                    <p className="font-mono font-semibold text-boho-terracotta">
                      MZN {payment.amount.toLocaleString('pt-MZ')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-boho-brown">Vence em 5 dias</p>
                    <Link
                      to="/my-payments"
                      className="text-xs text-boho-terracotta hover:text-boho-coffee font-medium"
                    >
                      Pagar agora →
                    </Link>
                  </div>
                </div>
              ))}
              
              {MOCK_PAYMENTS.filter(p => p.status === 'PENDENTE').length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-boho-sage mx-auto mb-2" />
                  <p className="text-boho-brown">Nenhum pagamento pendente!</p>
                </div>
              )}
            </div>
          </div>

          {/* Suporte */}
          <div className="bg-boho-sage/10 rounded-2xl p-6 border border-boho-sage/20">
            <h3 className="font-display font-semibold text-lg text-boho-coffee mb-2">
              Precisa de ajuda?
            </h3>
            <p className="text-sm text-boho-brown mb-4">
              Nossa equipe está disponível para auxiliar você.
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-boho-coffee">
                <span className="w-2 h-2 bg-boho-sage rounded-full" />
                suporte@fiscal.mz
              </p>
              <p className="flex items-center gap-2 text-boho-coffee">
                <span className="w-2 h-2 bg-boho-sage rounded-full" />
                +258 84 000 0001
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente StatCard
function StatCard({ title, value, change, trend, icon, color }: {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  color: 'terracotta' | 'sage' | 'mustard' | 'coffee'
}) {
  const colorClasses = {
    terracotta: 'bg-boho-terracotta/10 text-boho-terracotta',
    sage: 'bg-boho-sage/10 text-boho-sage',
    mustard: 'bg-boho-mustard/10 text-boho-mustard',
    coffee: 'bg-boho-coffee/10 text-boho-coffee',
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige hover:shadow-boho-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend === 'up' && <ArrowUpRight className="w-5 h-5 text-boho-sage" />}
      </div>
      <p className="text-boho-taupe text-sm mb-1">{title}</p>
      <p className="text-2xl font-display font-bold text-boho-coffee mb-1">{value}</p>
      <p className={`text-sm ${trend === 'up' ? 'text-boho-sage' : 'text-boho-brown'}`}>{change}</p>
    </div>
  )
}
