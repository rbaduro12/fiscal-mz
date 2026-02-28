import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'
import type { Quote, CreateQuoteInput, AcceptQuoteInput } from '@/types'

// Hook para gerenciar o workflow de cotações
export function useQuoteWorkflow(quoteId?: string) {
  const queryClient = useQueryClient()

  // Query para buscar detalhes da cotação
  const quoteQuery = useQuery({
    queryKey: quoteId ? queryKeys.quotes.detail(quoteId) : ['quote', 'none'],
    queryFn: async (): Promise<Quote> => {
      if (!quoteId) throw new Error('Quote ID is required')
      const { data } = await api.get(`/quotes/${quoteId}`)
      return data.data
    },
    enabled: !!quoteId,
  })

  // Mutação para aceitar cotação (otimista)
  const acceptMutation = useMutation({
    mutationFn: async (input: AcceptQuoteInput) => {
      const { data } = await api.patch(`/quotes/${quoteId}/accept`, input)
      return data
    },
    // Otimistic update
    onMutate: async (_input) => {
      // Cancela queries pendentes
      await queryClient.cancelQueries({ queryKey: queryKeys.quotes.detail(quoteId!) })
      
      // Snapshot do estado anterior
      const previousQuote = queryClient.getQueryData<Quote>(queryKeys.quotes.detail(quoteId!))
      
      // Atualiza otimisticamente
      if (previousQuote) {
        queryClient.setQueryData(queryKeys.quotes.detail(quoteId!), {
          ...previousQuote,
          status: 'ACEITE',
          updatedAt: new Date().toISOString(),
        })
      }
      
      return { previousQuote }
    },
    onError: (_err, _input, context) => {
      // Rollback em caso de erro
      if (context?.previousQuote) {
        queryClient.setQueryData(queryKeys.quotes.detail(quoteId!), context.previousQuote)
      }
    },
    onSuccess: () => {
      // Invalida e refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.detail(quoteId!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.sent() })
      queryClient.invalidateQueries({ queryKey: queryKeys.proformas.all })
    },
  })

  // Mutação para rejeitar cotação
  const rejectMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch(`/quotes/${quoteId}/reject`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.detail(quoteId!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.sent() })
    },
  })

  // Mutação para contra-proposta
  const counterOfferMutation = useMutation({
    mutationFn: async (input: AcceptQuoteInput) => {
      const { data } = await api.patch(`/quotes/${quoteId}/counter-offer`, input)
      return data
    },
    onMutate: async (_input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.quotes.detail(quoteId!) })
      const previousQuote = queryClient.getQueryData<Quote>(queryKeys.quotes.detail(quoteId!))
      
      if (previousQuote) {
        queryClient.setQueryData(queryKeys.quotes.detail(quoteId!), {
          ...previousQuote,
          status: 'NEGOCIANDO',
          updatedAt: new Date().toISOString(),
        })
      }
      
      return { previousQuote }
    },
    onError: (_err, _input, context) => {
      if (context?.previousQuote) {
        queryClient.setQueryData(queryKeys.quotes.detail(quoteId!), context.previousQuote)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.detail(quoteId!) })
    },
  })

  // Mutação para enviar cotação
  const sendMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/quotes/${quoteId}/send`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.detail(quoteId!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.sent() })
    },
  })

  // Actions memoizadas
  const acceptQuote = useCallback((input?: AcceptQuoteInput) => {
    return acceptMutation.mutateAsync(input || {})
  }, [acceptMutation])

  const rejectQuote = useCallback(() => {
    return rejectMutation.mutateAsync()
  }, [rejectMutation])

  const counterOffer = useCallback((input: AcceptQuoteInput) => {
    return counterOfferMutation.mutateAsync(input)
  }, [counterOfferMutation])

  const sendQuote = useCallback(() => {
    return sendMutation.mutateAsync()
  }, [sendMutation])

  return {
    quote: quoteQuery.data,
    isLoading: quoteQuery.isLoading,
    isError: quoteQuery.isError,
    error: quoteQuery.error,
    // Actions
    acceptQuote,
    rejectQuote,
    counterOffer,
    sendQuote,
    // States
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isCounterOffering: counterOfferMutation.isPending,
    isSending: sendMutation.isPending,
  }
}

// Hook para criar nova cotação
export function useCreateQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateQuoteInput) => {
      const { data } = await api.post('/quotes', input, {
        headers: {
          'Idempotency-Key': `create-quote-${Date.now()}-${input.clientId}`,
        },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quotes.sent() })
    },
  })
}

// Hook para listar cotações enviadas
export function useSentQuotes(filters?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.quotes.sent(filters),
    queryFn: async () => {
      const { data } = await api.get('/quotes/sent', { params: filters })
      return data
    },
  })
}

// Hook para listar cotações recebidas
export function useReceivedQuotes(filters?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.quotes.received(filters),
    queryFn: async () => {
      const { data } = await api.get('/quotes/received', { params: filters })
      return data
    },
  })
}
