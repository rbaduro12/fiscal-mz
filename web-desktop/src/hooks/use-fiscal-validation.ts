import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'
import type { QuoteItem } from '@/types'

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  hash?: string
  qrCode?: string
  calculatedTotals?: {
    subtotal: number
    totalIva: number
    totalGeral: number
  }
}

interface FiscalValidationInput {
  clienteId: string
  itens: QuoteItem[]
  tipo: 'FT' | 'FR' | 'NC'
}

// Hook para validação fiscal
export function useFiscalValidation() {
  // Mutação para validar dados fiscais
  const validationMutation = useMutation({
    mutationFn: async (input: FiscalValidationInput): Promise<ValidationResult> => {
      const { data } = await api.post('/fiscal/validate', input)
      return data.data
    },
  })

  // Query para verificar estado da série fiscal
  const seriesQuery = useQuery({
    queryKey: queryKeys.fiscal.series,
    queryFn: async () => {
      const { data } = await api.get('/fiscal/series-status')
      return data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })

  // Calcular totais localmente (validação client-side)
  const calculateTotals = useCallback((itens: QuoteItem[]) => {
    const subtotal = itens.reduce((sum, item) => sum + (item.quantidade * item.precoUnit), 0)
    const totalIva = itens.reduce((sum, item) => {
      const base = item.quantidade * item.precoUnit * (1 - (item.descontoPercent || 0) / 100)
      return sum + (base * (item.ivaPercent || 16) / 100)
    }, 0)
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalIva: Math.round(totalIva * 100) / 100,
      totalGeral: Math.round((subtotal + totalIva) * 100) / 100,
    }
  }, [])

  // Verificar se há diferença significativa no IVA
  const checkIvaDifference = useCallback((
    expectedIva: number,
    calculatedIva: number,
    tolerance: number = 0.05
  ): boolean => {
    return Math.abs(expectedIva - calculatedIva) <= tolerance
  }, [])

  // Validar NUIT (simplified validation)
  const validateNuit = useCallback((nuit: string): boolean => {
    // NUIT deve ter 9 dígitos
    if (!/^\d{9}$/.test(nuit)) return false
    
    // Cálculo do dígito de controle
    const digits = nuit.split('').map(Number)
    const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3]
    let sum = 0
    
    for (let i = 0; i < 8; i++) {
      sum += digits[i] * weights[i]
    }
    
    const remainder = sum % 11
    const checkDigit = remainder === 0 || remainder === 1 ? 0 : 11 - remainder
    
    return checkDigit === digits[8]
  }, [])

  const validate = useCallback((input: FiscalValidationInput) => {
    return validationMutation.mutateAsync(input)
  }, [validationMutation])

  const isValidating = validationMutation.isPending

  return {
    validate,
    isValidating,
    validationResult: validationMutation.data,
    validationError: validationMutation.error,
    // Helpers
    calculateTotals,
    checkIvaDifference,
    validateNuit,
    // Series info
    seriesInfo: seriesQuery.data,
    isLoadingSeries: seriesQuery.isLoading,
  }
}

// Hook para emissão de fatura fiscal
export function useEmitInvoice() {
  return useMutation({
    mutationFn: async (input: {
      proformaId: string
      hash?: string
    }) => {
      const { data } = await api.post('/fiscal/invoices', input)
      return data
    },
  })
}

// Hook para listar faturas emitidas
export function useInvoices(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.fiscal.invoices, page, limit],
    queryFn: async () => {
      const { data } = await api.get('/fiscal/invoices', { params: { page, limit } })
      return data
    },
  })
}

// Hook para dashboard fiscal
export function useFiscalDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: async () => {
      const { data } = await api.get('/dashboard/fiscal-stats')
      return data.data
    },
  })
}

// Hook para verificar alertas fiscais
export function useFiscalAlerts() {
  return useQuery({
    queryKey: queryKeys.dashboard.alerts,
    queryFn: async () => {
      const { data } = await api.get('/fiscal/alerts')
      return data.data as Array<{
        type: 'WARNING' | 'ERROR' | 'INFO'
        message: string
        action?: string
      }>
    },
    refetchInterval: 60000, // Refetch a cada minuto
  })
}
