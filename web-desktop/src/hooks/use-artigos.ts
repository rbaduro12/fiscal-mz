import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { artigosService } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'

// ============================================
// TIPOS
// ============================================

export interface Artigo {
  id: string
  codigo: string
  descricao: string
  tipo: 'PRODUTO' | 'SERVICO'
  precoUnitario: number
  ivaPercent: number
  stockAtual: number
  stockMinimo?: number
  stockMaximo?: number
  categoria?: string
  ativo: boolean
  createdAt: string
  updatedAt?: string
}

export interface CriarArtigoInput {
  codigo: string
  descricao: string
  precoUnitario: number
  ivaPercent?: number
  stock?: number
  categoria?: string
}

export interface AtualizarArtigoInput {
  descricao?: string
  precoUnitario?: number
  ivaPercent?: number
  categoria?: string
}

// ============================================
// HOOKS
// ============================================

// Listar artigos
export function useArtigos(params?: {
  page?: number
  limit?: number
  search?: string
  categoria?: string
  comStock?: boolean
}) {
  return useQuery({
    queryKey: queryKeys.artigos.all(params),
    queryFn: async () => {
      const response = await artigosService.listar(params)
      return response
    },
  })
}

// Listar apenas produtos (tipo PRODUTO) da empresa atual
export function useProdutos(params?: {
  page?: number
  limit?: number
  search?: string
}) {
  const { data: artigos, ...rest } = useArtigos(params)
  
  // Filtrar apenas produtos
  const produtos = artigos?.filter((a: Artigo) => a.tipo === 'PRODUTO') || []
  
  return { data: produtos, ...rest }
}

// Listar apenas serviços (tipo SERVICO) da empresa atual
export function useServicos(params?: {
  page?: number
  limit?: number
  search?: string
}) {
  const { data: artigos, ...rest } = useArtigos(params)
  
  // Filtrar apenas serviços
  const servicos = artigos?.filter((a: Artigo) => a.tipo === 'SERVICO') || []
  
  return { data: servicos, ...rest }
}

// Obter detalhes de um artigo
export function useArtigo(id?: string) {
  return useQuery({
    queryKey: queryKeys.artigos.detail(id!),
    queryFn: async (): Promise<Artigo> => {
      if (!id) throw new Error('ID do artigo é obrigatório')
      const response = await artigosService.obter(id)
      return response
    },
    enabled: !!id,
  })
}

// Obter stock de um artigo
export function useStockArtigo(id?: string) {
  return useQuery({
    queryKey: queryKeys.artigos.stock(id!),
    queryFn: async () => {
      if (!id) throw new Error('ID do artigo é obrigatório')
      const response = await artigosService.obterStock(id)
      return response
    },
    enabled: !!id,
  })
}

// Criar novo artigo
export function useCriarArtigo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CriarArtigoInput) => {
      const response = await artigosService.criar(input)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.artigos.all() })
    },
  })
}

// Atualizar artigo
export function useAtualizarArtigo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AtualizarArtigoInput }) => {
      const response = await artigosService.atualizar(id, data)
      return response
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.artigos.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.artigos.all() })
    },
  })
}

// Hook completo para gerenciamento de artigos
export function useArtigoManager(artigoId?: string) {
  const artigoQuery = useArtigo(artigoId)
  const stockQuery = useStockArtigo(artigoId)
  const criarMutation = useCriarArtigo()
  const atualizarMutation = useAtualizarArtigo()

  const criar = useCallback((input: CriarArtigoInput) => {
    return criarMutation.mutateAsync(input)
  }, [criarMutation])

  const atualizar = useCallback((id: string, input: AtualizarArtigoInput) => {
    return atualizarMutation.mutateAsync({ id, data: input })
  }, [atualizarMutation])

  return {
    artigo: artigoQuery.data,
    stock: stockQuery.data,
    isLoading: artigoQuery.isLoading,
    isLoadingStock: stockQuery.isLoading,
    isError: artigoQuery.isError,
    error: artigoQuery.error,
    criar,
    atualizar,
    isCreating: criarMutation.isPending,
    isUpdating: atualizarMutation.isPending,
  }
}
