import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'RASCUNHO' | 'ENVIADA' | 'ACEITE' | 'REJEITADA' | 'CONVERTIDA' | 'EXPIRADA' | string
  className?: string
}

const statusConfig = {
  RASCUNHO: {
    label: 'Rascunho',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  },
  ENVIADA: {
    label: 'Enviada',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  ACEITE: {
    label: 'Aceite',
    className: 'bg-green-50 text-green-700 border-green-200',
    dot: 'bg-green-500',
  },
  REJEITADA: {
    label: 'Rejeitada',
    className: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  CONVERTIDA: {
    label: 'Convertida',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  EXPIRADA: {
    label: 'Expirada',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}
