import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface FiscalCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function FiscalCard({ children, className, hover = false }: FiscalCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-boho-beige rounded-2xl p-6 shadow-boho',
        hover && 'hover:shadow-boho-lg transition-shadow cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

interface FiscalCardHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function FiscalCardHeader({ title, subtitle, action }: FiscalCardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-display font-semibold text-boho-coffee">{title}</h3>
        {subtitle && <p className="text-sm text-boho-brown mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface FiscalCardFooterProps {
  children: ReactNode
}

export function FiscalCardFooter({ children }: FiscalCardFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-boho-beige">
      {children}
    </div>
  )
}
