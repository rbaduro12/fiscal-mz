import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'ADMIN' | 'CLIENT' | 'ACCOUNTANT'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  nuit?: string
  phone?: string
  companyName?: string
  companyAddress?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (role: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users para desenvolvimento
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@fiscal.mz',
    name: 'Administrador Geral',
    role: 'ADMIN',
    nuit: '000000001',
    phone: '+258 84 000 0001',
    companyName: 'FISCAL.MZ Admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=C67B5C&color=fff',
  },
  {
    id: '2',
    email: 'abc@comercial.co.mz',
    name: 'Manuel Fernando',
    role: 'CLIENT',
    nuit: '123456789',
    phone: '+258 84 123 4567',
    companyName: 'ABC Comercial, Lda',
    companyAddress: 'Av. Eduardo Mondlane, 1234, Maputo',
    avatar: 'https://ui-avatars.com/api/?name=Manuel+Fernando&background=9CAF88&color=fff',
  },
  {
    id: '3',
    email: 'xyz@imports.co.mz',
    name: 'Ana Maria Santos',
    role: 'CLIENT',
    nuit: '987654321',
    phone: '+258 86 987 6543',
    companyName: 'XYZ Imports & Export',
    companyAddress: 'Rua da Industria, 567, Beira',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Santos&background=D4A574&color=fff',
  },
  {
    id: '4',
    email: 'geral@maputotech.co.mz',
    name: 'Carlos Domingos',
    role: 'CLIENT',
    nuit: '456789123',
    phone: '+258 87 456 7890',
    companyName: 'Maputo Tech Solutions',
    companyAddress: 'Av. Julius Nyerere, 890, Maputo',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Domingos&background=B8A9C9&color=fff',
  },
  {
    id: '5',
    email: 'info@nampulaagro.co.mz',
    name: 'Fatima Abdallah',
    role: 'CLIENT',
    nuit: '789123456',
    phone: '+258 85 789 1234',
    companyName: 'Nampula Agro Negocios',
    companyAddress: 'Av. 25 de Setembro, 432, Nampula',
    avatar: 'https://ui-avatars.com/api/?name=Fatima+Abdallah&background=D4A5A5&color=fff',
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar se há sessão salva ao carregar
  useEffect(() => {
    const savedUser = localStorage.getItem('fiscal_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Mock authentication
    const foundUser = MOCK_USERS.find(u => u.email === email)
    
    if (!foundUser || password !== 'password123') {
      setIsLoading(false)
      throw new Error('Email ou senha incorretos')
    }
    
    setUser(foundUser)
    localStorage.setItem('fiscal_user', JSON.stringify(foundUser))
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('fiscal_user')
    localStorage.removeItem('fiscal_token')
  }

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
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
