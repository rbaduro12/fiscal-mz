import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/lib/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export type UserRole = 'ADMIN' | 'GESTOR' | 'VENDEDOR' | 'CONTADOR' | 'CLIENTE'

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

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (role: UserRole | UserRole[]) => boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Chaves para localStorage
const STORAGE_KEYS = {
  user: 'fiscal_user',
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // Verificar sessão salva ao carregar
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem(STORAGE_KEYS.user)
        const accessToken = localStorage.getItem(STORAGE_KEYS.accessToken)
        
        if (savedUser && accessToken) {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error)
        // Limpar dados inválidos
        clearAuthData()
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }
    
    initAuth()
  }, [])

  const clearAuthData = () => {
    localStorage.removeItem(STORAGE_KEYS.user)
    localStorage.removeItem(STORAGE_KEYS.accessToken)
    localStorage.removeItem(STORAGE_KEYS.refreshToken)
    setUser(null)
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const response = await authService.login(email, password)
      
      if (!response.success) {
        throw new Error(response.message || 'Erro ao fazer login')
      }
      
      const { user, accessToken, refreshToken } = response.data
      
      // Salvar dados
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
      localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
      }
      
      setUser(user)
      
      // Invalidar queries do cache
      queryClient.clear()
      
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.response?.data?.message || error.message || 'Email ou senha incorretos')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Tentar fazer logout no servidor
      await authService.logout().catch(() => {
        // Ignora erro de logout no servidor
      })
    } finally {
      clearAuthData()
      queryClient.clear()
      window.location.href = '/login'
    }
  }

  const refreshUser = async () => {
    try {
      // Aqui poderia buscar dados atualizados do usuário
      // Por enquanto apenas mantém o estado atual
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
    }
  }

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  // Não renderizar children até inicializar
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-boho-sand">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-boho-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-boho-brown">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook para proteger rotas por role
export function useRequireRole(role: UserRole | UserRole[]) {
  const { hasRole, isAuthenticated, isLoading } = useAuth()
  
  return {
    allowed: isAuthenticated && hasRole(role),
    isLoading,
  }
}
