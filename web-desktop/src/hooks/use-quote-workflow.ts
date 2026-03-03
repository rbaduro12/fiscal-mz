import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { cotacoesService, type CriarCotacaoInput, type AceitarCotacaoInput } from '@/services/cotacoes.service'
import { queryKeys } from '@/lib/query-client'
import type { Cotacao } from '@/types'

// Hook para gerenciar o workflow de cotações (CQRS)
export function useQuoteWorkflow(cotacaoId?: string) {
  const queryClient = useQueryClient()

  // Query para buscar detalhes da cotação
  const quoteQuery = useQuery({
    queryKey: cotacaoId ? queryKeys.cotacoes.detail(cotacaoId) : ['cotacao', 'none'],
    queryFn: async (): Promise<Cotacao> => {
      if (!cotacaoId) throw new Error('ID da cotação é obrigatório')
      return cotacoesService.obter(cotacaoId)
    },
    enabled: !!cotacaoId,
  })

  // Mutação para aceitar cotação (otimista)
  const acceptMutation = useMutation({
    mutationFn: async (input: AceitarCotacaoInput) => {
      if (!cotacaoId) throw new Error('ID da cotação é obrigatório')
      return cotacoesService.aceitar(cotacaoId, input)
    },
    onMutate: async (_input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cotacoes.detail(cotacaoId!) })
      
      const previousQuote = queryClient.getQueryData<Cotacao>(queryKeys.cotacoes.detail(cotacaoId!))
      
      if (previousQuote) {
        queryClient.setQueryData(queryKeys.cotacoes.detail(cotacaoId!), {
          ...previousQuote,
          status: 'ACEITE',
          updatedAt: new Date().toISOString(),
        })
      }
      
      return { previousQuote }
    },
    onError: (_err, _input, context) => {
      if (context?.previousQuote) {
        queryClient.setQueryData(queryKeys.cotacoes.detail(cotacaoId!), context.previousQuote)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cotacoes.detail(cotacaoId!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.cotacoes.all({}) })
    },
  })

  // Mutação para gerar proforma
  const generateProformaMutation = useMutation({
    mutationFn: async () => {
      if (!cotacaoId) throw new Error('ID da cotação é obrigatório')
      return cotacoesService.gerarProforma(cotacaoId)
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

  const generateProforma = useCallback(() => {
    return generateProformaMutation.mutateAsync()
  }, [generateProformaMutation])

  return {
    quote: quoteQuery.data,
    isLoading: quoteQuery.isLoading,
    isError: quoteQuery.isError,
    error: quoteQuery.error,
    // Actions
    acceptQuote,
    generateProforma,
    // States
    isAccepting: acceptMutation.isPending,
    isGeneratingProforma: generateProformaMutation.isPending,
  }
}

// Hook para criar nova cotação
export function useCreateQuote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CriarCotacaoInput) => {
      const idempotencyKey = `create-quote-${Date.now()}-${input.clienteId}`
      return cotacoesService.criar(input, idempotencyKey)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cotacoes.all({}) })
    },
  })
}

// Hook para listar cotações enviadas (vendedor)
export function useSentQuotes(filters?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.cotacoes.all(filters),
    queryFn: async () => {
      return cotacoesService.listarEnviadas(filters)
    },
  })
}

// Hook para listar cotações recebidas (cliente)
export function useReceivedQuotes(filters?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.cotacoes.recebidas(filters),
    queryFn: async () => {
      return cotacoesService.listarRecebidas(filters)
    },
  })
}

// Hook para iniciar pagamento
export function useInitiatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      proformaId, 
      method, 
      metadata 
    }: { 
      proformaId: string; 
      method: 'MPESA' | 'CASH' | 'ESCROW' | 'CARTAO';
      metadata?: any;
    }) => {
      return cotacoesService.iniciarPagamento(proformaId, method, metadata)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.proformas.all({}) })
    },
  })
}

// Hook para wallet
export function useWalletBalance() {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      return cotacoesService.obterSaldoWallet()
    },
  })
}
