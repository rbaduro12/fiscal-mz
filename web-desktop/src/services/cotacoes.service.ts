/**
 * Serviço de Cotações - CQRS API
 * Endpoints: /api/v1/quotes
 */
import { api } from '@/lib/api'

export interface ItemCotacaoInput {
  artigoId: string
  codigo?: string
  descricao: string
  quantidade: number
  precoUnitario: number
  desconto?: number
  taxaIva?: number
}

export interface CriarCotacaoInput {
  clienteId: string
  itens: ItemCotacaoInput[]
  validadeDias?: number
  observacoes?: string
}

export interface Cotacao {
  id: string
  numero: string
  status: 'RASCUNHO' | 'ENVIADA' | 'ACEITE' | 'REJEITADA' | 'CONVERTIDA' | 'EXPIRADA'
  tenantId: string
  vendedorId: string
  clienteId: string
  subtotal: number
  totalIva: number
  total: number
  validadeDias: number
  dataExpiracao?: string
  dataAceite?: string
  observacoes?: string
  proformaId?: string
  itens: ItemCotacao[]
  createdAt: string
  updatedAt: string
}

export interface ItemCotacao {
  id: string
  cotacaoId: string
  artigoId: string
  codigo: string
  descricao: string
  quantidade: number
  precoUnitario: number
  desconto: number
  taxaIva: number
  totalLinha: number
  ivaLinha: number
  negociado: boolean
  precoOriginal?: number
}

export interface AceitarCotacaoInput {
  notas?: string
  prazoEntrega?: number
}

export const cotacoesService = {
  // Listar cotações enviadas (vendedor)
  listarEnviadas: async (params?: { page?: number; limit?: number }): Promise<Cotacao[]> => {
    const response = await api.get('/api/v1/quotes/sent', { params })
    // Backend retorna { data: Cotacao[], meta: {...} }
    return response.data?.data || []
  },

  // Listar cotações recebidas (cliente)
  listarRecebidas: async (params?: { page?: number; limit?: number }): Promise<Cotacao[]> => {
    const response = await api.get('/api/v1/quotes/received', { params })
    return response.data?.data || []
  },

  // Obter detalhes de uma cotação
  obter: async (id: string) => {
    const { data } = await api.get(`/api/v1/quotes/${id}`)
    return data
  },

  // Criar nova cotação
  criar: async (input: CriarCotacaoInput, idempotencyKey?: string) => {
    const headers: Record<string, string> = {}
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey
    }
    
    // Mapear o input para o formato esperado pelo backend
    const payload = {
      clienteId: input.clienteId,
      itens: input.itens.map(item => ({
        artigoId: item.artigoId,
        codigo: item.codigo || '',
        descricao: item.descricao,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
        desconto: item.desconto || 0,
        taxaIva: item.taxaIva || 16,
      })),
      validadeDias: input.validadeDias || 30,
      observacoes: input.observacoes,
    }
    
    const { data } = await api.post('/api/v1/quotes', payload, { headers })
    return data
  },

  // Aceitar cotação (cliente)
  aceitar: async (id: string, input?: AceitarCotacaoInput) => {
    const { data } = await api.patch(`/api/v1/quotes/${id}/accept`, input || {})
    return data
  },

  // Gerar proforma a partir da cotação
  gerarProforma: async (id: string) => {
    const { data } = await api.post(`/api/v1/quotes/${id}/proforma`)
    return data
  },

  // === PAGAMENTOS ===
  
  // Iniciar pagamento de proforma
  iniciarPagamento: async (proformaId: string, method: 'MPESA' | 'CASH' | 'ESCROW' | 'CARTAO', metadata?: any) => {
    const { data } = await api.post(`/api/v1/proformas/${proformaId}/pay`, {
      method,
      metadata,
    })
    return data
  },

  // === WALLET ===
  
  // Obter saldo da wallet
  obterSaldoWallet: async () => {
    const { data } = await api.get('/api/v1/wallet/balance')
    return data
  },

  // Solicitar levantamento
  solicitarLevantamento: async (amount: number, bankAccount: string) => {
    const { data } = await api.post('/api/v1/wallet/withdraw', {
      amount,
      bankAccount,
    })
    return data
  },
}
