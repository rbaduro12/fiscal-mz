/**
 * Utilitários para autenticação JWT
 */

interface DecodedToken {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
}

/**
 * Decodifica um token JWT
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

/**
 * Verifica se o token está expirado ou vai expirar em breve (buffer de 60 segundos)
 */
export function isTokenExpired(token: string, bufferSeconds = 60): boolean {
  const decoded = decodeToken(token)
  if (!decoded) return true
  
  const expirationTime = decoded.exp * 1000 // Converter para ms
  const now = Date.now()
  
  return now >= (expirationTime - bufferSeconds * 1000)
}

/**
 * Verifica se o token é válido (não expirado e formato correto)
 */
export function isValidToken(token: string | null): boolean {
  if (!token) return false
  return !isTokenExpired(token)
}

/**
 * Retorna o tempo restante em segundos até o token expirar
 */
export function getTokenRemainingTime(token: string): number {
  const decoded = decodeToken(token)
  if (!decoded) return 0
  
  const expirationTime = decoded.exp * 1000
  const now = Date.now()
  
  return Math.max(0, Math.floor((expirationTime - now) / 1000))
}

/**
 * Faz logout limpando todos os dados de autenticação
 */
export function logout(): void {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('fiscal_user')
  window.location.href = '/login'
}

/**
 * Obtém o token de acesso válido ou retorna null
 */
export function getValidAccessToken(): string | null {
  const token = localStorage.getItem('access_token')
  return isValidToken(token) ? token : null
}
