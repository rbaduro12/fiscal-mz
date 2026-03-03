import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { useState } from 'react'
import { useQuoteWorkflow, useInitiatePayment } from '@/hooks/use-quote-workflow'
import { useEntidade } from '@/hooks/use-entidades'
import {
  StatusBadge,
  QuoteWorkflow,
  QuoteSummary,
  QuoteActions,
} from '@/components/cotacoes'

export const Route = createFileRoute('/quotes/$quoteId')({
  component: QuoteDetailPage,
})

function QuoteDetailPage() {
  const { quoteId } = Route.useParams()
  const [showPagamentoSuccess, setShowPagamentoSuccess] = useState(false)

  const {
    quote: cotacao,
    isLoading,
    isError,
    error,
    acceptQuote,
    generateProforma,
    isAccepting,
    isGeneratingProforma,
  } = useQuoteWorkflow(quoteId)

  const { data: cliente } = useEntidade(cotacao?.clienteId)
  const iniciarPagamento = useInitiatePayment()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-boho-accent animate-spin" />
          <p className="text-boho-brown">Carregando cotação...</p>
        </div>
      </div>
    )
  }

  if (isError || !cotacao) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-boho-brown mb-4">{(error as Error)?.message || 'Erro ao carregar cotação'}</p>
          <Link
            to="/quotes"
            className="px-4 py-2 bg-boho-accent text-white rounded-lg hover:bg-boho-accent-hover transition-colors"
          >
            Voltar para Cotações
          </Link>
        </div>
      </div>
    )
  }

  const handleAceitar = async () => {
    try {
      await acceptQuote()
      alert('Cotação aceita com sucesso!')
    } catch (error: any) {
      alert(error.message || 'Erro ao aceitar cotação')
    }
  }

  const handleGerarProforma = async () => {
    try {
      await generateProforma()
      alert('Proforma gerada com sucesso!')
    } catch (error: any) {
      alert(error.message || 'Erro ao gerar proforma')
    }
  }

  const handleIniciarPagamento = async (metodo: 'MPESA' | 'CASH' | 'ESCROW') => {
    if (!cotacao.proformaId) {
      alert('Proforma não encontrada')
      return
    }
    try {
      await iniciarPagamento.mutateAsync({
        proformaId: cotacao.proformaId,
        method: metodo,
      })
      setShowPagamentoSuccess(true)
      alert(`Pagamento iniciado via ${metodo}`)
    } catch (error: any) {
      alert(error.message || 'Erro ao iniciar pagamento')
    }
  }

  const handleRejeitar = async (motivo: string) => {
    // TODO: Implementar rejeição
    alert('Cotação rejeitada')
    console.log('Motivo:', motivo)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/quotes"
            className="p-2 hover:bg-boho-sand rounded-lg text-boho-brown transition-colors"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-boho-coffee">{cotacao.numero}</h1>
              <StatusBadge status={cotacao.status} />
            </div>
            <p className="text-boho-brown mt-1">
              Criada em {new Date(cotacao.createdAt).toLocaleDateString('pt-MZ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 border border-boho-beige hover:border-boho-brown text-boho-brown rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Workflow */}
      <FiscalCard className="mb-6">
        <QuoteWorkflow status={cotacao.status} proformaId={cotacao.proformaId} />
      </FiscalCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <QuoteSummary cotacao={cotacao} cliente={cliente} />
        </div>

        {/* Sidebar - Ações */}
        <div className="space-y-6">
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4 text-boho-coffee">Ações</h2>
            <QuoteActions
              cotacao={cotacao}
              onAceitar={handleAceitar}
              onRejeitar={handleRejeitar}
              onGerarProforma={handleGerarProforma}
              onIniciarPagamento={handleIniciarPagamento}
              isLoading={isAccepting || isGeneratingProforma || iniciarPagamento.isPending}
            />
          </FiscalCard>

          {/* Status Info */}
          <div
            className={`p-4 rounded-lg border ${
              cotacao.status === 'ACEITE'
                ? 'bg-green-50 border-green-200'
                : cotacao.status === 'REJEITADA'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <h3 className="font-medium mb-1">
              {cotacao.status === 'ENVIADA' && 'Aguardando resposta do cliente'}
              {cotacao.status === 'ACEITE' && 'Cotação aceita pelo cliente'}
              {cotacao.status === 'REJEITADA' && 'Cotação rejeitada'}
              {cotacao.status === 'CONVERTIDA' && 'Convertida em documento fiscal'}
            </h3>
            <p className="text-sm text-boho-brown">
              {cotacao.status === 'ENVIADA' &&
                'O cliente ainda não respondeu a esta cotação. Você pode enviar um lembrete.'}
              {cotacao.status === 'ACEITE' &&
                'O cliente aceitou os termos. Gere a proforma para continuar com o pagamento.'}
              {cotacao.status === 'REJEITADA' &&
                'O cliente rejeitou esta cotação. Crie uma nova proposta se necessário.'}
              {cotacao.status === 'CONVERTIDA' &&
                'Esta cotação já foi convertida em documento fiscal.'}
            </p>
          </div>

          {/* Histórico */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4 text-boho-coffee">Histórico</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-boho-accent rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium text-boho-coffee">Cotação criada</p>
                  <p className="text-xs text-boho-brown">
                    {new Date(cotacao.createdAt).toLocaleString('pt-MZ')}
                  </p>
                </div>
              </div>
              {cotacao.status !== 'RASCUNHO' && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-boho-sage rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-boho-coffee">Enviada ao cliente</p>
                    <p className="text-xs text-boho-brown">
                      {new Date(cotacao.createdAt).toLocaleString('pt-MZ')}
                    </p>
                  </div>
                </div>
              )}
              {cotacao.dataAceite && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-boho-coffee">Aceita pelo cliente</p>
                    <p className="text-xs text-boho-brown">
                      {new Date(cotacao.dataAceite).toLocaleString('pt-MZ')}
                    </p>
                  </div>
                </div>
              )}
              {cotacao.proformaId && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-boho-coffee">Proforma gerada</p>
                    <p className="text-xs text-boho-brown">
                      ID: {cotacao.proformaId.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </FiscalCard>
        </div>
      </div>

      {/* Modal de Sucesso de Pagamento */}
      {showPagamentoSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-boho-coffee mb-2">Pagamento Iniciado!</h3>
            <p className="text-boho-brown mb-6">
              O pagamento foi iniciado com sucesso. O cliente receberá as instruções para
              completar o pagamento.
            </p>
            <button
              onClick={() => setShowPagamentoSuccess(false)}
              className="w-full py-3 px-4 bg-boho-accent hover:bg-boho-accent-hover text-white rounded-lg font-medium transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
