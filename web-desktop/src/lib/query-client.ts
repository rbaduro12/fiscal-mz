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

// Query keys organizados por módulo
export const queryKeys = {
  // Autenticação
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
  
  // Documentos
  documentos: {
    all: (filters?: object) => ['documentos', filters] as const,
    detail: (id: string) => ['documentos', id] as const,
    porTipo: (tipo: string, filters?: object) => ['documentos', tipo, filters] as const,
  },
  
  // Cotações
  cotacoes: {
    all: (filters?: object) => ['cotacoes', filters] as const,
    detail: (id: string) => ['cotacoes', id] as const,
    enviadas: (filters?: object) => ['cotacoes', 'enviadas', filters] as const,
    recebidas: (filters?: object) => ['cotacoes', 'recebidas', filters] as const,
  },
  
  // Proformas
  proformas: {
    all: (filters?: object) => ['proformas', filters] as const,
    detail: (id: string) => ['proformas', id] as const,
    pending: ['proformas', 'pending'] as const,
    toPay: ['proformas', 'to-pay'] as const,
  },
  
  // Faturas
  faturas: {
    all: (filters?: object) => ['faturas', filters] as const,
    detail: (id: string) => ['faturas', id] as const,
    porPeriodo: (inicio: string, fim: string) => ['faturas', 'periodo', inicio, fim] as const,
  },
  
  // Recibos
  recibos: {
    all: (filters?: object) => ['recibos', filters] as const,
    detail: (id: string) => ['recibos', id] as const,
  },
  
  // Pagamentos
  payments: {
    all: ['payments'] as const,
    history: ['payments', 'history'] as const,
    status: (id: string) => ['payments', 'status', id] as const,
  },
  
  // Fiscal / IVA
  fiscal: {
    declaracoes: (filters?: object) => ['fiscal', 'declaracoes', filters] as const,
    declaracao: (id: string) => ['fiscal', 'declaracoes', id] as const,
    modeloA: (ano: number, mes: number) => ['fiscal', 'modelo-a', ano, mes] as const,
    resumoIva: (ano: number, mes: number) => ['fiscal', 'resumo-iva', ano, mes] as const,
  },
  
  // Entidades (Clientes/Fornecedores)
  entidades: {
    all: (filters?: object) => ['entidades', filters] as const,
    detail: (id: string) => ['entidades', id] as const,
    clientes: (filters?: object) => ['entidades', 'clientes', filters] as const,
    fornecedores: (filters?: object) => ['entidades', 'fornecedores', filters] as const,
  },
  
  // Artigos (Produtos)
  artigos: {
    all: (filters?: object) => ['artigos', filters] as const,
    detail: (id: string) => ['artigos', id] as const,
    stock: (id: string) => ['artigos', id, 'stock'] as const,
    categorias: ['artigos', 'categorias'] as const,
  },
  
  // Dashboard
  dashboard: {
    resumo: ['dashboard', 'resumo'] as const,
    faturacao: (periodo?: string) => ['dashboard', 'faturacao', periodo] as const,
    alertas: ['dashboard', 'alertas'] as const,
    estatisticas: ['dashboard', 'estatisticas'] as const,
  },
  
  // Wallet (Carteira Digital)
  wallet: {
    balance: ['wallet', 'balance'] as const,
    transactions: ['wallet', 'transactions'] as const,
  },
  
  // Configurações
  settings: {
    empresa: ['settings', 'empresa'] as const,
    perfil: ['settings', 'perfil'] as const,
    preferencias: ['settings', 'preferencias'] as const,
  },
} as const

// Helper para invalidar múltiplas queries
export function invalidateQueries(queryClient: QueryClient, patterns: Array<string | readonly string[]>) {
  patterns.forEach(pattern => {
    queryClient.invalidateQueries({ queryKey: pattern })
  })
}

// Helper para cancelar queries
export function cancelQueries(queryClient: QueryClient, patterns: Array<string | readonly string[]>) {
  patterns.forEach(pattern => {
    queryClient.cancelQueries({ queryKey: pattern })
  })
}
