import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'
import type { Payment, PaymentMethod, Proforma } from '@/types'

interface InitiatePaymentInput {
  proformaId: string
  method: PaymentMethod
  telefone?: string
  metadata?: Record<string, any>
}

interface PaymentResult {
  paymentId: string
  status: 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDO' | 'FALHADO'
  instructions?: string
  gatewayReference?: string
}

// Hook para gerenciar pagamentos
export function usePayment(proformaId?: string) {
  const queryClient = useQueryClient()
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Query para status do pagamento
  const paymentStatusQuery = useQuery({
    queryKey: proformaId ? queryKeys.payments.status(proformaId) : ['payment', 'none'],
    queryFn: async (): Promise<Payment | null> => {
      if (!proformaId) return null
      const { data } = await api.get(`/proformas/${proformaId}/payment-status`)
      return data.data
    },
    enabled: !!proformaId,
    refetchInterval: (query) => {
      const payment = query.state.data
      // Polling a cada 5 segundos enquanto estiver processando
      if (payment?.estado === 'PROCESSANDO' || payment?.estado === 'PENDENTE') {
        return 5000
      }
      return false
    },
  })

  // Mutação para iniciar pagamento
  const initiateMutation = useMutation({
    mutationFn: async (input: InitiatePaymentInput): Promise<PaymentResult> => {
      const { data } = await api.post(`/proformas/${input.proformaId}/pay`, {
        method: input.method,
        telefone: input.telefone,
        metadata: input.metadata,
      }, {
        headers: {
          'Idempotency-Key': `payment-${input.proformaId}-${Date.now()}`,
        },
      })
      return data.data
    },
    onSuccess: (result, input) => {
      // Inicia polling se estiver processando
      if (result.status === 'PROCESSANDO') {
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.status(input.proformaId) })
      }
    },
  })

  // Mutação para confirmar recebimento de dinheiro (cash)
  const confirmCashMutation = useMutation({
    mutationFn: async ({ paymentId, comprovativoUrl }: { paymentId: string; comprovativoUrl?: string }) => {
      const { data } = await api.post(`/payments/${paymentId}/confirm-cash`, { comprovativoUrl })
      return data
    },
    onSuccess: () => {
      if (proformaId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.status(proformaId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.proformas.detail(proformaId) })
        queryClient.invalidateQueries({ queryKey: queryKeys.proformas.pending })
      }
    },
  })

  // Mutação para verificar status manualmente
  const checkStatusMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const { data } = await api.get(`/payments/${paymentId}/status`)
      return data.data
    },
    onSuccess: () => {
      if (proformaId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.status(proformaId) })
      }
    },
  })

  // Limpar polling ao desmontar
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  const initiatePayment = useCallback((input: InitiatePaymentInput) => {
    return initiateMutation.mutateAsync(input)
  }, [initiateMutation])

  const confirmCashReceipt = useCallback((paymentId: string, comprovativoUrl?: string) => {
    return confirmCashMutation.mutateAsync({ paymentId, comprovativoUrl })
  }, [confirmCashMutation])

  const checkStatus = useCallback((paymentId: string) => {
    return checkStatusMutation.mutateAsync(paymentId)
  }, [checkStatusMutation])

  return {
    payment: paymentStatusQuery.data,
    paymentStatus: paymentStatusQuery.data?.estado,
    isLoading: paymentStatusQuery.isLoading,
    isPolling: paymentStatusQuery.isFetching && paymentStatusQuery.data?.estado === 'PROCESSANDO',
    // Actions
    initiatePayment,
    confirmCashReceipt,
    checkStatus,
    // States
    isInitiating: initiateMutation.isPending,
    isConfirming: confirmCashMutation.isPending,
    initiateError: initiateMutation.error,
  }
}

// Hook para histórico de pagamentos
export function usePaymentHistory(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.payments.history, page, limit],
    queryFn: async () => {
      const { data } = await api.get('/payments/history', { params: { page, limit } })
      return data
    },
  })
}

// Hook para proformas a pagar
export function useProformasToPay() {
  return useQuery({
    queryKey: queryKeys.proformas.toPay,
    queryFn: async () => {
      const { data } = await api.get('/proformas/to-pay')
      return data
    },
  })
}

// Hook para proformas pendentes (receber)
export function usePendingProformas() {
  return useQuery({
    queryKey: queryKeys.proformas.pending,
    queryFn: async (): Promise<Proforma[]> => {
      const { data } = await api.get('/proformas/pending')
      return data.data
    },
  })
}

// Hook para carteira digital
export function useWallet() {
  const queryClient = useQueryClient()

  const walletQuery = useQuery({
    queryKey: queryKeys.wallet.balance,
    queryFn: async () => {
      const { data } = await api.get('/wallet/balance')
      return data.data
    },
  })

  const withdrawMutation = useMutation({
    mutationFn: async (input: { valor: number; metodo: string; contaDestino: object }) => {
      const { data } = await api.post('/wallet/withdraw', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance })
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet.transactions })
    },
  })

  return {
    wallet: walletQuery.data,
    isLoading: walletQuery.isLoading,
    withdraw: withdrawMutation.mutateAsync,
    isWithdrawing: withdrawMutation.isPending,
  }
}

// Hook para conexão WebSocket de pagamentos em tempo real
export function useRealtimePayments() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Conectar ao WebSocket
    const ws = new WebSocket(`${(import.meta as any).env.VITE_WS_URL || 'ws://localhost:3000'}/payments`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'PAYMENT_CONFIRMED') {
        // Invalidar queries relevantes
        queryClient.invalidateQueries({ queryKey: queryKeys.proformas.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.fiscal.invoices })
        queryClient.invalidateQueries({ queryKey: queryKeys.wallet.balance })
      }
    }

    return () => {
      ws.close()
    }
  }, [queryClient])
}
