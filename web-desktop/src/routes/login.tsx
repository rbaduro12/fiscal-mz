import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, Leaf, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' })
    }
  }, [isAuthenticated, navigate])

  // Se já estiver autenticado, não renderiza nada
  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Por favor, preencha email e senha.')
      return
    }
    
    setIsLoading(true)

    try {
      await login(email, password)
      // O useEffect acima vai redirecionar automaticamente após isAuthenticated mudar
    } catch (err) {
      setError('Email ou senha incorretos. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-boho-cream flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-boho-terracotta/10 to-boho-sage/10 rounded-3xl p-8 border border-boho-beige">
          <div>
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-boho mb-6">
              <Leaf className="w-8 h-8 text-boho-terracotta" />
            </div>
            <h2 className="text-3xl font-display font-bold text-boho-coffee mb-4">
              Bem-vindo de volta!
            </h2>
            <p className="text-boho-brown text-lg">
              Acesse sua conta para gerenciar seus documentos fiscais, 
              cotações e pagamentos.
            </p>
          </div>
          
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-boho">
            <p className="text-sm text-boho-coffee font-medium mb-3">Contas de demonstração:</p>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-boho-cream rounded-lg">
                <p className="font-medium text-boho-coffee">Admin</p>
                <p className="text-boho-brown">admin@fiscal.mz / password123</p>
              </div>
              <div className="p-3 bg-boho-cream rounded-lg">
                <p className="font-medium text-boho-coffee">Cliente</p>
                <p className="text-boho-brown">abc@comercial.co.mz / password123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-3xl p-8 shadow-boho-lg border border-boho-beige">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-boho-terracotta to-boho-sage rounded-2xl flex items-center justify-center shadow-boho mx-auto mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-boho-coffee mb-1">
              Entrar
            </h1>
            <p className="text-boho-brown text-sm">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-boho-coffee mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-taupe" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:border-boho-terracotta transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-boho-coffee mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-taupe" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:border-boho-terracotta transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-boho-taupe hover:text-boho-coffee transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-boho-beige text-boho-terracotta focus:ring-boho-terracotta" />
                <span className="text-boho-brown">Lembrar-me</span>
              </label>
              <a href="#" className="text-boho-terracotta hover:text-boho-coffee font-medium">
                Esqueceu a senha?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              onClick={(e) => {
                // Fallback para garantir que o submit funcione
                if (!isLoading) {
                  handleSubmit(e as any)
                }
              }}
              className="w-full py-3 bg-boho-terracotta hover:bg-boho-coffee text-white font-semibold rounded-xl shadow-boho transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-boho-beige" />
            <span className="text-sm text-boho-taupe">ou</span>
            <div className="flex-1 h-px bg-boho-beige" />
          </div>

          {/* Quick Login Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => { setEmail('admin@fiscal.mz'); setPassword('password123') }}
              className="py-3 px-4 bg-boho-cream hover:bg-boho-sand border border-boho-beige rounded-xl text-sm text-boho-coffee transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => { setEmail('abc@comercial.co.mz'); setPassword('password123') }}
              className="py-3 px-4 bg-boho-cream hover:bg-boho-sand border border-boho-beige rounded-xl text-sm text-boho-coffee transition-colors"
            >
              Cliente
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-boho-brown">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-boho-terracotta hover:text-boho-coffee font-medium">
              Criar conta
            </Link>
          </p>

          {/* Back to Home */}
          <div className="mt-6 pt-6 border-t border-boho-beige text-center">
            <Link to="/" className="text-sm text-boho-taupe hover:text-boho-coffee transition-colors">
              ← Voltar para página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
