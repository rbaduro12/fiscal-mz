import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'

// ============================================
// TIPOS
// ============================================

export interface ResumoDashboard {
  totalVendasMes: number
  totalPendente: number
  totalRecebido: number
  proformasVencendo: number
  cotacoesPendentes: number
  totalFaturas: number
  totalRecibos: number
}

export interface EstatisticasFaturacao {
  periodo: string
  labels: string[]
  faturado: number[]
  recebido: number[]
  pendente: number[]
}

export interface Alerta {
  id: string
  tipo: 'WARNING' | 'DANGER' | 'INFO' | 'SUCCESS'
  titulo: string
  mensagem: string
  data: string
  acao?: {
    label: string
    rota: string
  }
}

// ============================================
// HOOKS
// ============================================

// Resumo do dashboard
export function useDashboardResumo() {
  return useQuery({
    queryKey: queryKeys.dashboard.resumo,
    queryFn: async (): Promise<ResumoDashboard> => {
      const response = await dashboardService.obterResumo()
      return response.data
    },
    // Refresh a cada 5 minutos
    refetchInterval: 5 * 60 * 1000,
  })
}

// Estatísticas de faturação por período
export function useDashboardFaturacao(periodo: '7d' | '30d' | '90d' | '1y' = '30d') {
  return useQuery({
    queryKey: queryKeys.dashboard.faturacao(periodo),
    queryFn: async (): Promise<EstatisticasFaturacao> => {
      const response = await dashboardService.obterEstatisticasFaturacao(periodo)
      return response.data
    },
  })
}

// Alertas do dashboard
export function useDashboardAlertas() {
  return useQuery({
    queryKey: queryKeys.dashboard.alertas,
    queryFn: async (): Promise<Alerta[]> => {
      const response = await dashboardService.obterAlertas()
      return response.data
    },
    // Refresh a cada 2 minutos
    refetchInterval: 2 * 60 * 1000,
  })
}

// Hook completo para dashboard
export function useDashboard(periodo?: '7d' | '30d' | '90d' | '1y') {
  const resumo = useDashboardResumo()
  const faturacao = useDashboardFaturacao(periodo)
  const alertas = useDashboardAlertas()

  const isLoading = resumo.isLoading || faturacao.isLoading || alertas.isLoading
  const isError = resumo.isError || faturacao.isError || alertas.isError

  return {
    resumo: resumo.data,
    faturacao: faturacao.data,
    alertas: alertas.data,
    isLoading,
    isError,
    refetch: () => {
      resumo.refetch()
      faturacao.refetch()
      alertas.refetch()
    },
  }
}
