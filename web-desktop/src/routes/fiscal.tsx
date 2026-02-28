import { createFileRoute } from '@tanstack/react-router'
import { FileText, AlertTriangle, CheckCircle, Clock, Download, RefreshCw } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { FiscalBadge } from '@/components/ui/fiscal-badge'
import { useState } from 'react'

export const Route = createFileRoute('/fiscal')({
  component: FiscalPage,
})

const documents = [
  { id: 'FT-2024-0032', type: 'FATURA', client: 'ABC Lda.', amount: 8900, status: 'VALIDA', date: '2024-01-15', hash: 'A1B2C3D4' },
  { id: 'FT-2024-0031', type: 'FATURA', client: 'XYZ Comercial', amount: 12400, status: 'VALIDA', date: '2024-01-14', hash: 'E5F6G7H8' },
  { id: 'FR-2024-0010', type: 'FACTURA_RECIBO', client: 'Mega Store', amount: 23400, status: 'PENDENTE', date: '2024-01-13', hash: 'I9J0K1L2' },
  { id: 'FT-2024-0030', type: 'FATURA', client: 'Global Services', amount: 5600, status: 'INVALIDA', date: '2024-01-12', hash: 'M3N4O5P6' },
  { id: 'ND-2024-0005', type: 'NOTA_DEBITO', client: 'Tech Solutions', amount: -1500, status: 'VALIDA', date: '2024-01-10', hash: 'Q7R8S9T0' },
]

function FiscalPage() {
  const [validating, setValidating] = useState<string | null>(null)

  const handleValidate = async (docId: string) => {
    setValidating(docId)
    await new Promise(r => setTimeout(r, 2000))
    setValidating(null)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-primary">Validação Fiscal</h1>
        <p className="text-fm-muted mt-1">Valide e gerencie documentos fiscais (Saft-AO)</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <FiscalCard className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-fm-primary">42</p>
              <p className="text-sm text-fm-muted">Documentos Válidos</p>
            </div>
          </div>
        </FiscalCard>

        <FiscalCard className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-fm-primary">8</p>
              <p className="text-sm text-fm-muted">Pendentes</p>
            </div>
          </div>
        </FiscalCard>

        <FiscalCard className="bg-gradient-to-br from-red-500/10 to-red-600/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-fm-primary">2</p>
              <p className="text-sm text-fm-muted">Inválidos</p>
            </div>
          </div>
        </FiscalCard>

        <FiscalCard className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-fm-primary">52</p>
              <p className="text-sm text-fm-muted">Total</p>
            </div>
          </div>
        </FiscalCard>
      </div>

      {/* Documents Table */}
      <FiscalCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Documentos Recentes</h2>
          <button className="flex items-center gap-2 px-4 py-2 border border-fm-default hover:border-[#5E6AD2] text-fm-muted rounded-lg transition-colors">
            <Download size={18} />
            Exportar Saft
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-fm-default">
              <th className="text-left py-4 px-4 text-fm-muted font-medium">Documento</th>
              <th className="text-left py-4 px-4 text-fm-muted font-medium">Tipo</th>
              <th className="text-left py-4 px-4 text-fm-muted font-medium">Cliente</th>
              <th className="text-right py-4 px-4 text-fm-muted font-medium">Valor</th>
              <th className="text-center py-4 px-4 text-fm-muted font-medium">Status</th>
              <th className="text-left py-4 px-4 text-fm-muted font-medium">Hash</th>
              <th className="text-left py-4 px-4 text-fm-muted font-medium">Data</th>
              <th className="py-4 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b border-fm-default/50 hover:bg-fm-primary/50">
                <td className="py-4 px-4">
                  <span className="font-mono text-fm-accent font-medium">{doc.id}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-fm-primary">{doc.type.replace(/_/g, ' ')}</span>
                </td>
                <td className="py-4 px-4 text-fm-primary">{doc.client}</td>
                <td className="py-4 px-4 text-right font-mono">
                  MZN {Math.abs(doc.amount).toLocaleString('pt-MZ')}
                </td>
                <td className="py-4 px-4 text-center">
                  <FiscalBadge status={doc.status as any} />
                </td>
                <td className="py-4 px-4">
                  <code className="text-xs text-fm-muted bg-fm-primary px-2 py-1 rounded">
                    {doc.hash}
                  </code>
                </td>
                <td className="py-4 px-4 text-fm-muted">{doc.date}</td>
                <td className="py-4 px-4">
                  {doc.status === 'PENDENTE' || doc.status === 'INVALIDA' ? (
                    <button
                      onClick={() => handleValidate(doc.id)}
                      disabled={validating === doc.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#5E6AD2]/10 hover:bg-[#5E6AD2]/20 text-fm-accent rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      {validating === doc.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Validar
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </FiscalCard>

      {/* Validation Rules */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FiscalCard>
          <h2 className="text-lg font-semibold mb-4">Regras de Validação Saft-AO</h2>
          <div className="space-y-3">
            <ValidationRule
              title="Hash do Documento"
              description="Verifica a integridade criptográfica do documento"
              status="active"
            />
            <ValidationRule
              title="Sequência de Numeração"
              description="Valida a continuidade da numeração dos documentos"
              status="active"
            />
            <ValidationRule
              title="Dados do Cliente"
              description="Verifica NUIT e dados fiscais do cliente"
              status="warning"
            />
            <ValidationRule
              title="Taxas de IVA"
              description="Valida aplicação correta das taxas de IVA"
              status="active"
            />
          </div>
        </FiscalCard>

        <FiscalCard>
          <h2 className="text-lg font-semibold mb-4">Exportação Fiscal</h2>
          <div className="space-y-4">
            <div className="p-4 bg-fm-primary rounded-lg">
              <h3 className="text-fm-primary font-medium mb-2">Exportar Saft-AO (Mensal)</h3>
              <p className="text-sm text-fm-muted mb-3">Janeiro 2024</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#5E6AD2] hover:bg-[#4F5BC0] text-white rounded-lg text-sm transition-colors">
                <Download size={16} />
                Baixar XML
              </button>
            </div>
            <div className="p-4 bg-fm-primary rounded-lg">
              <h3 className="text-fm-primary font-medium mb-2">Exportar Saft-AO (Anual)</h3>
              <p className="text-sm text-fm-muted mb-3">Ano Fiscal 2024</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#5E6AD2] hover:bg-[#4F5BC0] text-white rounded-lg text-sm transition-colors">
                <Download size={16} />
                Baixar XML
              </button>
            </div>
          </div>
        </FiscalCard>
      </div>
    </div>
  )
}

function ValidationRule({ title, description, status }: { title: string; description: string; status: 'active' | 'warning' | 'error' }) {
  const statusColors = {
    active: 'bg-[#10B981]',
    warning: 'bg-[#F59E0B]',
    error: 'bg-[#EF4444]',
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-fm-primary rounded-lg">
      <div className={`w-2 h-2 rounded-full mt-2 ${statusColors[status]}`} />
      <div>
        <p className="text-fm-primary font-medium">{title}</p>
        <p className="text-sm text-fm-muted">{description}</p>
      </div>
    </div>
  )
}
