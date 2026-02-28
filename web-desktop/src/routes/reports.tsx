import { createFileRoute, Link } from '@tanstack/react-router'
import { FileText, Download, Calendar, TrendingUp, DollarSign, Package, Users, Loader2 } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { useDashboardFaturacao, useDashboardResumo } from '@/hooks/use-dashboard'
import { useDeclaracoesIVA } from '@/hooks/use-fiscal'
import { useState } from 'react'

export const Route = createFileRoute('/reports')({
  component: ReportsPage,
})

function ReportsPage() {
  const [periodo, setPeriodo] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [ano, setAno] = useState(new Date().getFullYear())
  
  const { data: faturacaoData, isLoading: isLoadingFaturacao } = useDashboardFaturacao(periodo)
  const { data: resumoData, isLoading: isLoadingResumo } = useDashboardResumo()
  const { data: declaracoesData, isLoading: isLoadingDeclaracoes } = useDeclaracoesIVA({ ano, limit: 12 })
  
  const isLoading = isLoadingFaturacao || isLoadingResumo || isLoadingDeclaracoes
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-boho-accent animate-spin" />
          <p className="text-boho-brown">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-boho-coffee">Relatórios</h1>
          <p className="text-boho-brown mt-1">Análise e relatórios gerenciais</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as any)}
            className="px-4 py-2 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-boho-accent hover:bg-boho-accent-hover text-white rounded-lg transition-colors">
            <Download size={18} />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <FiscalCard className="bg-gradient-to-br from-boho-terracotta/10 to-boho-terracotta/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-boho-terracotta/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-boho-terracotta" />
            </div>
            <div>
              <p className="text-2xl font-bold text-boho-coffee">
                MZN {resumoData?.totalVendasMes?.toLocaleString('pt-MZ') || 0}
              </p>
              <p className="text-sm text-boho-brown">Vendas do Mês</p>
            </div>
          </div>
        </FiscalCard>

        <FiscalCard className="bg-gradient-to-br from-boho-sage/10 to-boho-sage/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-boho-sage/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-boho-sage" />
            </div>
            <div>
              <p className="text-2xl font-bold text-boho-coffee">
                MZN {resumoData?.totalRecebido?.toLocaleString('pt-MZ') || 0}
              </p>
              <p className="text-sm text-boho-brown">Total Recebido</p>
            </div>
          </div>
        </FiscalCard>

        <FiscalCard className="bg-gradient-to-br from-boho-mustard/10 to-boho-mustard/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-boho-mustard/10 rounded-lg">
              <Package className="w-6 h-6 text-boho-mustard" />
            </div>
            <div>
              <p className="text-2xl font-bold text-boho-coffee">
                {resumoData?.cotacoesPendentes || 0}
              </p>
              <p className="text-sm text-boho-brown">Cotações Pendentes</p>
            </div>
          </div>
        </FiscalCard>

        <FiscalCard className="bg-gradient-to-br from-boho-coffee/10 to-boho-coffee/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-boho-coffee/10 rounded-lg">
              <Users className="w-6 h-6 text-boho-coffee" />
            </div>
            <div>
              <p className="text-2xl font-bold text-boho-coffee">
                {resumoData?.totalFaturas || 0}
              </p>
              <p className="text-sm text-boho-brown">Faturas Emitidas</p>
            </div>
          </div>
        </FiscalCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Faturação */}
        <FiscalCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-boho-coffee">Faturação</h2>
            <TrendingUp className="text-boho-sage" size={20} />
          </div>
          
          <div className="space-y-4">
            {faturacaoData?.labels?.map((label: string, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-boho-sand/30 rounded-lg">
                <span className="text-boho-brown">{label}</span>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-mono text-boho-coffee">
                      MZN {faturacaoData.faturado?.[index]?.toLocaleString('pt-MZ')}
                    </p>
                    <p className="text-xs text-boho-sage">
                      Recebido: MZN {faturacaoData.recebido?.[index]?.toLocaleString('pt-MZ')}
                    </p>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-boho-brown">
                <p>Sem dados de faturação para o período selecionado</p>
              </div>
            )}
          </div>
        </FiscalCard>

        {/* Declarações IVA */}
        <FiscalCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-boho-coffee">Declarações de IVA</h2>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="px-3 py-1 bg-boho-cream border border-boho-beige rounded text-boho-coffee text-sm"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>
          
          <div className="space-y-3">
            {declaracoesData?.items?.slice(0, 6).map((declaracao: any) => {
              const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
              return (
                <div key={declaracao.id} className="flex items-center justify-between p-3 bg-boho-sand/30 rounded-lg">
                  <div>
                    <p className="font-medium text-boho-coffee">
                      {meses[declaracao.periodoMes - 1]}/{declaracao.periodoAno}
                    </p>
                    <p className="text-xs text-boho-brown">
                      IVA a pagar: MZN {declaracao.q6IvaAPagar?.toLocaleString('pt-MZ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      declaracao.estado === 'SUBMETIDA' 
                        ? 'bg-boho-sage/10 text-boho-sage'
                        : declaracao.estado === 'RASCUNHO'
                        ? 'bg-boho-mustard/10 text-boho-mustard'
                        : 'bg-boho-coffee/10 text-boho-coffee'
                    }`}>
                      {declaracao.estado}
                    </span>
                  </div>
                </div>
              )
            }) || (
              <div className="text-center py-8 text-boho-brown">
                <p>Sem declarações para o ano selecionado</p>
                <Link to="/fiscal" className="text-boho-accent hover:underline text-sm">
                  Gerar primeira declaração
                </Link>
              </div>
            )}
          </div>
          
          <Link
            to="/fiscal"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 border border-boho-beige hover:border-boho-accent text-boho-brown hover:text-boho-accent rounded-lg transition-colors"
          >
            <FileText size={18} />
            Ver todas as declarações
          </Link>
        </FiscalCard>

        {/* Relatórios Disponíveis */}
        <FiscalCard>
          <h2 className="text-lg font-semibold mb-4 text-boho-coffee">Relatórios Disponíveis</h2>
          <div className="space-y-3">
            <ReportItem
              icon={<FileText className="text-boho-accent" />}
              title="Relatório de Vendas"
              description="Vendas por período, cliente e produto"
              format="PDF, Excel"
            />
            <ReportItem
              icon={<TrendingUp className="text-boho-sage" />}
              title="Análise de Stock"
              description="Movimentação e níveis de stock"
              format="PDF, Excel"
            />
            <ReportItem
              icon={<DollarSign className="text-boho-terracotta" />}
              title="Contas a Receber"
              description="Faturas pendentes e inadimplência"
              format="PDF"
            />
            <ReportItem
              icon={<Calendar className="text-boho-coffee" />}
              title="Mapa de IVA"
              description="Resumo de IVA por período"
              format="PDF, XML"
            />
          </div>
        </FiscalCard>

        {/* Dicas */}
        <FiscalCard className="bg-boho-sage/5">
          <h2 className="text-lg font-semibold mb-4 text-boho-coffee">Dicas Fiscais</h2>
          <div className="space-y-3 text-sm text-boho-brown">
            <p className="flex items-start gap-2">
              <span className="text-boho-sage">•</span>
              Submeta a declaração de IVA até o dia 20 de cada mês
            </p>
            <p className="flex items-start gap-2">
              <span className="text-boho-sage">•</span>
              Guarde todos os documentos fiscais por pelo menos 5 anos
            </p>
            <p className="flex items-start gap-2">
              <span className="text-boho-sage">•</span>
              Verifique se o NUIT dos seus clientes está correto antes de emitir faturas
            </p>
            <p className="flex items-start gap-2">
              <span className="text-boho-sage">•</span>
              A taxa de IVA normal é de 16% conforme Lei 10/2025
            </p>
          </div>
        </FiscalCard>
      </div>
    </div>
  )
}

function ReportItem({ icon, title, description, format }: { 
  icon: React.ReactNode
  title: string
  description: string
  format: string
}) {
  return (
    <div className="flex items-center gap-4 p-3 bg-boho-sand/30 rounded-lg hover:bg-boho-sand/50 transition-colors cursor-pointer">
      <div className="p-2 bg-white rounded-lg">{icon}</div>
      <div className="flex-1">
        <p className="font-medium text-boho-coffee">{title}</p>
        <p className="text-sm text-boho-brown">{description}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-boho-taupe">{format}</p>
        <button className="text-sm text-boho-accent hover:underline">
          Gerar
        </button>
      </div>
    </div>
  )
}
