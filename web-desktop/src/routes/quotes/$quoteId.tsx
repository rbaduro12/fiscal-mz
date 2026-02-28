import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Download, Printer, CheckCircle, XCircle, Send, Loader2, Building2, Calendar, FileText, Hash, CreditCard } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { FiscalBadge } from '@/components/ui/fiscal-badge'
import { useDocumento, useCotacaoWorkflow } from '@/hooks/use-documentos'
import { useState } from 'react'

export const Route = createFileRoute('/quotes/$quoteId')({
  component: QuoteDetailPage,
})

function QuoteDetailPage() {
  const { quoteId } = Route.useParams()
  const navigate = useNavigate()
  const [showRejeitarModal, setShowRejeitarModal] = useState(false)
  const [motivoRejeicao, setMotivoRejeicao] = useState('')
  
  const { data: documento, isLoading, isError } = useDocumento(quoteId)
  const { 
    aceitarCotacao, 
    rejeitarCotacao, 
    isAccepting, 
    isRejecting 
  } = useCotacaoWorkflow(quoteId)
  
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
  
  if (isError || !documento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-boho-brown mb-4">Erro ao carregar cotação</p>
          <Link to="/quotes" className="text-boho-accent hover:underline">
            Voltar para cotações
          </Link>
        </div>
      </div>
    )
  }
  
  const cotacao = documento
  
  const handleAceitar = async () => {
    try {
      await aceitarCotacao()
      alert('Cotação aceita com sucesso!')
    } catch (error: any) {
      alert('Erro ao aceitar cotação: ' + error.message)
    }
  }
  
  const handleRejeitar = async () => {
    try {
      await rejeitarCotacao(motivoRejeicao)
      setShowRejeitarModal(false)
      alert('Cotação rejeitada.')
    } catch (error: any) {
      alert('Erro ao rejeitar cotação: ' + error.message)
    }
  }
  
  const canAccept = cotacao.estado === 'EMITIDA'
  const canReject = cotacao.estado === 'EMITIDA'
  const isProcessed = cotacao.estado === 'PROCESSADA' || cotacao.estado === 'ACEITE'

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/quotes" className="p-2 hover:bg-boho-sand rounded-lg text-boho-brown transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-boho-coffee">{cotacao.numeroCompleto}</h1>
              <FiscalBadge status={cotacao.estado} />
            </div>
            <p className="text-boho-brown mt-1">
              Criada em {new Date(cotacao.dataEmissao).toLocaleDateString('pt-MZ')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-boho-beige hover:border-boho-brown text-boho-brown rounded-lg transition-colors">
            <Printer size={18} />
            Imprimir
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-boho-beige hover:border-boho-brown text-boho-brown rounded-lg transition-colors">
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <FiscalCard>
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="text-boho-accent" size={20} />
                <h3 className="font-medium text-boho-coffee">Cliente</h3>
              </div>
              <p className="text-lg font-medium text-boho-coffee">{cotacao.entidade?.nome || 'N/A'}</p>
              <p className="text-sm text-boho-brown">NUIT: {cotacao.entidade?.nuit || 'N/A'}</p>
            </FiscalCard>
            
            <FiscalCard>
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="text-boho-accent" size={20} />
                <h3 className="font-medium text-boho-coffee">Validade</h3>
              </div>
              <p className="text-lg font-medium text-boho-coffee">
                {cotacao.dataValidade 
                  ? new Date(cotacao.dataValidade).toLocaleDateString('pt-MZ')
                  : 'N/A'
                }
              </p>
              <p className="text-sm text-boho-brown">
                {cotacao.dataValidade && new Date(cotacao.dataValidade) < new Date() 
                  ? 'Expirada'
                  : 'Válida'
                }
              </p>
            </FiscalCard>
          </div>
          
          {/* Items Table */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4 text-boho-coffee">Itens</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-boho-beige">
                    <th className="text-left py-3 px-4 text-sm font-medium text-boho-brown">Descrição</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-boho-brown">Qtd</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-boho-brown">Preço Unit.</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-boho-brown">IVA</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-boho-brown">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cotacao.linhas?.map((linha: any, index: number) => (
                    <tr key={index} className="border-b border-boho-beige/50">
                      <td className="py-4 px-4 text-boho-coffee">{linha.descricao}</td>
                      <td className="py-4 px-4 text-center text-boho-brown">{linha.quantidade}</td>
                      <td className="py-4 px-4 text-right font-mono text-boho-coffee">
                        MZN {linha.precoUnitario?.toLocaleString('pt-MZ')}
                      </td>
                      <td className="py-4 px-4 text-right text-boho-brown">
                        {linha.ivaPercent}%
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-boho-coffee">
                        MZN {linha.totalLinha?.toLocaleString('pt-MZ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FiscalCard>
          
          {/* Documentos Relacionados */}
          {cotacao.documentoOrigemId && (
            <FiscalCard>
              <h2 className="text-lg font-semibold mb-4 text-boho-coffee">Documentos Relacionados</h2>
              <div className="flex items-center gap-3 p-3 bg-boho-sand/30 rounded-lg">
                <FileText className="text-boho-accent" size={20} />
                <div>
                  <p className="text-sm text-boho-brown">Documento de origem</p>
                  <Link 
                    to={`/quotes/${cotacao.documentoOrigemId}`}
                    className="text-boho-accent hover:underline font-medium"
                  >
                    Ver documento original
                  </Link>
                </div>
              </div>
            </FiscalCard>
          )}
          
          {/* Informações Fiscais */}
          {cotacao.hashFiscal && (
            <FiscalCard>
              <h2 className="text-lg font-semibold mb-4 text-boho-coffee">Informações Fiscais</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Hash className="text-boho-taupe" size={18} />
                  <div>
                    <p className="text-sm text-boho-brown">Hash Fiscal</p>
                    <code className="text-xs bg-boho-sand px-2 py-1 rounded text-boho-coffee">
                      {cotacao.hashFiscal}
                    </code>
                  </div>
                </div>
                {cotacao.qrCodeData && (
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-32 bg-white p-2 rounded border border-boho-beige">
                      {/* QR Code placeholder - em produção seria um componente real */}
                      <div className="w-full h-full bg-boho-coffee/10 flex items-center justify-center text-xs text-boho-taupe">
                        QR Code
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-boho-brown">QR Code Fiscal</p>
                      <p className="text-xs text-boho-taupe">Portaria 97/2021</p>
                    </div>
                  </div>
                )}
              </div>
            </FiscalCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resumo */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4 text-boho-coffee">Resumo</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-boho-beige">
                <span className="text-boho-brown">Subtotal</span>
                <span className="font-mono text-boho-coffee">
                  MZN {cotacao.subtotal?.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-boho-beige">
                <span className="text-boho-brown">Descontos</span>
                <span className="font-mono text-boho-coffee">
                  MZN {cotacao.totalDescontos?.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-boho-beige">
                <span className="text-boho-brown">IVA</span>
                <span className="font-mono text-boho-coffee">
                  MZN {cotacao.totalIva?.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-boho-coffee font-medium">Total</span>
                <span className="font-mono text-2xl font-bold text-boho-accent">
                  MZN {cotacao.totalPagar?.toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </FiscalCard>
          
          {/* Ações */}
          {canAccept && (
            <FiscalCard>
              <h2 className="text-lg font-semibold mb-4 text-boho-coffee">Ações</h2>
              <div className="space-y-3">
                <button
                  onClick={handleAceitar}
                  disabled={isAccepting}
                  className="w-full py-3 px-4 bg-boho-sage hover:bg-boho-sage/90 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isAccepting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <CheckCircle size={20} />
                  )}
                  Aceitar Cotação
                </button>
                
                <button
                  onClick={() => setShowRejeitarModal(true)}
                  disabled={isRejecting}
                  className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isRejecting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <XCircle size={20} />
                  )}
                  Rejeitar
                </button>
                
                <button
                  className="w-full py-3 px-4 border border-boho-beige hover:border-boho-accent text-boho-brown rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Reenviar por Email
                </button>
              </div>
            </FiscalCard>
          )}
          
          {/* Status Processado */}
          {isProcessed && (
            <FiscalCard className="bg-boho-sage/10">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="text-boho-sage" size={24} />
                <h2 className="text-lg font-semibold text-boho-coffee">Processada</h2>
              </div>
              <p className="text-boho-brown text-sm">
                Esta cotação já foi processada e convertida em documento fiscal.
              </p>
              {cotacao.documentoOrigemId && (
                <Link
                  to={`/invoices/${cotacao.documentoOrigemId}`}
                  className="mt-3 inline-flex items-center gap-2 text-boho-accent hover:underline"
                >
                  <CreditCard size={16} />
                  Ver fatura
                </Link>
              )}
            </FiscalCard>
          )}
          
          {/* Timeline */}
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
              {cotacao.estado !== 'RASCUNHO' && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-boho-sage rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-boho-coffee">Emitida</p>
                    <p className="text-xs text-boho-brown">
                      {new Date(cotacao.dataEmissao).toLocaleString('pt-MZ')}
                    </p>
                  </div>
                </div>
              )}
              {isProcessed && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-boho-coffee rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-boho-coffee">Processada</p>
                    <p className="text-xs text-boho-brown">Convertida em fatura</p>
                  </div>
                </div>
              )}
            </div>
          </FiscalCard>
        </div>
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
                disabled={isRejecting}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {isRejecting ? 'Processando...' : 'Confirmar Rejeição'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
