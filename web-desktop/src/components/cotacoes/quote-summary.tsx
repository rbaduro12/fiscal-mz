import { FileText, Calendar, User, Mail, Phone } from 'lucide-react'
import { StatusBadge } from './status-badge'
import type { Cotacao } from '@/services/cotacoes.service'
import type { Entidade } from '@/types'

interface QuoteSummaryProps {
  cotacao: Cotacao
  cliente?: Entidade | null
}

export function QuoteSummary({ cotacao, cliente }: QuoteSummaryProps) {
  const isExpirada = cotacao.dataExpiracao && new Date(cotacao.dataExpiracao) < new Date()

  return (
    <div className="bg-white rounded-xl border border-boho-beige overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-boho-cream border-b border-boho-beige">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-boho-accent" size={24} />
            <div>
              <h2 className="text-lg font-semibold text-boho-coffee">{cotacao.numero}</h2>
              <p className="text-sm text-boho-brown">
                Criada em {new Date(cotacao.createdAt).toLocaleDateString('pt-MZ')}
              </p>
            </div>
          </div>
          <StatusBadge status={cotacao.status} />
        </div>
      </div>

      {/* Cliente */}
      {cliente && (
        <div className="px-6 py-4 border-b border-boho-beige">
          <h3 className="text-sm font-medium text-boho-taupe mb-3">Cliente</h3>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-boho-accent/10 rounded-full flex items-center justify-center">
              <User size={20} className="text-boho-accent" />
            </div>
            <div>
              <p className="font-medium text-boho-coffee">{cliente.nome}</p>
              <p className="text-sm text-boho-brown">NUIT: {cliente.nuit}</p>
              {cliente.email && (
                <p className="text-sm text-boho-taupe flex items-center gap-1 mt-1">
                  <Mail size={12} />
                  {cliente.email}
                </p>
              )}
              {cliente.telefone && (
                <p className="text-sm text-boho-taupe flex items-center gap-1">
                  <Phone size={12} />
                  {cliente.telefone}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validade */}
      <div className="px-6 py-4 border-b border-boho-beige">
        <div className="flex items-center gap-2 text-boho-brown">
          <Calendar size={16} />
          <span className="text-sm">
            Validade:{' '}
            <span className={isExpirada ? 'text-red-500 font-medium' : 'text-boho-coffee'}>
              {cotacao.dataExpiracao
                ? new Date(cotacao.dataExpiracao).toLocaleDateString('pt-MZ')
                : 'N/A'}
            </span>
            {isExpirada && (
              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                Expirada
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Itens */}
      <div className="px-6 py-4">
        <h3 className="text-sm font-medium text-boho-taupe mb-3">Itens</h3>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-boho-taupe border-b border-boho-beige">
              <th className="pb-2">Descrição</th>
              <th className="pb-2 text-center">Qtd</th>
              <th className="pb-2 text-right">Preço</th>
              <th className="pb-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {cotacao.itens?.map((item, idx) => (
              <tr key={idx} className="border-b border-boho-beige/50 last:border-0">
                <td className="py-2 text-boho-coffee">{item.descricao}</td>
                <td className="py-2 text-center text-boho-brown">{item.quantidade}</td>
                <td className="py-2 text-right text-boho-brown">
                  MZN {Number(item.precoUnitario).toLocaleString('pt-MZ')}
                </td>
                <td className="py-2 text-right font-mono text-boho-coffee">
                  MZN {Number(item.totalLinha).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totais */}
      <div className="px-6 py-4 bg-boho-cream border-t border-boho-beige">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-boho-brown">Subtotal</span>
            <span className="font-mono text-boho-coffee">
              MZN {Number(cotacao.subtotal).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-boho-brown">IVA</span>
            <span className="font-mono text-boho-coffee">
              MZN {Number(cotacao.totalIva).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-boho-beige">
            <span className="font-medium text-boho-coffee">Total</span>
            <span className="font-mono text-xl font-bold text-boho-accent">
              MZN {Number(cotacao.total).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Observações */}
      {cotacao.observacoes && (
        <div className="px-6 py-4 border-t border-boho-beige">
          <h3 className="text-sm font-medium text-boho-taupe mb-2">Observações</h3>
          <p className="text-sm text-boho-brown">{cotacao.observacoes}</p>
        </div>
      )}
    </div>
  )
}
