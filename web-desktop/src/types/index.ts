import { z } from 'zod'

// ============================================
// ENUMS / TIPOS BASE
// ============================================

export type TipoDocumento = 'COTACAO' | 'PROFORMA' | 'FACTURA' | 'RECIBO' | 'NOTA_CREDITO' | 'NOTA_DEBITO'
export type EstadoDocumento = 'RASCUNHO' | 'EMITIDA' | 'ACEITE' | 'REJEITADA' | 'PAGA' | 'PROCESSADA' | 'ANULADA'
export type TipoOperacaoIVA = 'TRIBUTAVEL_16' | 'TRIBUTAVEL_10' | 'TRIBUTAVEL_5' | 'ISENTO' | 'NAO_SUJEITO' | 'EXPORTACAO'
export type MetodoPagamento = 'CASH' | 'MPESA' | 'EMOLA' | 'BIM' | 'CARTAO' | 'TRANSFERENCIA'
export type EstadoPagamento = 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDO' | 'FALHADO' | 'REEMBOLSADO'
export type TipoEntidade = 'CLIENTE' | 'FORNECEDOR' | 'AMBOS'
export type UserRole = 'ADMIN' | 'GESTOR' | 'VENDEDOR' | 'CONTADOR' | 'CLIENTE'

// ============================================
// ENTIDADES
// ============================================

export interface Entidade {
  id: string
  nome: string
  nuit: string
  tipo: TipoEntidade
  email?: string
  telefone?: string
  endereco?: string
  cidade?: string
  ativo: boolean
  createdAt: string
  updatedAt: string
}

// ============================================
// ARTIGOS
// ============================================

export interface Artigo {
  id: string
  codigo: string
  descricao: string
  precoUnitario: number
  ivaPercent: number
  stock: number
  categoria?: string
  ativo: boolean
  createdAt: string
  updatedAt: string
}

// ============================================
// DOCUMENTOS
// ============================================

export interface LinhaDocumento {
  id: string
  artigoId?: string
  descricao: string
  quantidade: number
  precoUnitario: number
  descontoPercent: number
  ivaPercent: number
  totalLinha: number
  artigo?: Artigo
}

export interface Documento {
  id: string
  tipo: TipoDocumento
  serie: string
  numero: number
  numeroCompleto: string
  estado: EstadoDocumento
  operacaoIva: TipoOperacaoIVA
  entidadeId: string
  entidade?: Entidade
  subtotal: number
  totalDescontos: number
  totalIva: number
  totalPagar: number
  dataEmissao: string
  dataValidade?: string
  linhas: LinhaDocumento[]
  hashFiscal?: string
  qrCodeData?: string
  documentoOrigemId?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// COTAÇÕES
// ============================================

export interface Cotacao extends Documento {
  tipo: 'COTACAO'
}

export const CriarCotacaoSchema = z.object({
  entidadeId: z.string().uuid('Selecione um cliente'),
  itens: z.array(z.object({
    artigoId: z.string().uuid('Selecione um artigo'),
    quantidade: z.number().positive('Quantidade deve ser maior que 0'),
    precoUnitario: z.number().positive('Preço deve ser maior que 0'),
    descontoPercent: z.number().min(0).max(100).default(0),
  })).min(1, 'Adicione pelo menos um item'),
  validadeDias: z.number().min(1).max(90).default(30),
})

export type CriarCotacaoInput = z.infer<typeof CriarCotacaoSchema>

// ============================================
// PROFORMAS
// ============================================

export interface Proforma extends Documento {
  tipo: 'PROFORMA'
  cotacaoId?: string
}

// ============================================
// FATURAS
// ============================================

export interface Fatura extends Documento {
  tipo: 'FACTURA'
  proformaId?: string
  estadoPagamento: 'PENDENTE' | 'PARCIAL' | 'PAGO'
}

// ============================================
// RECIBOS
// ============================================

export interface Recibo extends Documento {
  tipo: 'RECIBO'
  faturaId: string
}

// ============================================
// PAGAMENTOS
// ============================================

export interface Pagamento {
  id: string
  documentoId: string
  metodo: MetodoPagamento
  valor: number
  estado: EstadoPagamento
  referencia?: string
  createdAt: string
  processedAt?: string
}

export interface DadosPagamentoInput {
  metodo: MetodoPagamento
  valorPago: number
  referenciaMpesa?: string
}

// ============================================
// DECLARAÇÕES IVA (MODELO A)
// ============================================

export interface DeclaracaoIVA {
  id: string
  empresaId: string
  periodoAno: number
  periodoMes: number
  // Quadro 01: Vendas 16%
  q1VendasBens16: number
  q1VendasServicos16: number
  q1TotalIva16: number
  // Quadro 02: Vendas 10%
  q2VendasBens10: number
  q2VendasServicos10: number
  q2TotalIva10: number
  // Quadro 03: Vendas 5%
  q3VendasBens5: number
  q3VendasServicos5: number
  q3TotalIva5: number
  // Quadro 05: Compras
  q5ComprasBens16: number
  q5ComprasServicos16: number
  q5Iva16: number
  q5ComprasBens5: number
  q5ComprasServicos5: number
  q5Iva5: number
  q5ImportacoesBens: number
  q5ImportacoesServicos: number
  q5ImportacoesIva: number
  // Quadro 06: Apuramento
  q6IvaLiquidado: number
  q6IvaDedutivel: number
  q6Diferenca: number
  q6CreditoAnterior: number
  q6CreditoTransportar: number
  q6IvaAPagar: number
  // Estado
  estado: 'RASCUNHO' | 'SUBMETIDA' | 'VALIDADA' | 'PAGA' | 'REJEITADA'
  dataSubmissao?: string
  codigoValidacao?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// RESPOSTAS DA API
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================
// DASHBOARD
// ============================================

export interface DashboardStats {
  totalVendasMes: number
  totalPendente: number
  totalRecebido: number
  proformasVencendo: number
  cotacoesPendentes: number
  totalFaturas: number
  totalRecibos: number
}

export interface EstatisticasFaturacao {
  periodo: string
  labels: string[]
  faturado: number[]
  recebido: number[]
  pendente: number[]
}

// ============================================
// AUTENTICAÇÃO
// ============================================

export interface Empresa {
  id: string
  nome: string
  nuit: string
  email?: string
  telefone?: string
  endereco?: string
  cidade?: string
}

export interface User {
  id: string
  email: string
  nome: string
  role: UserRole
  avatar?: string
  empresaId: string
  empresa?: Empresa
  telefone?: string
  ativo: boolean
}
