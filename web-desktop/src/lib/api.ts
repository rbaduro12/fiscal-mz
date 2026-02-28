import axios from 'axios'

// Criar instância do Axios
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos timeout
})

// Interceptor de request
api.interceptors.request.use(
  (config) => {
    // Adicionar headers de autenticação
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Adicionar tenant ID
    const tenantId = localStorage.getItem('tenant_id')
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId
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
          const { data } = await axios.post('/auth/refresh', {
            refreshToken,
          })

          localStorage.setItem('access_token', data.access_token)
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`

          return api(originalRequest)
        }
      } catch (refreshError) {
        // Limpar tokens e redirecionar para login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }

    // Tratamento de rate limiting
    if (error.response?.status === 429) {
      console.warn('[API] Rate limit exceeded. Retrying...')
      // Implementar retry com backoff
    }

    // Tratamento de erro offline
    if (!error.response) {
      console.error('[API] Network error. Check connection.')
      // Aqui poderia integrar com o sistema de queue offline
    }

    // Log de erros
    if (import.meta.env.DEV) {
      console.error('[API] Error:', error.response?.data || error.message)
    }

    return Promise.reject(error)
  }
)

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

// Função para download de PDF
export const downloadPdf = async (url: string, filename: string) => {
  const response = await api.get(url, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data], { type: 'application/pdf' })
  const downloadUrl = window.URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  window.URL.revokeObjectURL(downloadUrl)
}
