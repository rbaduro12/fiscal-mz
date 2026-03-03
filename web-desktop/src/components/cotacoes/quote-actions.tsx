import { CheckCircle, XCircle, FileText, CreditCard, Loader2, Send, Printer, Download } from 'lucide-react'
import { useState } from 'react'
import type { Cotacao } from '@/services/cotacoes.service'

interface QuoteActionsProps {
  cotacao: Cotacao
  onAceitar: () => Promise<void>
  onRejeitar: (motivo: string) => Promise<void>
  onGerarProforma: () => Promise<void>
  onIniciarPagamento: (metodo: 'MPESA' | 'CASH' | 'ESCROW') => Promise<void>
  isLoading?: boolean
}

export function QuoteActions({
  cotacao,
  onAceitar,
  onRejeitar,
  onGerarProforma,
  onIniciarPagamento,
  isLoading,
}: QuoteActionsProps) {
  const [showRejeitarModal, setShowRejeitarModal] = useState(false)
  const [motivoRejeicao, setMotivoRejeicao] = useState('')
  const [showPagamentoModal, setShowPagamentoModal] = useState(false)

  const podeAceitar = cotacao.status === 'ENVIADA'
  const podeGerarProforma = cotacao.status === 'ACEITE' && !cotacao.proformaId
  const podePagar = cotacao.status === 'CONVERTIDA' && cotacao.proformaId

  const handleRejeitar = async () => {
    await onRejeitar(motivoRejeicao)
    setShowRejeitarModal(false)
    setMotivoRejeicao('')
  }

  return (
    <div className="space-y-3">
      {/* Ações principais baseadas no status */}
      {podeAceitar && (
        <>
          <button
            onClick={onAceitar}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-boho-sage hover:bg-boho-sage/90 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <CheckCircle size={20} />
            )}
            Aceitar Cotação
          </button>

          <button
            onClick={() => setShowRejeitarModal(true)}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <XCircle size={20} />
            Rejeitar
          </button>

          <button
            disabled={isLoading}
            className="w-full py-3 px-4 border border-boho-beige hover:border-boho-accent text-boho-brown rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Send size={20} />
            Reenviar por Email
          </button>
        </>
      )}

      {podeGerarProforma && (
        <button
          onClick={onGerarProforma}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-boho-accent hover:bg-boho-accent-hover disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <FileText size={20} />
          )}
          Gerar Proforma
        </button>
      )}

      {podePagar && (
        <button
          onClick={() => setShowPagamentoModal(true)}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-boho-accent hover:bg-boho-accent-hover disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <CreditCard size={20} />
          Efetuar Pagamento
        </button>
      )}

      {/* Ações secundárias */}
      <div className="pt-3 border-t border-boho-beige space-y-2">
        <button
          className="w-full py-2 px-4 border border-boho-beige hover:border-boho-brown text-boho-brown rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Printer size={16} />
          Imprimir
        </button>
        <button
          className="w-full py-2 px-4 border border-boho-beige hover:border-boho-brown text-boho-brown rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>

      {/* Modal de Rejeição */}
      {showRejeitarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-boho-coffee mb-4">Rejeitar Cotação</h3>
            <p className="text-boho-brown mb-4">
              Informe o motivo da rejeição (opcional):
            </p>
            <textarea
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              placeholder="Motivo da rejeição..."
              rows={3}
              className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-accent/50 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejeitarModal(false)}
                className="flex-1 py-2 px-4 border border-boho-beige hover:border-boho-brown text-boho-brown rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejeitar}
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {isLoading ? 'Processando...' : 'Confirmar Rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPagamentoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-boho-coffee mb-4">Selecione o Método de Pagamento</h3>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  onIniciarPagamento('MPESA')
                  setShowPagamentoModal(false)
                }}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-boho-accent hover:bg-boho-accent-hover disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                M-Pesa
              </button>
              <button
                onClick={() => {
                  onIniciarPagamento('CASH')
                  setShowPagamentoModal(false)
                }}
                disabled={isLoading}
                className="w-full py-3 px-4 border border-boho-beige hover:border-boho-accent text-boho-brown rounded-lg font-medium transition-colors"
              >
                Dinheiro (Cash)
              </button>
              <button
                onClick={() => {
                  onIniciarPagamento('ESCROW')
                  setShowPagamentoModal(false)
                }}
                disabled={isLoading}
                className="w-full py-3 px-4 border border-boho-beige hover:border-boho-accent text-boho-brown rounded-lg font-medium transition-colors"
              >
                Garantia (Escrow)
              </button>
            </div>
            <button
              onClick={() => setShowPagamentoModal(false)}
              className="w-full py-2 px-4 border border-boho-beige hover:border-boho-brown text-boho-brown rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
