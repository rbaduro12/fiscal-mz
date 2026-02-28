import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { fiscalService, downloadBlob } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'

// ============================================
// TIPOS
// ============================================

export interface QuadroIVA {
  vendasBens: number
  vendasServicos: number
  compras: number
  iva: number
}

export interface DeclaracaoIVA {
  id: string
  empresaId: string
  periodoAno: number
  periodoMes: number
  // Quadro 01: Vendas 16%
  q1VendasBens16: number
  q1VendasServicos16: number
  q1TotalIva16: number
  // Quadro 02: Vendas 10%
  q2VendasBens10: number
  q2VendasServicos10: number
  q2TotalIva10: number
  // Quadro 03: Vendas 5%
  q3VendasBens5: number
  q3VendasServicos5: number
  q3TotalIva5: number
  // Quadro 05: Compras
  q5ComprasBens16: number
  q5ComprasServicos16: number
  q5Iva16: number
  q5ComprasBens5: number
  q5ComprasServicos5: number
  q5Iva5: number
  q5ImportacoesBens: number
  q5ImportacoesServicos: number
  q5ImportacoesIva: number
  // Quadro 06: Apuramento
  q6IvaLiquidado: number
  q6IvaDedutivel: number
  q6Diferenca: number
  q6CreditoAnterior: number
  q6CreditoTransportar: number
  q6IvaAPagar: number
  // Estado
  estado: 'RASCUNHO' | 'SUBMETIDA' | 'VALIDADA' | 'PAGA' | 'REJEITADA'
  dataSubmissao?: string
  codigoValidacao?: string
  createdAt: string
  updatedAt: string
}

export interface ResumoApuramentoIVA {
  ivaLiquidado: number
  ivaDedutivel: number
  diferenca: number
  ivaAPagar: number
  creditoTransportar: number
}

// ============================================
// HOOKS
// ============================================

// Listar declarações de IVA
export function useDeclaracoesIVA(params?: {
  ano?: number
  mes?: number
  estado?: string
}) {
  return useQuery({
    queryKey: queryKeys.fiscal.declaracoes(params),
    queryFn: async () => {
      const response = await fiscalService.listarDeclaracoes(params)
      return response.data
    },
  })
}

// Obter detalhes de uma declaração
export function useDeclaracaoIVA(id?: string) {
  return useQuery({
    queryKey: queryKeys.fiscal.declaracao(id!),
    queryFn: async (): Promise<DeclaracaoIVA> => {
      if (!id) throw new Error('ID da declaração é obrigatório')
      const response = await fiscalService.obterDeclaracao(id)
      return response.data
    },
    enabled: !!id,
  })
}

// Gerar Modelo A para um período
export function useGerarModeloA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ ano, mes }: { ano: number; mes: number }) => {
      const response = await fiscalService.gerarModeloA(ano, mes)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fiscal.declaracoes() })
      queryClient.invalidateQueries({ queryKey: queryKeys.fiscal.modeloA(variables.ano, variables.mes) })
    },
  })
}

// Submeter declaração
export function useSubmeterDeclaracao() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fiscalService.submeter(id)
      return response.data
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fiscal.declaracao(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.fiscal.declaracoes() })
    },
  })
}

// Exportar XML
export function useExportarXML() {
  return useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename?: string }) => {
      const blob = await fiscalService.exportarXML(id)
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || `modelo-a-${id}.xml`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    },
  })
}

// Exportar PDF
export function useExportarPDF() {
  return useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename?: string }) => {
      const blob = await fiscalService.exportarPDF(id)
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || `modelo-a-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    },
  })
}

// Hook completo para gerenciamento fiscal
export function useFiscalManager(declaracaoId?: string) {
  const queryClient = useQueryClient()
  
  const declaracaoQuery = useDeclaracaoIVA(declaracaoId)
  const gerarMutation = useGerarModeloA()
  const submeterMutation = useSubmeterDeclaracao()
  const exportarXMLMutation = useExportarXML()
  const exportarPDFMutation = useExportarPDF()

  const gerar = useCallback((ano: number, mes: number) => {
    return gerarMutation.mutateAsync({ ano, mes })
  }, [gerarMutation])

  const submeter = useCallback((id: string) => {
    return submeterMutation.mutateAsync(id)
  }, [submeterMutation])

  const exportarXML = useCallback((id: string, filename?: string) => {
    return exportarXMLMutation.mutateAsync({ id, filename })
  }, [exportarXMLMutation])

  const exportarPDF = useCallback((id: string, filename?: string) => {
    return exportarPDFMutation.mutateAsync({ id, filename })
  }, [exportarPDFMutation])

  return {
    declaracao: declaracaoQuery.data,
    isLoading: declaracaoQuery.isLoading,
    isError: declaracaoQuery.isError,
    error: declaracaoQuery.error,
    gerar,
    submeter,
    exportarXML,
    exportarPDF,
    isGenerating: gerarMutation.isPending,
    isSubmitting: submeterMutation.isPending,
    isExportingXML: exportarXMLMutation.isPending,
    isExportingPDF: exportarPDFMutation.isPending,
  }
}

// Hook para cálculos de IVA em tempo real
export function useCalculoIVA() {
  const calcularIVA = useCallback((valor: number, taxa: 16 | 10 | 5 | 0 = 16) => {
    if (taxa === 0) return { valor, iva: 0, total: valor }
    const iva = valor * (taxa / 100)
    return {
      valor,
      iva: Math.round(iva * 100) / 100,
      total: Math.round((valor + iva) * 100) / 100,
    }
  }, [])

  const calcularTotalComIVA = useCallback((itens: Array<{ valor: number; taxa: 16 | 10 | 5 | 0 }>) => {
    return itens.reduce((acc, item) => {
      const { iva, total } = calcularIVA(item.valor, item.taxa)
      return {
        subtotal: acc.subtotal + item.valor,
        totalIva: acc.totalIva + iva,
        totalPagar: acc.totalPagar + total,
      }
    }, { subtotal: 0, totalIva: 0, totalPagar: 0 })
  }, [calcularIVA])

  return { calcularIVA, calcularTotalComIVA }
}
