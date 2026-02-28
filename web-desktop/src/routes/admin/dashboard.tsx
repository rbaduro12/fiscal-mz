import { createFileRoute } from '@tanstack/react-router'
import { 
  Users, DollarSign, FileText, ArrowUpRight, ArrowDownRight,
  CreditCard, Receipt, CheckCircle, ArrowRight, Plus, Download
} from 'lucide-react'

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboardPage,
})

const MOCK_STATS = {
  totalRevenue: 2450000,
  revenueChange: 12.5,
  activeClients: 48,
  clientsChange: 8,
  pendingQuotes: 15,
  quotesChange: -3,
  pendingPayments: 125000
}

const MOCK_RECENT_ACTIVITIES = [
  { id: 1, type: 'quote_accepted', title: 'Cotação C/2024/0042 aceita', client: 'ABC Comercial', amount: 12500, time: '2 horas atrás' },
  { id: 2, type: 'payment_received', title: 'Pagamento recebido', client: 'XYZ Imports', amount: 8500, method: 'M-Pesa', time: '3 horas atrás' },
  { id: 3, type: 'new_client', title: 'Novo cliente registrado', client: 'Nampula Agro', time: '5 horas atrás' },
  { id: 4, type: 'invoice_issued', title: 'Fatura FT/2024/0032 emitida', client: 'Maputo Tech', amount: 8900, time: '6 horas atrás' }
]

const MOCK_TOP_CLIENTS = [
  { id: 1, name: 'ABC Comercial', revenue: 450000, quotes: 12 },
  { id: 2, name: 'XYZ Imports', revenue: 320000, quotes: 8 },
  { id: 3, name: 'Maputo Tech', revenue: 280000, quotes: 6 },
  { id: 4, name: 'Nampula Agro', revenue: 195000, quotes: 4 }
]

const MOCK_PENDING_QUOTES = [
  { id: 'C/2024/0045', client: 'ABC Comercial', amount: 25000, status: 'PENDENTE', validUntil: '2024-03-01' },
  { id: 'C/2024/0044', client: 'XYZ Imports', amount: 18000, status: 'EM_NEGOCIACAO', validUntil: '2024-02-28' },
  { id: 'C/2024/0043', client: 'Maputo Tech', amount: 45000, status: 'PENDENTE', validUntil: '2024-02-27' }
]

function AdminDashboardPage() {

  const getActivityIcon = (type: string) => {
    const icons: Record<string, { icon: any, color: string, bg: string }> = {
      'quote_accepted': { icon: CheckCircle, color: 'text-boho-sage', bg: 'bg-boho-sage/10' },
      'payment_received': { icon: DollarSign, color: 'text-boho-terracotta', bg: 'bg-boho-terracotta/10' },
      'new_client': { icon: Users, color: 'text-boho-mustard', bg: 'bg-boho-mustard/10' },
      'invoice_issued': { icon: Receipt, color: 'text-boho-coffee', bg: 'bg-boho-coffee/10' }
    }
    return icons[type] || icons['quote_accepted']
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
      'PENDENTE': { bg: 'bg-boho-terracotta/10', text: 'text-boho-terracotta', label: 'Pendente' },
      'EM_NEGOCIACAO': { bg: 'bg-boho-mustard/10', text: 'text-boho-mustard', label: 'Em Negociação' }
    }
    return configs[status] || configs['PENDENTE']
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="px-3 py-1 bg-boho-terracotta/10 text-boho-terracotta text-sm font-medium rounded-full">
            Painel Administrativo
          </span>
          <h1 className="text-4xl font-display font-bold text-boho-coffee mt-2 mb-1">
            Dashboard
          </h1>
          <p className="text-boho-brown">
            Visão geral do sistema FISCAL.MZ
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-boho-beige hover:border-boho-terracotta rounded-xl text-boho-brown hover:text-boho-terracotta transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-xl font-medium transition-colors shadow-boho">
            <Plus className="w-5 h-5" />
            Nova Cotação
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Receita Total (Mês)"
          value={`MZN ${MOCK_STATS.totalRevenue.toLocaleString('pt-MZ')}`}
          change={`+${MOCK_STATS.revenueChange}%`}
          trend="up"
          icon={<DollarSign className="w-6 h-6" />}
          color="terracotta"
        />
        <StatCard
          title="Clientes Ativos"
          value={MOCK_STATS.activeClients.toString()}
          change={`+${MOCK_STATS.clientsChange} este mês`}
          trend="up"
          icon={<Users className="w-6 h-6" />}
          color="sage"
        />
        <StatCard
          title="Cotações Pendentes"
          value={MOCK_STATS.pendingQuotes.toString()}
          change={`${MOCK_STATS.quotesChange} vs semana`}
          trend="down"
          icon={<FileText className="w-6 h-6" />}
          color="mustard"
        />
        <StatCard
          title="A Receber"
          value={`MZN ${MOCK_STATS.pendingPayments.toLocaleString('pt-MZ')}`}
          change="+5.2%"
          trend="up"
          icon={<CreditCard className="w-6 h-6" />}
          color="coffee"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Novo Cliente', icon: Users, color: 'boho-sage' },
          { label: 'Nova Cotação', icon: FileText, color: 'boho-terracotta' },
          { label: 'Emitir Fatura', icon: Receipt, color: 'boho-coffee' },
          { label: 'Pagamento', icon: DollarSign, color: 'boho-mustard' },
          { label: 'Exportar SAFT', icon: Download, color: 'boho-sage' }
        ].map((action, i) => (
          <button
            key={i}
            className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl shadow-boho border border-boho-beige hover:shadow-boho-lg hover:border-boho-terracotta transition-all group"
          >
            <div className={`w-12 h-12 bg-${action.color.replace('boho-', '')}/10 rounded-xl flex items-center justify-center group-hover:bg-${action.color.replace('boho-', '')} transition-colors`}>
              <action.icon className={`w-6 h-6 text-${action.color.replace('boho-', '')} group-hover:text-white transition-colors`} />
            </div>
            <span className="text-sm font-medium text-boho-coffee text-center">{action.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pending Quotes */}
          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-semibold text-boho-coffee">
                  Cotações Pendentes
                </h2>
                <p className="text-sm text-boho-brown mt-1">
                  Requerem atenção
                </p>
              </div>
              <button className="flex items-center gap-2 text-boho-terracotta hover:text-boho-coffee font-medium text-sm transition-colors">
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {MOCK_PENDING_QUOTES.map((quote) => {
                const statusConfig = getStatusConfig(quote.status)
                
                return (
                  <div key={quote.id} className="flex items-center justify-between p-4 bg-boho-cream rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                        <FileText className={`w-5 h-5 ${statusConfig.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-boho-terracotta">{quote.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="font-medium text-boho-coffee">{quote.client}</p>
                        <p className="text-sm text-boho-brown">
                          Válida até {new Date(quote.validUntil).toLocaleDateString('pt-MZ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-boho-coffee">
                        MZN {quote.amount.toLocaleString('pt-MZ')}
                      </p>
                      <button className="px-3 py-1.5 mt-2 bg-boho-terracotta hover:bg-boho-coffee text-white text-sm rounded-lg transition-colors">
                        Ação
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-display font-semibold text-boho-coffee">
                  Receita Mensal
                </h2>
                <p className="text-sm text-boho-brown mt-1">
                  Evolução dos últimos 6 meses
                </p>
              </div>
            </div>
            <div className="h-48 flex items-end gap-4">
              {[
                { month: 'Jan', amount: 180 },
                { month: 'Fev', amount: 220 },
                { month: 'Mar', amount: 195 },
                { month: 'Abr', amount: 245 },
                { month: 'Mai', amount: 280 },
                { month: 'Jun', amount: 265 }
              ].map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-boho-terracotta/20 rounded-t-lg" style={{ height: '150px' }}>
                    <div 
                      className="w-full bg-boho-terracotta rounded-t-lg transition-all"
                      style={{ height: `${(data.amount / 300) * 150}px`, marginTop: 'auto' }}
                    />
                  </div>
                  <span className="text-xs text-boho-brown font-medium">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold text-boho-coffee">
                Atividade Recente
              </h2>
              <button className="text-sm text-boho-terracotta hover:text-boho-coffee font-medium">
                Ver todas
              </button>
            </div>
            <div className="space-y-4">
              {MOCK_RECENT_ACTIVITIES.map((activity) => {
                const config = getActivityIcon(activity.type)
                const Icon = config.icon
                
                return (
                  <div key={activity.id} className="flex gap-4">
                    <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-boho-coffee text-sm">{activity.title}</p>
                      <p className="text-sm text-boho-brown">
                        {activity.client}
                        {activity.amount && ` • MZN ${activity.amount.toLocaleString('pt-MZ')}`}
                      </p>
                      <p className="text-xs text-boho-taupe mt-1">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Clients */}
          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-semibold text-boho-coffee">
                Top Clientes
              </h2>
              <button className="text-sm text-boho-terracotta hover:text-boho-coffee font-medium">
                Ver todos
              </button>
            </div>
            <div className="space-y-4">
              {MOCK_TOP_CLIENTS.map((client, index) => (
                <div key={client.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index < 3 ? 'bg-boho-terracotta text-white' : 'bg-boho-sand text-boho-coffee'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-boho-coffee truncate">{client.name}</p>
                    <p className="text-xs text-boho-brown">{client.quotes} cotações</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium text-boho-coffee">
                      MZN {(client.revenue / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Summary */}
          <div className="bg-gradient-to-br from-boho-coffee to-boho-brown rounded-2xl p-6 text-white">
            <h3 className="font-display font-semibold text-lg mb-4">Resumo do Dia</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Novas cotações</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Pagamentos recebidos</span>
                <span className="font-semibold">MZN 45.000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Documentos emitidos</span>
                <span className="font-semibold">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
        <div className={`flex items-center gap-1 text-sm ${
          trend === 'up' ? 'text-boho-sage' : trend === 'down' ? 'text-red-500' : 'text-boho-taupe'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
          <span>{change}</span>
        </div>
      </div>
      <p className="text-boho-taupe text-sm mb-1">{title}</p>
      <p className="text-2xl font-display font-bold text-boho-coffee">{value}</p>
    </div>
  )
}
