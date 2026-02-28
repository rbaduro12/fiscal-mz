import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { documentosService } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'

// ============================================
// HOOKS DE DOCUMENTOS
// ============================================

// Tipos
export interface LinhaDocumento {
  id: string
  artigoId: string
  descricao: string
  quantidade: number
  precoUnitario: number
  descontoPercent: number
  ivaPercent: number
  totalLinha: number
}

export interface Documento {
  id: string
  tipo: 'COTACAO' | 'PROFORMA' | 'FACTURA' | 'RECIBO'
  serie: string
  numero: number
  numeroCompleto: string
  estado: 'RASCUNHO' | 'EMITIDA' | 'ACEITE' | 'REJEITADA' | 'PAGA' | 'PROCESSADA' | 'ANULADA'
  entidadeId: string
  entidade?: {
    id: string
    nome: string
    nuit: string
    email?: string
    telefone?: string
  }
  subtotal: number
  totalDescontos: number
  totalIva: number
  totalPagar: number
  dataEmissao: string
  dataValidade?: string
  linhas: LinhaDocumento[]
  hashFiscal?: string
  qrCodeData?: string
  documentoOrigemId?: string
  createdAt: string
  updatedAt: string
}

export interface CriarCotacaoInput {
  entidadeId: string
  itens: Array<{
    artigoId: string
    quantidade: number
    precoUnitario: number
    descontoPercent?: number
  }>
  validadeDias?: number
}

export interface DadosPagamentoInput {
  metodo: 'CASH' | 'MPESA' | 'EMOLA' | 'BIM' | 'CARTAO'
  valorPago: number
  referenciaMpesa?: string
}

// Hook para listar documentos
export function useDocumentos(params?: {
  tipo?: 'COTACAO' | 'PROFORMA' | 'FACTURA' | 'RECIBO'
  estado?: string
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: queryKeys.documentos.all(params),
    queryFn: async () => {
      const response = await documentosService.listar(params)
      return response.data
    },
  })
}

// Hook para obter detalhes de um documento
export function useDocumento(id?: string) {
  return useQuery({
    queryKey: queryKeys.documentos.detail(id!),
    queryFn: async (): Promise<Documento> => {
      if (!id) throw new Error('ID do documento é obrigatório')
      const response = await documentosService.obter(id)
      return response.data
    },
    enabled: !!id,
  })
}

// ============================================
// WORKFLOW DE COTAÇÕES
// ============================================

export function useCotacaoWorkflow(cotacaoId?: string) {
  const queryClient = useQueryClient()

  // Query para buscar detalhes da cotação
  const cotacaoQuery = useDocumento(cotacaoId)

  // Mutação para criar cotação
  const criarMutation = useMutation({
    mutationFn: async (input: CriarCotacaoInput) => {
      const response = await documentosService.criarCotacao(input)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documentos.all({ tipo: 'COTACAO' }) })
    },
  })

  // Mutação para aceitar cotação (otimista)
  const aceitarMutation = useMutation({
    mutationFn: async (dadosPagamento?: DadosPagamentoInput) => {
      if (!cotacaoId) throw new Error('ID da cotação é obrigatório')
      const response = await documentosService.aceitarCotacao(cotacaoId, dadosPagamento)
      return response.data
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.documentos.detail(cotacaoId!) })
      const previousCotacao = queryClient.getQueryData<Documento>(queryKeys.documentos.detail(cotacaoId!))
      
      if (previousCotacao) {
        queryClient.setQueryData(queryKeys.documentos.detail(cotacaoId!), {
          ...previousCotacao,
          estado: 'ACEITE',
          updatedAt: new Date().toISOString(),
        })
      }
      
      return { previousCotacao }
    },
    onError: (_err, _input, context) => {
      if (context?.previousCotacao) {
        queryClient.setQueryData(queryKeys.documentos.detail(cotacaoId!), context.previousCotacao)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documentos.detail(cotacaoId!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.documentos.all() })
    },
  })

  // Mutação para rejeitar cotação
  const rejeitarMutation = useMutation({
    mutationFn: async (motivo?: string) => {
      if (!cotacaoId) throw new Error('ID da cotação é obrigatório')
      // Implementar endpoint de rejeição no backend
      const response = await documentosService.atualizar(cotacaoId, { estado: 'REJEITADA', motivo })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documentos.detail(cotacaoId!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.documentos.all() })
    },
  })

  const criarCotacao = useCallback((input: CriarCotacaoInput) => {
    return criarMutation.mutateAsync(input)
  }, [criarMutation])

  const aceitarCotacao = useCallback((dadosPagamento?: DadosPagamentoInput) => {
    return aceitarMutation.mutateAsync(dadosPagamento)
  }, [aceitarMutation])

  const rejeitarCotacao = useCallback((motivo?: string) => {
    return rejeitarMutation.mutateAsync(motivo)
  }, [rejeitarMutation])

  return {
    cotacao: cotacaoQuery.data,
    isLoading: cotacaoQuery.isLoading,
    isError: cotacaoQuery.isError,
    error: cotacaoQuery.error,
    // Actions
    criarCotacao,
    aceitarCotacao,
    rejeitarCotacao,
    // States
    isCreating: criarMutation.isPending,
    isAccepting: aceitarMutation.isPending,
    isRejecting: rejeitarMutation.isPending,
  }
}

// ============================================
// PAGAMENTOS
// ============================================

export function usePagamento(proformaId?: string) {
  const queryClient = useQueryClient()

  // Query para status do pagamento
  const statusQuery = useQuery({
    queryKey: queryKeys.payments.status(proformaId!),
    queryFn: async () => {
      if (!proformaId) return null
      const response = await documentosService.obter(proformaId)
      return response.data
    },
    enabled: !!proformaId,
    refetchInterval: (query) => {
      const doc = query.state.data
      // Polling a cada 5 segundos enquanto estiver processando
      if (doc?.estado === 'PROCESSANDO' || doc?.estado === 'PENDENTE') {
        return 5000
      }
      return false
    },
  })

  // Mutação para processar pagamento
  const processarMutation = useMutation({
    mutationFn: async (dadosPagamento: DadosPagamentoInput) => {
      if (!proformaId) throw new Error('ID da proforma é obrigatório')
      const response = await documentosService.processarPagamento(proformaId, dadosPagamento)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.status(proformaId!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.documentos.all() })
    },
  })

  const processarPagamento = useCallback((dadosPagamento: DadosPagamentoInput) => {
    return processarMutation.mutateAsync(dadosPagamento)
  }, [processarMutation])

  return {
    documento: statusQuery.data,
    status: statusQuery.data?.estado,
    isLoading: statusQuery.isLoading,
    isPolling: statusQuery.isFetching && (statusQuery.data?.estado === 'PROCESSANDO' || statusQuery.data?.estado === 'PENDENTE'),
    processarPagamento,
    isProcessing: processarMutation.isPending,
    processError: processarMutation.error,
  }
}

// ============================================
// LISTAGENS ESPECÍFICAS
// ============================================

export function useCotacoes(params?: { estado?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.cotacoes.all(params),
    queryFn: async () => {
      const response = await documentosService.listar({ tipo: 'COTACAO', ...params })
      return response.data
    },
  })
}

export function useProformas(params?: { estado?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.proformas.all(params),
    queryFn: async () => {
      const response = await documentosService.listar({ tipo: 'PROFORMA', ...params })
      return response.data
    },
  })
}

export function useFaturas(params?: { estado?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.faturas.all(params),
    queryFn: async () => {
      const response = await documentosService.listar({ tipo: 'FACTURA', ...params })
      return response.data
    },
  })
}
