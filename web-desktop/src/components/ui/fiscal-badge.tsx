import { cn } from '@/lib/utils'

type StatusType = 
  // Estados de Documentos
  | 'RASCUNHO' | 'EMITIDA' | 'ACEITE' | 'REJEITADA' | 'PAGA' | 'PROCESSADA' | 'ANULADA'
  // Estados de Cotação (legado/compatibility)
  | 'PENDENTE' | 'EM_NEGOCIACAO' | 'EXPIRADA' | 'FATURADA' | 'CONVERTIDA' | 'VENCIDA'
  // Estados de Pagamento
  | 'PAGO' | 'EM_PROCESSAMENTO' | 'FALHADO' | 'REEMBOLSADO' | 'PROCESSANDO' | 'CONCLUIDO'
  // Estados de Declaração IVA
  | 'VALIDA' | 'INVALIDA' | 'NAO_VALIDADA' | 'SUBMETIDA' | 'VALIDADA'
  // Estados Genéricos
  | 'ATIVO' | 'INATIVO' | 'SUCESSO' | 'ERRO' | 'AVISO' | 'INFO'

interface FiscalBadgeProps {
  status: StatusType | string
  className?: string
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  // Estados de Documentos (novos)
  RASCUNHO: { label: 'Rascunho', classes: 'bg-boho-stone/20 text-boho-brown border-boho-stone/30' },
  EMITIDA: { label: 'Emitida', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  ACEITE: { label: 'Aceite', classes: 'bg-boho-sage/10 text-boho-sage border-boho-sage/20' },
  REJEITADA: { label: 'Rejeitada', classes: 'bg-red-50 text-red-600 border-red-200' },
  PAGA: { label: 'Paga', classes: 'bg-boho-sage/10 text-boho-sage border-boho-sage/20' },
  PROCESSADA: { label: 'Processada', classes: 'bg-purple-50 text-purple-600 border-purple-200' },
  ANULADA: { label: 'Anulada', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  
  // Estados de Cotação (legado)
  PENDENTE: { label: 'Pendente', classes: 'bg-boho-mustard/10 text-boho-mustard border-boho-mustard/20' },
  EM_NEGOCIACAO: { label: 'Em Negociação', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  EXPIRADA: { label: 'Expirada', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  FATURADA: { label: 'Faturada', classes: 'bg-purple-50 text-purple-600 border-purple-200' },
  CONVERTIDA: { label: 'Convertida', classes: 'bg-purple-50 text-purple-600 border-purple-200' },
  VENCIDA: { label: 'Vencida', classes: 'bg-red-50 text-red-600 border-red-200' },
  
  // Estados de Pagamento
  PAGO: { label: 'Pago', classes: 'bg-boho-sage/10 text-boho-sage border-boho-sage/20' },
  EM_PROCESSAMENTO: { label: 'Em Processamento', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  PROCESSANDO: { label: 'Processando', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  FALHADO: { label: 'Falhado', classes: 'bg-red-50 text-red-600 border-red-200' },
  REEMBOLSADO: { label: 'Reembolsado', classes: 'bg-orange-50 text-orange-600 border-orange-200' },
  CONCLUIDO: { label: 'Concluído', classes: 'bg-boho-sage/10 text-boho-sage border-boho-sage/20' },
  
  // Estados de Declaração IVA
  VALIDA: { label: 'Válida', classes: 'bg-boho-sage/10 text-boho-sage border-boho-sage/20' },
  INVALIDA: { label: 'Inválida', classes: 'bg-red-50 text-red-600 border-red-200' },
  NAO_VALIDADA: { label: 'Não Validada', classes: 'bg-boho-mustard/10 text-boho-mustard border-boho-mustard/20' },
  SUBMETIDA: { label: 'Submetida', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  VALIDADA: { label: 'Validada', classes: 'bg-boho-sage/10 text-boho-sage border-boho-sage/20' },
  REJEITADA: { label: 'Rejeitada', classes: 'bg-red-50 text-red-600 border-red-200' },
  
  // Estados Genéricos
  ATIVO: { label: 'Ativo', classes: 'bg-boho-sage/10 text-boho-sage border-boho-sage/20' },
  INATIVO: { label: 'Inativo', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  SUCESSO: { label: 'Sucesso', classes: 'bg-boho-sage/10 text-boho-sage border-boho-sage/20' },
  ERRO: { label: 'Erro', classes: 'bg-red-50 text-red-600 border-red-200' },
  AVISO: { label: 'Aviso', classes: 'bg-boho-mustard/10 text-boho-mustard border-boho-mustard/20' },
  INFO: { label: 'Info', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
}

export function FiscalBadge({ status, className }: FiscalBadgeProps) {
  const config = statusConfig[status] || { 
    label: status, 
    classes: 'bg-gray-100 text-gray-600 border-gray-200' 
  }

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
