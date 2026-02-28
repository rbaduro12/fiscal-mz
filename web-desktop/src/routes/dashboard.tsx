import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  DollarSign, FileText, CheckCircle, Clock, 
  AlertCircle, ArrowUpRight, ArrowRight, Plus, Download,
  CreditCard, Receipt, Package, Eye, ChevronRight,
  Loader2, TrendingUp, AlertTriangle
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useDashboard } from '@/hooks/use-dashboard'
import { useCotacoes, useProformas, useFaturas } from '@/hooks/use-documentos'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { FiscalBadge } from '@/components/ui/fiscal-badge'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuth()
  const { resumo, isLoading, isError } = useDashboard('30d')
  
  // Buscar dados recentes
  const { data: cotacoesRecentes } = useCotacoes({ limit: 5 })
  const { data: proformasRecentes } = useProformas({ limit: 5 })
  const { data: faturasRecentes } = useFaturas({ limit: 5 })

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      'ACEITE': { 
        bg: 'bg-boho-sage/10', 
        text: 'text-boho-sage', 
        label: 'Aceite',
        icon: CheckCircle
      },
      'EMITIDA': { 
        bg: 'bg-boho-mustard/10', 
        text: 'text-boho-mustard', 
        label: 'Emitida',
        icon: Clock
      },
      'RASCUNHO': { 
        bg: 'bg-boho-brown/10', 
        text: 'text-boho-brown', 
        label: 'Rascunho',
        icon: FileText
      },
      'PENDENTE': { 
        bg: 'bg-boho-terracotta/10', 
        text: 'text-boho-terracotta', 
        label: 'Pendente',
        icon: AlertCircle
      },
      'PAGA': { 
        bg: 'bg-boho-sage/10', 
        text: 'text-boho-sage', 
        label: 'Paga',
        icon: CheckCircle
      },
      'PROCESSADA': { 
        bg: 'bg-boho-coffee/10', 
        text: 'text-boho-coffee', 
        label: 'Processada',
        icon: CheckCircle
      },
      'REJEITADA': { 
        bg: 'bg-red-500/10', 
        text: 'text-red-600', 
        label: 'Rejeitada',
        icon: AlertTriangle
      },
    }
    return configs[status] || configs['PENDENTE']
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-boho-accent animate-spin" />
          <p className="text-boho-brown">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-boho-coffee mb-2">Erro ao carregar dashboard</h2>
          <p className="text-boho-brown mb-4">Não foi possível carregar os dados do dashboard.</p>
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
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 bg-boho-sage/20 text-boho-sage text-sm font-medium rounded-full">
            {new Date().toLocaleDateString('pt-MZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <h1 className="text-4xl font-display font-bold text-boho-coffee mb-2">
          Olá, {user?.nome?.split(' ')[0]}! 👋
        </h1>
        <p className="text-boho-brown">
          Bem-vindo ao seu portal. Aqui está o resumo das suas atividades.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link
          to="/quotes/new"
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-boho border border-boho-beige hover:shadow-boho-lg hover:border-boho-terracotta transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 bg-boho-terracotta/10 rounded-lg flex items-center justify-center group-hover:bg-boho-terracotta transition-colors">
            <Plus className="w-5 h-5 text-boho-terracotta group-hover:text-white" />
          </div>
          <div>
            <p className="font-medium text-boho-coffee">Nova Cotação</p>
            <p className="text-xs text-boho-brown">Criar orçamento</p>
          </div>
        </Link>

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
          title="Total Vendas (Mês)"
          value={`MZN ${(resumo?.totalVendasMes || 0).toLocaleString('pt-MZ')}`}
          change="+15% vs mês anterior"
          trend="up"
          icon={<DollarSign className="w-6 h-6" />}
          color="terracotta"
        />
        <StatCard
          title="A Receber"
          value={`MZN ${(resumo?.totalPendente || 0).toLocaleString('pt-MZ')}`}
          change={`${resumo?.proformasVencendo || 0} proformas`}
          trend="neutral"
          icon={<Clock className="w-6 h-6" />}
          color="mustard"
        />
        <StatCard
          title="Cotações Ativas"
          value={(resumo?.cotacoesPendentes || 0).toString()}
          change="Pendentes"
          trend="up"
          icon={<FileText className="w-6 h-6" />}
          color="sage"
        />
        <StatCard
          title="Total Recebido"
          value={`MZN ${(resumo?.totalRecebido || 0).toLocaleString('pt-MZ')}`}
          change="Este mês"
          trend="up"
          icon={<Receipt className="w-6 h-6" />}
          color="coffee"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Cotações Recentes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-semibold text-boho-coffee">
                  Cotações Recentes
                </h2>
                <p className="text-sm text-boho-brown mt-1">
                  Últimas cotações emitidas
                </p>
              </div>
              <Link
                to="/quotes"
                className="flex items-center gap-2 text-boho-terracotta hover:text-boho-coffee font-medium text-sm transition-colors"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {cotacoesRecentes?.items?.length === 0 ? (
                <div className="text-center py-8 text-boho-brown">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-boho-taupe" />
                  <p>Nenhuma cotação encontrada</p>
                </div>
              ) : (
                cotacoesRecentes?.items?.map((cotacao: any) => {
                  const statusConfig = getStatusConfig(cotacao.estado)
                  
                  return (
                    <div 
                      key={cotacao.id}
                      className="p-4 border border-boho-beige rounded-xl hover:shadow-boho transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                            <Package className={`w-5 h-5 ${statusConfig.text}`} />
                          </div>
                          <div>
                            <p className="font-mono text-sm text-boho-terracotta">{cotacao.numeroCompleto}</p>
                            <p className="font-medium text-boho-coffee">{cotacao.entidade?.nome || 'Cliente'}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between pl-12">
                        <div className="flex items-center gap-4 text-sm text-boho-brown">
                          <span>Validade: {cotacao.dataValidade ? new Date(cotacao.dataValidade).toLocaleDateString('pt-MZ') : 'N/A'}</span>
                          <span>•</span>
                          <span>{cotacao.linhas?.length || 0} item(s)</span>
                        </div>
                        <p className="font-mono font-semibold text-boho-coffee">
                          MZN {(cotacao.totalPagar || 0).toLocaleString('pt-MZ')}
                        </p>
                      </div>

                      {/* Actions based on status */}
                      <div className="flex items-center justify-end gap-3 mt-4 pl-12">
                        <Link
                          to={`/quotes/${cotacao.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-boho-brown hover:text-boho-coffee hover:bg-boho-sand rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalhes
                        </Link>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <Link
              to="/quotes/new"
              className="flex items-center justify-center gap-2 w-full mt-6 py-3 border-2 border-dashed border-boho-beige hover:border-boho-terracotta text-boho-brown hover:text-boho-terracotta rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Criar nova cotação
            </Link>
          </div>

          {/* Faturas Recentes */}
          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-semibold text-boho-coffee">
                  Faturas Recentes
                </h2>
                <p className="text-sm text-boho-brown mt-1">
                  Últimas faturas emitidas
                </p>
              </div>
              <Link
                to="/fiscal"
                className="flex items-center gap-2 text-boho-terracotta hover:text-boho-coffee font-medium text-sm transition-colors"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-boho-beige">
                    <th className="text-left py-3 px-4 text-sm font-medium text-boho-taupe">Documento</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-boho-taupe">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-boho-taupe">Data</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-boho-taupe">Valor</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-boho-taupe">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {faturasRecentes?.items?.map((fatura: any) => {
                    const statusConfig = getStatusConfig(fatura.estado)
                    
                    return (
                      <tr key={fatura.id} className="border-b border-boho-beige/50 hover:bg-boho-sand/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-boho-terracotta/10">
                              <Receipt className="w-4 h-4 text-boho-terracotta" />
                            </div>
                            <div>
                              <p className="font-mono text-sm text-boho-coffee">{fatura.numeroCompleto}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-boho-brown">
                          {fatura.entidade?.nome || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-sm text-boho-brown">
                          {new Date(fatura.dataEmissao).toLocaleDateString('pt-MZ')}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-boho-coffee">
                          MZN {(fatura.totalPagar || 0).toLocaleString('pt-MZ')}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
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
                <p className="font-medium">{user?.empresa?.nome || user?.nome || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-white/60">NUIT</p>
                <p className="font-medium">{user?.empresa?.nuit || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-white/60">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-white/60">Telefone</p>
                <p className="font-medium">{user?.telefone || user?.empresa?.telefone || 'Não informado'}</p>
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

          {/* Proformas Pendentes */}
          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <h3 className="font-display font-semibold text-lg text-boho-coffee mb-4">
              Proformas Pendentes
            </h3>
            <div className="space-y-3">
              {proformasRecentes?.items?.filter((p: any) => p.estado === 'EMITIDA').slice(0, 3).map((proforma: any) => (
                <div key={proforma.id} className="p-3 bg-boho-sand/30 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-boho-coffee">{proforma.numeroCompleto}</p>
                    <p className="font-mono font-semibold text-boho-terracotta">
                      MZN {(proforma.totalPagar || 0).toLocaleString('pt-MZ')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-boho-brown">{proforma.entidade?.nome || 'Cliente'}</p>
                    <Link
                      to={`/proformas/${proforma.id}`}
                      className="text-xs text-boho-terracotta hover:text-boho-coffee font-medium"
                    >
                      Ver →
                    </Link>
                  </div>
                </div>
              ))}
              
              {(!proformasRecentes?.items || proformasRecentes.items.filter((p: any) => p.estado === 'EMITIDA').length === 0) && (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-boho-sage mx-auto mb-2" />
                  <p className="text-boho-brown">Nenhuma proforma pendente!</p>
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
        {trend === 'up' && <TrendingUp className="w-5 h-5 text-boho-sage" />}
      </div>
      <p className="text-boho-taupe text-sm mb-1">{title}</p>
      <p className="text-2xl font-display font-bold text-boho-coffee mb-1">{value}</p>
      <p className={`text-sm ${trend === 'up' ? 'text-boho-sage' : 'text-boho-brown'}`}>{change}</p>
    </div>
  )
}
