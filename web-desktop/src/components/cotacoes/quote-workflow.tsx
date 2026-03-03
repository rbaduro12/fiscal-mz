import { CheckCircle, FileText, Send, CreditCard, Receipt, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuoteWorkflowProps {
  status: string
  proformaId?: string | null
  className?: string
}

const steps = [
  { id: 'RASCUNHO', label: 'Rascunho', icon: FileText },
  { id: 'ENVIADA', label: 'Enviada', icon: Send },
  { id: 'ACEITE', label: 'Aceite', icon: CheckCircle },
  { id: 'PROFORMA', label: 'Proforma', icon: FileText },
  { id: 'PAGO', label: 'Pago', icon: CreditCard },
  { id: 'FACTURA', label: 'Fatura', icon: Receipt },
]

export function QuoteWorkflow({ status, proformaId, className }: QuoteWorkflowProps) {
  // Determinar o step atual baseado no status
  const getCurrentStep = () => {
    switch (status) {
      case 'RASCUNHO':
        return 0
      case 'ENVIADA':
        return 1
      case 'ACEITE':
        return 2
      case 'CONVERTIDA':
        return proformaId ? 5 : 3
      default:
        return 0
    }
  }

  const currentStep = getCurrentStep()

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index <= currentStep
          const isCurrent = index === currentStep

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    isCompleted
                      ? 'bg-boho-accent text-white'
                      : 'bg-gray-100 text-gray-400',
                    isCurrent && 'ring-4 ring-boho-accent/20'
                  )}
                >
                  <Icon size={20} />
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isCompleted ? 'text-boho-coffee' : 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight
                  size={16}
                  className={cn(
                    'mx-2 mb-6',
                    index < currentStep ? 'text-boho-accent' : 'text-gray-300'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
