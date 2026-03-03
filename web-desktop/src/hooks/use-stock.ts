import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'

// ============================================
// TIPOS
// ============================================

export interface MovimentoStock {
  id: string
  artigoId: string
  artigo?: {
    id: string
    codigo: string
    descricao: string
  }
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO'
  quantidade: number
  stockAnterior: number
  stockAtual: number
  documentoId?: string
  referencia?: string
  observacoes?: string
  dataMovimento: string
  createdAt: string
}

export interface ResumoStock {
  artigoId: string
  codigo: string
  descricao: string
  stockAtual: number
  stockMinimo: number
  stockMaximo: number
  valorTotal: number
  ultimaEntrada?: string
  ultimaSaida?: string
}

export interface AlertaStock {
  artigoId: string
  codigo: string
  descricao: string
  stockAtual: number
  stockMinimo: number
  stockMaximo: number
}

export interface EntradaStockInput {
  artigoId: string
  quantidade: number
  observacoes?: string
  referencia?: string
  documentoId?: string
}

export interface SaidaStockInput {
  artigoId: string
  quantidade: number
  observacoes?: string
  referencia?: string
  documentoId?: string
}

export interface AjusteStockInput {
  artigoId: string
  quantidadeReal: number
  motivo: string
  documentoId?: string
}

// ============================================
// HOOKS DE CONSULTA
// ============================================

export function useMovimentosStock(artigoId?: string) {
  return useQuery({
    queryKey: queryKeys.stock.movimentos(artigoId!),
    queryFn: async (): Promise<MovimentoStock[]> => {
      if (!artigoId) return []
      const { data } = await api.get(`/stock/movimentos/${artigoId}`)
      return data || []
    },
    enabled: !!artigoId,
  })
}

export function useResumoStock() {
  return useQuery({
    queryKey: queryKeys.stock.resumo(),
    queryFn: async (): Promise<ResumoStock[]> => {
      const { data } = await api.get('/stock/resumo')
      return data || []
    },
  })
}

export function useAlertasStock() {
  return useQuery({
    queryKey: queryKeys.stock.alertas(),
    queryFn: async (): Promise<AlertaStock[]> => {
      const { data } = await api.get('/stock/alertas')
      return data || []
    },
  })
}

export function useStockAtual(artigoId?: string) {
  return useQuery({
    queryKey: queryKeys.stock.atual(artigoId!),
    queryFn: async (): Promise<{ artigoId: string; stockAtual: number }> => {
      if (!artigoId) throw new Error('ID do artigo é obrigatório')
      const { data } = await api.get(`/stock/atual/${artigoId}`)
      return data
    },
    enabled: !!artigoId,
  })
}

// ============================================
// HOOKS DE MUTAÇÃO
// ============================================

export function useEntradaStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: EntradaStockInput): Promise<MovimentoStock> => {
      const { data } = await api.post('/stock/entrada', input)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.movimentos(variables.artigoId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.atual(variables.artigoId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.artigos.all() })
    },
  })
}

export function useSaidaStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SaidaStockInput): Promise<MovimentoStock> => {
      const { data } = await api.post('/stock/saida', input)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.movimentos(variables.artigoId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.atual(variables.artigoId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.artigos.all() })
    },
  })
}

export function useAjusteStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AjusteStockInput): Promise<MovimentoStock> => {
      const { data } = await api.post('/stock/ajuste', input)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.movimentos(variables.artigoId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.stock.atual(variables.artigoId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.artigos.all() })
    },
  })
}

export function useValidarStock() {
  return useMutation({
    mutationFn: async (itens: { artigoId: string; quantidade: number }[]): Promise<{
      valido: boolean
      semStock: Array<{
        artigoId: string
        codigo: string
        descricao: string
        solicitado: number
        disponivel: number
        falta: number
      }>
    }> => {
      const { data } = await api.post('/stock/validar', { itens })
      return data
    },
  })
}
