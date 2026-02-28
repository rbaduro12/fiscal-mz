import { createFileRoute } from '@tanstack/react-router'
import { 
  TrendingUp, Users, DollarSign, FileText, Download, Target
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/reports')({
  component: ReportsPage,
})

const MOCK_REVENUE_BY_MONTH = [
  { month: 'Jan', revenue: 180000, expenses: 120000, profit: 60000 },
  { month: 'Fev', revenue: 220000, expenses: 140000, profit: 80000 },
  { month: 'Mar', revenue: 195000, expenses: 130000, profit: 65000 },
  { month: 'Abr', revenue: 245000, expenses: 160000, profit: 85000 },
  { month: 'Mai', revenue: 280000, expenses: 180000, profit: 100000 },
  { month: 'Jun', revenue: 265000, expenses: 170000, profit: 95000 }
]

const MOCK_SERVICES_BREAKDOWN = [
  { name: 'Consultoria Fiscal', amount: 850000, percentage: 35, color: 'bg-boho-terracotta' },
  { name: 'Despacho Aduaneiro', amount: 620000, percentage: 25, color: 'bg-boho-sage' },
  { name: 'Registro de Empresas', amount: 480000, percentage: 20, color: 'bg-boho-mustard' },
  { name: 'Auditoria', amount: 360000, percentage: 15, color: 'bg-boho-coffee' },
  { name: 'Outros', amount: 140000, percentage: 5, color: 'bg-boho-stone' }
]

const MOCK_CLIENT_GROWTH = [
  { month: 'Jan', newClients: 3, totalClients: 35 },
  { month: 'Fev', newClients: 5, totalClients: 40 },
  { month: 'Mar', newClients: 2, totalClients: 42 },
  { month: 'Abr', newClients: 4, totalClients: 46 },
  { month: 'Mai', newClients: 6, totalClients: 52 },
  { month: 'Jun', newClients: 4, totalClients: 56 }
]

const MOCK_QUOTE_CONVERSION = [
  { status: 'Convertidas', count: 45, percentage: 68, color: 'bg-boho-sage' },
  { status: 'Pendentes', count: 12, percentage: 18, color: 'bg-boho-mustard' },
  { status: 'Rejeitadas', count: 9, percentage: 14, color: 'bg-boho-terracotta' }
]

function ReportsPage() {
  const [dateRange, setDateRange] = useState('last6months')
  const [activeTab, setActiveTab] = useState('revenue')

  const totalRevenue = MOCK_REVENUE_BY_MONTH.reduce((sum, m) => sum + m.revenue, 0)
  const totalProfit = MOCK_REVENUE_BY_MONTH.reduce((sum, m) => sum + m.profit, 0)
  const avgQuoteValue = 18500
  const conversionRate = 68

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-boho-coffee mb-1">
            Relatórios
          </h1>
          <p className="text-boho-brown">
            Análise detalhada do desempenho do negócio
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 bg-white border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta"
          >
            <option value="last30days">Últimos 30 dias</option>
            <option value="last3months">Últimos 3 meses</option>
            <option value="last6months">Últimos 6 meses</option>
            <option value="lastyear">Último ano</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-xl font-medium transition-colors">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-boho-terracotta/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-boho-terracotta" />
            </div>
            <span className="text-sm text-boho-brown">Receita Total</span>
          </div>
          <p className="text-2xl font-display font-bold text-boho-coffee">
            MZN {totalRevenue.toLocaleString('pt-MZ')}
          </p>
          <p className="text-sm text-boho-sage mt-1">+12.5% vs período anterior</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-boho-sage/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-boho-sage" />
            </div>
            <span className="text-sm text-boho-brown">Lucro Líquido</span>
          </div>
          <p className="text-2xl font-display font-bold text-boho-coffee">
            MZN {totalProfit.toLocaleString('pt-MZ')}
          </p>
          <p className="text-sm text-boho-sage mt-1">Margem de 39%</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-boho-mustard/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-boho-mustard" />
            </div>
            <span className="text-sm text-boho-brown">Ticket Médio</span>
          </div>
          <p className="text-2xl font-display font-bold text-boho-coffee">
            MZN {avgQuoteValue.toLocaleString('pt-MZ')}
          </p>
          <p className="text-sm text-boho-sage mt-1">+8% vs período anterior</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-boho-coffee/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-boho-coffee" />
            </div>
            <span className="text-sm text-boho-brown">Taxa de Conversão</span>
          </div>
          <p className="text-2xl font-display font-bold text-boho-coffee">
            {conversionRate}%
          </p>
          <p className="text-sm text-boho-sage mt-1">+5% vs período anterior</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'revenue', label: 'Receita', icon: DollarSign },
          { id: 'services', label: 'Serviços', icon: FileText },
          { id: 'clients', label: 'Clientes', icon: Users },
          { id: 'conversion', label: 'Conversão', icon: Target }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-boho-terracotta text-white'
                : 'bg-white text-boho-brown hover:bg-boho-sand border border-boho-beige'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Revenue Report */}
      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <h2 className="text-xl font-display font-semibold text-boho-coffee mb-6">
              Evolução da Receita
            </h2>
            <div className="h-80 flex items-end gap-4">
              {MOCK_REVENUE_BY_MONTH.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative h-64">
                    {/* Expenses bar */}
                    <div 
                      className="absolute bottom-0 w-full bg-boho-terracotta/20 rounded-t-lg"
                      style={{ height: `${(data.expenses / 300000) * 256}px` }}
                    />
                    {/* Profit bar */}
                    <div 
                      className="absolute bottom-0 w-full bg-boho-sage rounded-t-lg"
                      style={{ height: `${(data.profit / 300000) * 256}px` }}
                    />
                    {/* Revenue line indicator */}
                    <div 
                      className="absolute w-full border-t-2 border-boho-terracotta border-dashed"
                      style={{ bottom: `${(data.revenue / 300000) * 256}px` }}
                    />
                  </div>
                  <span className="text-xs text-boho-brown font-medium">{data.month}</span>
                  <span className="text-xs text-boho-taupe">
                    MZN {(data.revenue / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-boho-sage rounded" />
                <span className="text-sm text-boho-brown">Lucro</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-boho-terracotta/20 rounded" />
                <span className="text-sm text-boho-brown">Despesas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 border-t-2 border-boho-terracotta border-dashed" />
                <span className="text-sm text-boho-brown">Receita Total</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <h2 className="text-xl font-display font-semibold text-boho-coffee mb-6">
              Resumo Financeiro
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-boho-brown">Receita Total</span>
                  <span className="font-mono font-medium text-boho-coffee">
                    MZN {totalRevenue.toLocaleString('pt-MZ')}
                  </span>
                </div>
                <div className="w-full h-2 bg-boho-sand rounded-full" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-boho-brown">Despesas</span>
                  <span className="font-mono font-medium text-boho-terracotta">
                    MZN {(totalRevenue - totalProfit).toLocaleString('pt-MZ')}
                  </span>
                </div>
                <div className="w-full h-2 bg-boho-sand rounded-full overflow-hidden">
                  <div className="w-[61%] h-full bg-boho-terracotta rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-boho-brown">Lucro Líquido</span>
                  <span className="font-mono font-medium text-boho-sage">
                    MZN {totalProfit.toLocaleString('pt-MZ')}
                  </span>
                </div>
                <div className="w-full h-2 bg-boho-sand rounded-full overflow-hidden">
                  <div className="w-[39%] h-full bg-boho-sage rounded-full" />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-boho-beige">
              <h3 className="font-medium text-boho-coffee mb-4">Métricas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-boho-brown">Margem de Lucro</span>
                  <span className="font-medium text-boho-coffee">39%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-boho-brown">Crescimento MoM</span>
                  <span className="font-medium text-boho-sage">+12.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-boho-brown">Média Mensal</span>
                  <span className="font-medium text-boho-coffee">
                    MZN {(totalRevenue / 6).toLocaleString('pt-MZ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Report */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <h2 className="text-xl font-display font-semibold text-boho-coffee mb-6">
              Receita por Serviço
            </h2>
            <div className="space-y-4">
              {MOCK_SERVICES_BREAKDOWN.map((service, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${service.color}`} />
                      <span className="text-boho-coffee font-medium">{service.name}</span>
                    </div>
                    <span className="font-mono text-boho-coffee">
                      MZN {service.amount.toLocaleString('pt-MZ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-boho-sand rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${service.color} rounded-full`}
                        style={{ width: `${service.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-boho-brown w-10 text-right">
                      {service.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <h2 className="text-xl font-display font-semibold text-boho-coffee mb-6">
              Distribuição
            </h2>
            <div className="flex items-center justify-center h-64">
              <div className="relative w-48 h-48">
                {MOCK_SERVICES_BREAKDOWN.map((service, i) => {
                  const offset = MOCK_SERVICES_BREAKDOWN.slice(0, i).reduce((sum, s) => sum + s.percentage, 0)
                  return (
                    <div
                      key={i}
                      className={`absolute w-full h-full rounded-full ${service.color}`}
                      style={{
                        clipPath: `conic-gradient(from ${offset * 3.6}deg, ${service.color.replace('bg-', '')} 0deg, ${service.color.replace('bg-', '')} ${service.percentage * 3.6}deg, transparent ${service.percentage * 3.6}deg)`
                      }}
                    />
                  )
                })}
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-display font-bold text-boho-coffee">5</p>
                    <p className="text-xs text-boho-brown">Serviços</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clients Report */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <h2 className="text-xl font-display font-semibold text-boho-coffee mb-6">
              Crescimento de Clientes
            </h2>
            <div className="h-64 flex items-end gap-4">
              {MOCK_CLIENT_GROWTH.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative h-48">
                    <div 
                      className="absolute bottom-0 w-full bg-boho-coffee/20 rounded-t-lg"
                      style={{ height: `${(data.totalClients / 60) * 192}px` }}
                    />
                    <div 
                      className="absolute bottom-0 w-full bg-boho-terracotta rounded-t-lg"
                      style={{ height: `${(data.newClients / 60) * 192}px` }}
                    />
                  </div>
                  <span className="text-xs text-boho-brown font-medium">{data.month}</span>
                  <span className="text-xs text-boho-taupe">+{data.newClients}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-boho-terracotta rounded" />
                <span className="text-sm text-boho-brown">Novos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-boho-coffee/20 rounded" />
                <span className="text-sm text-boho-brown">Total Acumulado</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <h2 className="text-xl font-display font-semibold text-boho-coffee mb-6">
              Estatísticas de Clientes
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 bg-boho-cream rounded-xl text-center">
                <p className="text-3xl font-display font-bold text-boho-coffee">56</p>
                <p className="text-sm text-boho-brown">Total de Clientes</p>
              </div>
              <div className="p-4 bg-boho-cream rounded-xl text-center">
                <p className="text-3xl font-display font-bold text-boho-coffee">24</p>
                <p className="text-sm text-boho-brown">Clientes Ativos</p>
              </div>
              <div className="p-4 bg-boho-cream rounded-xl text-center">
                <p className="text-3xl font-display font-bold text-boho-coffee">MZN 43k</p>
                <p className="text-sm text-boho-brown">Valor Médio/Cliente</p>
              </div>
              <div className="p-4 bg-boho-cream rounded-xl text-center">
                <p className="text-3xl font-display font-bold text-boho-coffee">4.2</p>
                <p className="text-sm text-boho-brown">Cotações/Cliente</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Report */}
      {activeTab === 'conversion' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <h2 className="text-xl font-display font-semibold text-boho-coffee mb-6">
              Taxa de Conversão de Cotações
            </h2>
            <div className="flex items-center justify-center h-64">
              <div className="relative w-48 h-48">
                {MOCK_QUOTE_CONVERSION.map((item, i) => {
                  const offset = MOCK_QUOTE_CONVERSION.slice(0, i).reduce((sum, s) => sum + s.percentage, 0)
                  return (
                    <div
                      key={i}
                      className={`absolute w-full h-full rounded-full ${item.color}`}
                      style={{
                        clipPath: `conic-gradient(from ${offset * 3.6}deg, ${item.color.replace('bg-', '')} 0deg, ${item.color.replace('bg-', '')} ${item.percentage * 3.6}deg, transparent ${item.percentage * 3.6}deg)`
                      }}
                    />
                  )
                })}
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-display font-bold text-boho-coffee">68%</p>
                    <p className="text-xs text-boho-brown">Conversão</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6">
              {MOCK_QUOTE_CONVERSION.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-boho-brown">{item.status} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige">
            <h2 className="text-xl font-display font-semibold text-boho-coffee mb-6">
              Detalhamento
            </h2>
            <div className="space-y-4">
              {MOCK_QUOTE_CONVERSION.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-boho-cream rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-boho-coffee">{item.status}</span>
                  </div>
                  <span className="font-mono font-medium text-boho-coffee">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-boho-beige">
              <h3 className="font-medium text-boho-coffee mb-3">Insights</h3>
              <ul className="space-y-2 text-sm text-boho-brown">
                <li className="flex items-start gap-2">
                  <span className="text-boho-sage">✓</span>
                  Taxa de conversão acima da média do setor (45%)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-boho-sage">✓</span>
                  Tempo médio de conversão: 5 dias
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-boho-mustard">!</span>
                  18% das cotações ainda pendentes de resposta
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
