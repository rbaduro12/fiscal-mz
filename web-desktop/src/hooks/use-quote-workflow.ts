import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'
import type { Cotacao, CriarCotacaoInput } from '@/types'

interface AceitarCotacaoInput {
  notas?: string
  prazoEntrega?: number
}

// Hook para gerenciar o workflow de cotações
export function useQuoteWorkflow(cotacaoId?: string) {
  const queryClient = useQueryClient()

  // Query para buscar detalhes da cotação
  const quoteQuery = useQuery({
    queryKey: cotacaoId ? queryKeys.cotacoes.detail(cotacaoId) : ['cotacao', 'none'],
    queryFn: async (): Promise<Cotacao> => {
      if (!cotacaoId) throw new Error('ID da cotação é obrigatório')
      const { data } = await api.get(`/cotacoes/${cotacaoId}`)
      return data.data
    },
    enabled: !!cotacaoId,
  })

  // Mutação para aceitar cotação (otimista)
  const acceptMutation = useMutation({
    mutationFn: async (input: AceitarCotacaoInput) => {
      const { data } = await api.post(`/cotacoes/${cotacaoId}/aceitar`, input)
      return data
    },
    // Otimistic update
    onMutate: async (_input) => {
      // Cancela queries pendentes
      await queryClient.cancelQueries({ queryKey: queryKeys.cotacoes.detail(cotacaoId!) })
      
      // Snapshot do estado anterior
      const previousQuote = queryClient.getQueryData<Cotacao>(queryKeys.cotacoes.detail(cotacaoId!))
      
      // Atualiza otimisticamente
      if (previousQuote) {
        queryClient.setQueryData(queryKeys.cotacoes.detail(cotacaoId!), {
          ...previousQuote,
          estado: 'ACEITE',
          updatedAt: new Date().toISOString(),
        })
      }
      
      return { previousQuote }
    },
    onError: (_err, _input, context) => {
      // Rollback em caso de erro
      if (context?.previousQuote) {
        queryClient.setQueryData(queryKeys.cotacoes.detail(cotacaoId!), context.previousQuote)
      }
    },
    onSuccess: () => {
      // Invalida e refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.cotacoes.detail(cotacaoId!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.cotacoes.all({}) })
      queryClient.invalidateQueries({ queryKey: queryKeys.proformas.all({}) })
    },
  })

  // Mutação para rejeitar cotação
  const rejectMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/cotacoes/${cotacaoId}/rejeitar`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cotacoes.detail(cotacaoId!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.cotacoes.all({}) })
    },
  })

  // Actions memoizadas
  const acceptQuote = useCallback((input?: AceitarCotacaoInput) => {
    return acceptMutation.mutateAsync(input || {})
  }, [acceptMutation])

  const rejectQuote = useCallback(() => {
    return rejectMutation.mutateAsync()
  }, [rejectMutation])

  return {
    quote: quoteQuery.data,
    isLoading: quoteQuery.isLoading,
    isError: quoteQuery.isError,
    error: quoteQuery.error,
    // Actions
    acceptQuote,
    rejectQuote,
    // States
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
  }
}

// Hook para criar nova cotação
export function useCreateQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CriarCotacaoInput) => {
      const { data } = await api.post('/cotacoes', input, {
        headers: {
          'Idempotency-Key': `create-quote-${Date.now()}-${input.entidadeId}`,
        },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cotacoes.all({}) })
    },
  })
}

// Hook para listar cotações enviadas
export function useSentQuotes(filters?: { estado?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.cotacoes.all(filters),
    queryFn: async () => {
      const { data } = await api.get('/cotacoes', { params: filters })
      return data
    },
  })
}

// Hook para listar cotações recebidas
export function useReceivedQuotes(filters?: { estado?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.cotacoes.recebidas(filters),
    queryFn: async () => {
      const { data } = await api.get('/cotacoes/recebidas', { params: filters })
      return data
    },
  })
}
