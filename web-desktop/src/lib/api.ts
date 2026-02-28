import axios from 'axios'

// Criar instância do Axios com base no backend NestJS
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos timeout
})

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    // Adicionar headers de autenticação JWT
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de response
api.interceptors.response.use(
  (response) => {
    // Log em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`[API] Response:`, response.data)
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Tratamento de erro de autenticação
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Tentar refresh token
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'}/auth/refresh`,
            { refreshToken }
          )

          localStorage.setItem('access_token', data.accessToken)
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

          return api(originalRequest)
        }
      } catch (refreshError) {
        // Limpar tokens e redirecionar para login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('fiscal_user')
        window.location.href = '/login'
      }
    }

    // Tratamento de rate limiting
    if (error.response?.status === 429) {
      console.warn('[API] Rate limit exceeded.')
    }

    // Tratamento de erro offline
    if (!error.response) {
      console.error('[API] Network error. Check connection.')
    }

    // Log de erros
    if (import.meta.env.DEV) {
      console.error('[API] Error:', error.response?.data || error.message)
    }

    return Promise.reject(error)
  }
)

// ============================================
// SERVIÇOS DE API POR MÓDULO
// ============================================

// === AUTH SERVICE ===
export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },
  
  register: async (userData: {
    nome: string
    email: string
    password: string
    telefone?: string
    empresa: {
      nome: string
      nuit: string
      endereco?: string
    }
  }) => {
    const { data } = await api.post('/auth/register', userData)
    return data
  },
  
  refreshToken: async (refreshToken: string) => {
    const { data } = await api.post('/auth/refresh', { refreshToken })
    return data
  },
  
  logout: async () => {
    const { data } = await api.post('/auth/logout')
    return data
  },
}

// === ENTIDADES (CLIENTES/FORNECEDORES) SERVICE ===
export const entidadesService = {
  listar: async (params?: { tipo?: string; page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get('/entidades', { params })
    return data
  },
  
  obter: async (id: string) => {
    const { data } = await api.get(`/entidades/${id}`)
    return data
  },
  
  criar: async (entidadeData: {
    nome: string
    nuit: string
    tipo: 'CLIENTE' | 'FORNECEDOR' | 'AMBOS'
    email?: string
    telefone?: string
    endereco?: string
    cidade?: string
  }) => {
    const { data } = await api.post('/entidades', entidadeData)
    return data
  },
  
  atualizar: async (id: string, entidadeData: Partial<{
    nome: string
    email: string
    telefone: string
    endereco: string
    cidade: string
    ativo: boolean
  }>) => {
    const { data } = await api.patch(`/entidades/${id}`, entidadeData)
    return data
  },
}

// === ARTIGOS (PRODUTOS) SERVICE ===
export const artigosService = {
  listar: async (params?: { 
    page?: number
    limit?: number
    search?: string
    categoria?: string
    comStock?: boolean 
  }) => {
    const { data } = await api.get('/artigos', { params })
    return data
  },
  
  obter: async (id: string) => {
    const { data } = await api.get(`/artigos/${id}`)
    return data
  },
  
  criar: async (artigoData: {
    codigo: string
    descricao: string
    precoUnitario: number
    ivaPercent?: number
    stock?: number
    categoria?: string
  }) => {
    const { data } = await api.post('/artigos', artigoData)
    return data
  },
  
  atualizar: async (id: string, artigoData: Partial<{
    descricao: string
    precoUnitario: number
    ivaPercent: number
    categoria: string
  }>) => {
    const { data } = await api.patch(`/artigos/${id}`, artigoData)
    return data
  },
  
  obterStock: async (id: string) => {
    const { data } = await api.get(`/artigos/${id}/stock`)
    return data
  },
}

// === DOCUMENTOS (COTAÇÕES/PROFORMAS/FATURAS) SERVICE ===
export const documentosService = {
  // Listar documentos
  listar: async (params?: {
    tipo?: 'COTACAO' | 'PROFORMA' | 'FACTURA' | 'RECIBO'
    estado?: string
    page?: number
    limit?: number
  }) => {
    const { data } = await api.get('/documentos', { params })
    return data
  },
  
  obter: async (id: string) => {
    const { data } = await api.get(`/documentos/${id}`)
    return data
  },
  
  // Cotações
  criarCotacao: async (cotacaoData: {
    entidadeId: string
    itens: Array<{
      artigoId: string
      quantidade: number
      precoUnitario: number
      descontoPercent?: number
    }>
    validadeDias?: number
  }) => {
    const { data } = await api.post('/cotacoes', cotacaoData)
    return data
  },
  
  aceitarCotacao: async (id: string, dadosPagamento?: {
    metodo: 'CASH' | 'MPESA' | 'EMOLA' | 'BIM' | 'CARTAO'
    valorPago: number
  }) => {
    const { data } = await api.post(`/cotacoes/${id}/aceitar`, dadosPagamento)
    return data
  },
  
  // Proformas
  processarPagamento: async (proformaId: string, dadosPagamento: {
    metodo: 'CASH' | 'MPESA' | 'EMOLA' | 'BIM' | 'CARTAO'
    valorPago: number
    referenciaMpesa?: string
  }) => {
    const { data } = await api.post(`/proformas/${proformaId}/pagar`, dadosPagamento)
    return data
  },
}

// === FISCAL (IVA) SERVICE ===
export const fiscalService = {
  // Gerar Modelo A
  gerarModeloA: async (ano: number, mes: number) => {
    const { data } = await api.post('/declaracoes-iva/gerar', { ano, mes })
    return data
  },
  
  // Listar declarações
  listarDeclaracoes: async (params?: { ano?: number; mes?: number; estado?: string }) => {
    const { data } = await api.get('/declaracoes-iva', { params })
    return data
  },
  
  // Obter detalhes de declaração
  obterDeclaracao: async (id: string) => {
    const { data } = await api.get(`/declaracoes-iva/${id}`)
    return data
  },
  
  // Exportar XML
  exportarXML: async (id: string) => {
    const response = await api.get(`/declaracoes-iva/${id}/xml`, {
      responseType: 'blob',
    })
    return response.data
  },
  
  // Exportar PDF
  exportarPDF: async (id: string) => {
    const response = await api.get(`/declaracoes-iva/${id}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },
  
  // Submeter declaração
  submeter: async (id: string) => {
    const { data } = await api.post(`/declaracoes-iva/${id}/submeter`)
    return data
  },
}

// === DASHBOARD SERVICE ===
export const dashboardService = {
  obterResumo: async () => {
    const { data } = await api.get('/dashboard/resumo')
    return data
  },
  
  obterEstatisticasFaturacao: async (periodo: '7d' | '30d' | '90d' | '1y' = '30d') => {
    const { data } = await api.get('/dashboard/faturacao', { params: { periodo } })
    return data
  },
  
  obterAlertas: async () => {
    const { data } = await api.get('/dashboard/alertas')
    return data
  },
}

// === UTILIDADES ===

// Função para upload de arquivos
export const uploadFile = async (file: File, endpoint: string) => {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data
}

// Função para download de PDF/Blob
export const downloadBlob = async (url: string, filename: string, type = 'application/pdf') => {
  const response = await api.get(url, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data], { type })
  const downloadUrl = window.URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  window.URL.revokeObjectURL(downloadUrl)
}
