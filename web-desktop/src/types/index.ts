import { z } from 'zod'

// Enums
export type QuoteStatus = 'RASCUNHO' | 'ENVIADA' | 'NEGOCIANDO' | 'ACEITE' | 'REJEITADA' | 'CONVERTIDA' | 'VENCIDA'
export type ProformaStatus = 'PENDENTE' | 'EM_ESCROW' | 'PAGA' | 'VENCIDA' | 'CANCELADA'
export type PaymentMethod = 'CASH' | 'MPESA' | 'EMOLA' | 'BIM' | 'CARTAO_DEBITO' | 'CARTAO_CREDITO' | 'ESCROW'
export type PaymentStatus = 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDO' | 'FALHADO' | 'REEMBOLSADO'
export type FiscalStatus = 'VALIDO' | 'PENDENTE_SYNC' | 'SYNCING' | 'ERRO_HASH' | 'ERRO_VALIDACAO' | 'ANULADO'
export type DocumentType = 'FT' | 'FR' | 'NC' | 'ND'

// Schemas de validação Zod
export const QuoteItemSchema = z.object({
  produtoId: z.string().uuid(),
  descricao: z.string().min(1),
  quantidade: z.number().positive(),
  precoUnit: z.number().positive(),
  descontoPercent: z.number().min(0).max(100).default(0),
  ivaPercent: z.number().default(16),
  totalLinha: z.number().optional(),
})

export const CreateQuoteSchema = z.object({
  clientId: z.string().uuid(),
  items: z.array(QuoteItemSchema).min(1),
  validityDays: z.number().min(1).max(90).default(30),
})

export const AcceptQuoteSchema = z.object({
  negotiatedItems: z.array(z.object({
    produtoId: z.string().uuid(),
    novoPreco: z.number().positive().optional(),
    novaQuantidade: z.number().positive().optional(),
    comentario: z.string().optional(),
  })).optional(),
})

// Tipos inferidos
export type QuoteItem = z.infer<typeof QuoteItemSchema>
export type CreateQuoteInput = z.infer<typeof CreateQuoteSchema>
export type AcceptQuoteInput = z.infer<typeof AcceptQuoteSchema>

// Interfaces
export interface Quote {
  id: string
  numeroCotacao: string
  tenantId: string
  clienteId: string
  status: QuoteStatus
  itens: QuoteItem[]
  subtotal: number
  totalDescontos: number
  totalIva: number
  totalEstimado: number
  validadeAte: string
  historicoNegociacao: HistoricoNegociacao[]
  conversaoDocumentoId?: string
  createdAt: string
  updatedAt: string
  cliente?: Cliente
}

export interface HistoricoNegociacao {
  data: string
  autorId: string
  autorTipo: 'VENDEDOR' | 'COMPRADOR'
  tipo: 'ALTERACAO_PRECO' | 'ALTERACAO_QTD' | 'COUNTER_OFFER' | 'COMENTARIO' | 'ENVIO' | 'ACEITE' | 'REJEITE'
  campoAfectado?: string
  valorAnterior?: number
  valorNovo?: number
  comentario?: string
}

export interface Proforma {
  id: string
  cotacaoId?: string
  tenantId: string
  clienteId: string
  numeroProforma: string
  dataEmissao: string
  dataVencimento: string
  itens: QuoteItem[]
  subtotal: number
  totalDescontos: number
  totalIva: number
  totalGeral: number
  condicoesPagamento: 'IMMEDIATO' | '30_DIAS' | '50_50' | 'ESCROW'
  status: ProformaStatus
  notas?: string
  cliente?: Cliente
}

export interface Cliente {
  id: string
  nome: string
  nif?: string
  email?: string
  telefone?: string
  endereco?: string
}

export interface Payment {
  id: string
  tenantId: string
  clienteId: string
  proformaId?: string
  faturaId?: string
  metodo: PaymentMethod
  valor: number
  moeda: string
  estado: PaymentStatus
  gatewayRef?: string
  isEscrow: boolean
  escrowReleaseDate?: string
  comprovativoUrl?: string
  createdAt: string
  processedAt?: string
}

export interface FiscalDocument {
  id: string
  tenantId: string
  clienteId: string
  proformaOriginId?: string
  tipo: DocumentType
  numeroDocumento: string
  dataEmissao: string
  itens: QuoteItem[]
  subtotal: number
  totalDescontos: number
  totalIva: number
  totalGeral: number
  hashDocumento: string
  qrCodeData?: string
  estadoPagamento: 'PENDENTE' | 'PARCIAL' | 'PAGO' | 'EXCEDENTE'
  pagamentoIntegrado: boolean
  estado: 'ATIVO' | 'ANULADO'
}

export interface Wallet {
  tenantId: string
  balance: number
  emEscrow: number
  saquesPendentes: number
}

export interface DashboardStats {
  totalVendasMes: number
  totalPendente: number
  totalRecebido: number
  proformasVencendo: number
  cotacoesPendentes: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
