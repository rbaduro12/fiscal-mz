import { cn } from '@/lib/utils'

type StatusType = 
  // Quote statuses
  | 'RASCUNHO' | 'PENDENTE' | 'EM_NEGOCIACAO' | 'ACEITE' | 'REJEITADA' | 'EXPIRADA' | 'FATURADA'
  // Payment statuses
  | 'PAGO' | 'EM_PROCESSAMENTO' | 'FALHADO' | 'REEMBOLSADO'
  // Fiscal document statuses
  | 'VALIDA' | 'INVALIDA' | 'NAO_VALIDADA'
  // Generic
  | 'ATIVO' | 'INATIVO' | 'SUCESSO' | 'ERRO' | 'AVISO' | 'INFO'

interface FiscalBadgeProps {
  status: StatusType
  className?: string
}

const statusConfig: Record<StatusType, { label: string; classes: string }> = {
  // Quote statuses
  RASCUNHO: { label: 'Rascunho', classes: 'bg-boho-stone/20 text-boho-brown border-boho-stone/30' },
  PENDENTE: { label: 'Pendente', classes: 'bg-boho-mustard/10 text-boho-mustard border-boho-mustard/20' },
  EM_NEGOCIACAO: { label: 'Em Negociação', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  ACEITE: { label: 'Aceite', classes: 'bg-boho-sage/10 text-boho-sage border-boho-sage/20' },
  REJEITADA: { label: 'Rejeitada', classes: 'bg-red-50 text-red-600 border-red-200' },
  EXPIRADA: { label: 'Expirada', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  FATURADA: { label: 'Faturada', classes: 'bg-purple-50 text-purple-600 border-purple-200' },
  
  // Payment statuses
  PAGO: { label: 'Pago', classes: 'bg-boho-sage/10 text-boho-sage border-boho-sage/20' },
  EM_PROCESSAMENTO: { label: 'Em Processamento', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  FALHADO: { label: 'Falhado', classes: 'bg-red-50 text-red-600 border-red-200' },
  REEMBOLSADO: { label: 'Reembolsado', classes: 'bg-orange-50 text-orange-600 border-orange-200' },
  
  // Fiscal document statuses
  VALIDA: { label: 'Válida', classes: 'bg-boho-sage/10 text-boho-sage border-boho-sage/20' },
  INVALIDA: { label: 'Inválida', classes: 'bg-red-50 text-red-600 border-red-200' },
  NAO_VALIDADA: { label: 'Não Validada', classes: 'bg-boho-mustard/10 text-boho-mustard border-boho-mustard/20' },
  
  // Generic
  ATIVO: { label: 'Ativo', classes: 'bg-boho-sage/10 text-boho-sage border-boho-sage/20' },
  INATIVO: { label: 'Inativo', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  SUCESSO: { label: 'Sucesso', classes: 'bg-boho-sage/10 text-boho-sage border-boho-sage/20' },
  ERRO: { label: 'Erro', classes: 'bg-red-50 text-red-600 border-red-200' },
  AVISO: { label: 'Aviso', classes: 'bg-boho-mustard/10 text-boho-mustard border-boho-mustard/20' },
  INFO: { label: 'Info', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
}

export function FiscalBadge({ status, className }: FiscalBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDENTE

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  )
}
