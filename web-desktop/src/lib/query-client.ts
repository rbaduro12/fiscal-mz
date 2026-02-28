import { QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

// Configuração do cliente de query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: dados ficam fresh por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Cache time: dados ficam em cache por 10 minutos após último uso
      gcTime: 10 * 60 * 1000,
      // Retries: tenta 3 vezes com backoff exponencial
      retry: (failureCount, error) => {
        // Não retry em erros 4xx (client errors)
        if (error instanceof AxiosError && error.response?.status) {
          const status = error.response.status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus: desabilitado para melhor UX
      refetchOnWindowFocus: false,
      // Refetch on reconnect: habilitado para manter dados atualizados
      refetchOnReconnect: true,
      // Network mode: online significa que só busca quando online
      networkMode: 'online',
    },
    mutations: {
      // Retry em mutações: só em erros de rede, não em 4xx/5xx
      retry: (failureCount, error) => {
        if (error instanceof AxiosError && !error.response) {
          // Erro de rede, retry
          return failureCount < 2
        }
        return false
      },
      retryDelay: 1000,
    },
  },
})

// Query keys organizados
export const queryKeys = {
  quotes: {
    all: ['quotes'] as const,
    sent: (filters?: object) => ['quotes', 'sent', filters] as const,
    received: (filters?: object) => ['quotes', 'received', filters] as const,
    detail: (id: string) => ['quotes', id] as const,
  },
  proformas: {
    all: ['proformas'] as const,
    pending: ['proformas', 'pending'] as const,
    toPay: ['proformas', 'to-pay'] as const,
    detail: (id: string) => ['proformas', id] as const,
  },
  payments: {
    all: ['payments'] as const,
    history: ['payments', 'history'] as const,
    status: (id: string) => ['payments', 'status', id] as const,
  },
  fiscal: {
    invoices: ['fiscal', 'invoices'] as const,
    series: ['fiscal', 'series'] as const,
    validation: (data: object) => ['fiscal', 'validation', data] as const,
  },
  wallet: {
    balance: ['wallet', 'balance'] as const,
    transactions: ['wallet', 'transactions'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    alerts: ['dashboard', 'alerts'] as const,
  },
} as const
