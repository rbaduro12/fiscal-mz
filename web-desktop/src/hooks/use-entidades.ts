import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { entidadesService } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'

// ============================================
// TIPOS
// ============================================

export interface Entidade {
  id: string
  nome: string
  nuit: string
  tipo: 'CLIENTE' | 'FORNECEDOR' | 'AMBOS'
  email?: string
  telefone?: string
  endereco?: string
  cidade?: string
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface CriarEntidadeInput {
  nome: string
  nuit: string
  tipo: 'CLIENTE' | 'FORNECEDOR' | 'AMBOS'
  email?: string
  telefone?: string
  endereco?: string
  cidade?: string
}

export interface AtualizarEntidadeInput {
  nome?: string
  email?: string
  telefone?: string
  endereco?: string
  cidade?: string
  ativo?: boolean
}

// ============================================
// HOOKS
// ============================================

// Listar todas as entidades
export function useEntidades(params?: {
  tipo?: string
  page?: number
  limit?: number
  search?: string
}) {
  return useQuery({
    queryKey: queryKeys.entidades.all(params),
    queryFn: async () => {
      const response = await entidadesService.listar(params)
      return response
    },
  })
}

// Listar apenas clientes
export function useClientes(params?: {
  page?: number
  limit?: number
  search?: string
}) {
  return useQuery({
    queryKey: queryKeys.entidades.clientes(params),
    queryFn: async () => {
      const response = await entidadesService.listar({ tipo: 'CLIENTE', ...params })
      return response
    },
  })
}

// Listar apenas fornecedores
export function useFornecedores(params?: {
  page?: number
  limit?: number
  search?: string
}) {
  return useQuery({
    queryKey: queryKeys.entidades.fornecedores(params),
    queryFn: async () => {
      const response = await entidadesService.listar({ tipo: 'FORNECEDOR', ...params })
      return response
    },
  })
}

// Obter detalhes de uma entidade
export function useEntidade(id?: string) {
  return useQuery({
    queryKey: queryKeys.entidades.detail(id!),
    queryFn: async (): Promise<Entidade> => {
      if (!id) throw new Error('ID da entidade é obrigatório')
      const response = await entidadesService.obter(id)
      return response
    },
    enabled: !!id,
  })
}

// Criar nova entidade
export function useCriarEntidade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CriarEntidadeInput) => {
      const response = await entidadesService.criar(input)
      return response
    },
    onSuccess: (_, variables) => {
      // Invalidar listas baseadas no tipo
      queryClient.invalidateQueries({ queryKey: queryKeys.entidades.all() })
      if (variables.tipo === 'CLIENTE' || variables.tipo === 'AMBOS') {
        queryClient.invalidateQueries({ queryKey: queryKeys.entidades.clientes() })
      }
      if (variables.tipo === 'FORNECEDOR' || variables.tipo === 'AMBOS') {
        queryClient.invalidateQueries({ queryKey: queryKeys.entidades.fornecedores() })
      }
    },
  })
}

// Atualizar entidade
export function useAtualizarEntidade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AtualizarEntidadeInput }) => {
      const response = await entidadesService.atualizar(id, data)
      return response
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entidades.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.entidades.all() })
      queryClient.invalidateQueries({ queryKey: queryKeys.entidades.clientes() })
      queryClient.invalidateQueries({ queryKey: queryKeys.entidades.fornecedores() })
    },
  })
}

// Hook completo para gerenciamento de entidades
export function useEntidadeManager(entidadeId?: string) {
  const entidadeQuery = useEntidade(entidadeId)
  const criarMutation = useCriarEntidade()
  const atualizarMutation = useAtualizarEntidade()

  const criar = useCallback((input: CriarEntidadeInput) => {
    return criarMutation.mutateAsync(input)
  }, [criarMutation])

  const atualizar = useCallback((id: string, input: AtualizarEntidadeInput) => {
    return atualizarMutation.mutateAsync({ id, data: input })
  }, [atualizarMutation])

  return {
    entidade: entidadeQuery.data,
    isLoading: entidadeQuery.isLoading,
    isError: entidadeQuery.isError,
    error: entidadeQuery.error,
    criar,
    atualizar,
    isCreating: criarMutation.isPending,
    isUpdating: atualizarMutation.isPending,
  }
}
