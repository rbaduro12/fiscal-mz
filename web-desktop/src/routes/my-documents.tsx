import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  FileText, Download, Eye, CheckCircle, Clock, 
  Search, Filter, 
  QrCode, Shield, X
} from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/my-documents')({
  component: MyDocumentsPage,
})

const MOCK_DOCUMENTS = [
  {
    id: 'FT/2024/0001',
    type: 'FATURA',
    description: 'Serviços Janeiro 2024',
    amount: 15000,
    iva: 0,
    total: 15000,
    date: '2024-01-31',
    dueDate: '2024-02-15',
    status: 'PAGO',
    quoteId: 'C/2024/0001',
    hash: 'A1B2C3D4E5F6G7H8',
    qrCode: 'https://fiscal.mz/verify/FT20240001',
    items: [
      { description: 'Consultoria mensal Janeiro', qty: 1, price: 15000 }
    ]
  },
  {
    id: 'PF/2024/0001',
    type: 'PROFORMA',
    description: 'Despacho Aduaneiro',
    amount: 8500,
    iva: 0,
    total: 8500,
    date: '2024-02-01',
    dueDate: '2024-02-15',
    status: 'PENDENTE',
    quoteId: 'C/2024/0002',
    hash: null,
    qrCode: null,
    items: [
      { description: 'Despacho container 40ft', qty: 1, price: 8500 }
    ]
  },
  {
    id: 'FT/2024/0002',
    type: 'FATURA',
    description: 'Serviços Fevereiro 2024',
    amount: 15000,
    iva: 0,
    total: 15000,
    date: '2024-02-28',
    dueDate: '2024-03-15',
    status: 'PENDENTE',
    quoteId: 'C/2024/0001',
    hash: 'B2C3D4E5F6G7H8I9',
    qrCode: 'https://fiscal.mz/verify/FT20240002',
    items: [
      { description: 'Consultoria mensal Fevereiro', qty: 1, price: 15000 }
    ]
  },
  {
    id: 'FT/2023/0156',
    type: 'FATURA',
    description: 'Registro de Empresa',
    amount: 25000,
    iva: 0,
    total: 25000,
    date: '2023-12-17',
    dueDate: '2023-12-30',
    status: 'PAGO',
    quoteId: 'C/2023/0089',
    hash: 'C3D4E5F6G7H8I9J0',
    qrCode: 'https://fiscal.mz/verify/FT20230156',
    items: [
      { description: 'Abertura de empresa', qty: 1, price: 25000 }
    ]
  },
  {
    id: 'ND/2024/0001',
    type: 'NOTA_DEBITO',
    description: 'Ajuste de Valor',
    amount: -1500,
    iva: 0,
    total: -1500,
    date: '2024-01-20',
    dueDate: null,
    status: 'VALIDA',
    quoteId: null,
    hash: 'D4E5F6G7H8I9J0K1',
    qrCode: 'https://fiscal.mz/verify/ND20240001',
    items: [
      { description: 'Desconto comercial', qty: 1, price: -1500 }
    ]
  }
]

function MyDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedDocument, setSelectedDocument] = useState<typeof MOCK_DOCUMENTS[0] | null>(null)
  const [showDocumentModal, setShowDocumentModal] = useState(false)

  const filteredDocuments = MOCK_DOCUMENTS.filter(doc => {
    const matchesSearch = doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'ALL' || doc.type === typeFilter
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      'PAGO': { 
        bg: 'bg-boho-sage/10', 
        text: 'text-boho-sage', 
        label: 'Pago',
        icon: CheckCircle
      },
      'PENDENTE': { 
        bg: 'bg-boho-mustard/10', 
        text: 'text-boho-mustard', 
        label: 'Pendente',
        icon: Clock
      },
      'VALIDA': { 
        bg: 'bg-boho-sage/10', 
        text: 'text-boho-sage', 
        label: 'Válida',
        icon: Shield
      },
      'CANCELADA': { 
        bg: 'bg-red-100', 
        text: 'text-red-600', 
        label: 'Cancelada',
        icon: X
      }
    }
    return configs[status] || configs['PENDENTE']
  }

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      'FATURA': { label: 'Fatura', color: 'bg-boho-terracotta' },
      'PROFORMA': { label: 'Proforma', color: 'bg-boho-mustard' },
      'NOTA_DEBITO': { label: 'Nota de Débito', color: 'bg-boho-coffee' },
      'NOTA_CREDITO': { label: 'Nota de Crédito', color: 'bg-boho-sage' }
    }
    return configs[type] || configs['FATURA']
  }

  const viewDocument = (doc: typeof MOCK_DOCUMENTS[0]) => {
    setSelectedDocument(doc)
    setShowDocumentModal(true)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-boho-coffee mb-1">
            Meus Documentos Fiscais
          </h1>
          <p className="text-boho-brown">
            Faturas, proformas e documentos validados pela AGT
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-boho border border-boho-beige">
          <p className="text-2xl font-display font-bold text-boho-coffee">
            {MOCK_DOCUMENTS.length}
          </p>
          <p className="text-sm text-boho-brown">Total</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-boho border border-boho-beige">
          <p className="text-2xl font-display font-bold text-boho-terracotta">
            {MOCK_DOCUMENTS.filter(d => d.type === 'FATURA').length}
          </p>
          <p className="text-sm text-boho-brown">Faturas</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-boho border border-boho-beige">
          <p className="text-2xl font-display font-bold text-boho-mustard">
            {MOCK_DOCUMENTS.filter(d => d.status === 'PENDENTE').length}
          </p>
          <p className="text-sm text-boho-brown">Pendentes</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-boho border border-boho-beige">
          <p className="text-2xl font-display font-bold text-boho-sage">
            {MOCK_DOCUMENTS.filter(d => d.status === 'PAGO').length}
          </p>
          <p className="text-sm text-boho-brown">Pagos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-boho border border-boho-beige mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-taupe" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar documentos..."
              className="w-full pl-12 pr-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:border-boho-terracotta transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta"
            >
              <option value="ALL">Todos os tipos</option>
              <option value="FATURA">Faturas</option>
              <option value="PROFORMA">Proformas</option>
              <option value="NOTA_DEBITO">Notas de Débito</option>
              <option value="NOTA_CREDITO">Notas de Crédito</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta"
            >
              <option value="ALL">Todos os status</option>
              <option value="PAGO">Pago</option>
              <option value="PENDENTE">Pendente</option>
              <option value="VALIDA">Válida</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-3 border border-boho-beige hover:border-boho-terracotta rounded-xl text-boho-brown hover:text-boho-terracotta transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl shadow-boho border border-boho-beige overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-boho-beige bg-boho-cream/50">
                <th className="text-left py-4 px-6 text-sm font-medium text-boho-taupe">Documento</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-boho-taupe">Descrição</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-boho-taupe">Data</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-boho-taupe">Valor</th>
                <th className="text-center py-4 px-6 text-sm font-medium text-boho-taupe">Status</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => {
                const statusConfig = getStatusConfig(doc.status)
                const typeConfig = getTypeConfig(doc.type)
                const StatusIcon = statusConfig.icon
                
                return (
                  <tr key={doc.id} className="border-b border-boho-beige/50 hover:bg-boho-sand/30 transition-colors">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${typeConfig.color}/10 rounded-lg flex items-center justify-center`}>
                          <FileText className={`w-5 h-5 ${typeConfig.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-medium text-boho-coffee">{doc.id}</p>
                          <span className={`inline-block px-2 py-0.5 ${typeConfig.color}/10 ${typeConfig.color.replace('bg-', 'text-')} text-xs rounded-full mt-1`}>
                            {typeConfig.label}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-boho-coffee font-medium">{doc.description}</p>
                      {doc.quoteId && (
                        <p className="text-xs text-boho-taupe mt-1">
                          Ref: {doc.quoteId}
                        </p>
                      )}
                    </td>
                    <td className="py-5 px-6">
                      <p className="text-sm text-boho-coffee">
                        {new Date(doc.date).toLocaleDateString('pt-MZ')}
                      </p>
                      {doc.dueDate && doc.status === 'PENDENTE' && (
                        <p className="text-xs text-boho-mustard mt-1">
                          Vence: {new Date(doc.dueDate).toLocaleDateString('pt-MZ')}
                        </p>
                      )}
                    </td>
                    <td className="py-5 px-6 text-right">
                      <p className={`font-mono font-medium ${doc.amount < 0 ? 'text-red-500' : 'text-boho-coffee'}`}>
                        MZN {Math.abs(doc.amount).toLocaleString('pt-MZ')}
                      </p>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewDocument(doc)}
                          className="p-2 hover:bg-boho-sand rounded-lg text-boho-taupe hover:text-boho-coffee transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-boho-sand rounded-lg text-boho-taupe hover:text-boho-coffee transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {doc.status === 'PENDENTE' && (
                          <Link
                            to="/my-payments"
                            className="px-3 py-1.5 bg-boho-terracotta hover:bg-boho-coffee text-white text-xs rounded-lg transition-colors"
                          >
                            Pagar
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-boho-sand/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-boho-taupe" />
            </div>
            <h3 className="text-xl font-display font-semibold text-boho-coffee mb-2">
              Nenhum documento encontrado
            </h3>
            <p className="text-boho-brown">
              Tente ajustar seus filtros de busca
            </p>
          </div>
        )}
      </div>

      {/* Fiscal Compliance Info */}
      <div className="mt-8 bg-gradient-to-br from-boho-sage/10 to-boho-sage/5 rounded-2xl p-6 border border-boho-sage/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-boho-sage/10 rounded-xl flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-boho-sage" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-lg text-boho-coffee mb-2">
              Conformidade Fiscal AGT
            </h3>
            <p className="text-boho-brown mb-4">
              Todos os documentos são validados automaticamente e estão em conformidade 
              com as normas da Autoridade Geral Tributária de Moçambique.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-boho-coffee">
                <CheckCircle className="w-4 h-4 text-boho-sage" />
                <span>Hash de validação incluído</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-boho-coffee">
                <CheckCircle className="w-4 h-4 text-boho-sage" />
                <span>QR Code para verificação</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-boho-coffee">
                <CheckCircle className="w-4 h-4 text-boho-sage" />
                <span>Exportação SAFT-AO disponível</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Detail Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-boho-coffee p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">
                    {getTypeConfig(selectedDocument.type).label}
                  </p>
                  <h3 className="text-2xl font-display font-semibold">
                    {selectedDocument.id}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowDocumentModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  getStatusConfig(selectedDocument.status).bg
                } ${getStatusConfig(selectedDocument.status).text}`}>
                  {(() => {
                    const Icon = getStatusConfig(selectedDocument.status).icon
                    return <Icon className="w-4 h-4" />
                  })()}
                  {getStatusConfig(selectedDocument.status).label}
                </span>
                <p className="text-sm text-boho-brown">
                  Emitida em {new Date(selectedDocument.date).toLocaleDateString('pt-MZ')}
                </p>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="font-medium text-boho-coffee mb-2">{selectedDocument.description}</h4>
                {selectedDocument.quoteId && (
                  <p className="text-sm text-boho-taupe">
                    Referente à cotação: {selectedDocument.quoteId}
                  </p>
                )}
              </div>

              {/* Items Table */}
              <div className="bg-boho-cream rounded-xl p-4 mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-boho-taupe text-sm">
                      <th className="text-left py-2">Descrição</th>
                      <th className="text-center py-2">Qtd</th>
                      <th className="text-right py-2">Preço</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDocument.items.map((item, idx) => (
                      <tr key={idx} className="text-boho-coffee">
                        <td className="py-2">{item.description}</td>
                        <td className="text-center py-2">{item.qty}</td>
                        <td className="text-right py-2 font-mono">
                          MZN {item.price.toLocaleString('pt-MZ')}
                        </td>
                        <td className="text-right py-2 font-mono font-medium">
                          MZN {(item.qty * item.price).toLocaleString('pt-MZ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-boho-beige">
                    <tr className="text-boho-coffee">
                      <td colSpan={3} className="text-right py-3 font-medium">Subtotal:</td>
                      <td className="text-right py-3 font-mono">
                        MZN {selectedDocument.amount.toLocaleString('pt-MZ')}
                      </td>
                    </tr>
                    <tr className="text-boho-coffee">
                      <td colSpan={3} className="text-right py-2 text-sm">IVA (0%):</td>
                      <td className="text-right py-2 font-mono text-sm">
                        MZN 0,00
                      </td>
                    </tr>
                    <tr className="text-boho-coffee font-semibold">
                      <td colSpan={3} className="text-right py-3">Total:</td>
                      <td className="text-right py-3 font-mono text-lg text-boho-terracotta">
                        MZN {selectedDocument.total.toLocaleString('pt-MZ')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Hash and QR */}
              {selectedDocument.hash && (
                <div className="bg-boho-sage/10 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-boho-sage" />
                    <span className="font-medium text-boho-coffee">Validação AGT</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-xs text-boho-taupe mb-1">Hash de validação:</p>
                      <p className="font-mono text-sm text-boho-coffee break-all">
                        {selectedDocument.hash}
                      </p>
                    </div>
                    {selectedDocument.qrCode && (
                      <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center border border-boho-beige">
                        <QrCode className="w-10 h-10 text-boho-coffee" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDocumentModal(false)}
                  className="flex-1 py-3 border border-boho-beige hover:border-boho-terracotta text-boho-coffee rounded-xl font-medium transition-colors"
                >
                  Fechar
                </button>
                <button className="flex-1 py-3 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                {selectedDocument.status === 'PENDENTE' && (
                  <Link
                    to="/my-payments"
                    className="flex-1 py-3 bg-boho-sage hover:bg-boho-olive text-white rounded-xl font-medium transition-colors text-center"
                  >
                    Pagar
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
