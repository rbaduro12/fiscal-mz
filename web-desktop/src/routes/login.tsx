import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { Eye, EyeOff, Loader2, Building2 } from 'lucide-react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(formData.email, formData.password)
      navigate({ to: '/dashboard' })
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-boho-sand via-boho-beige to-boho-cream p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-boho-coffee rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-boho-coffee">
            FISCAL.MZ
          </h1>
          <p className="text-boho-brown mt-2">
            Gestão Fiscal para Moçambique
          </p>
        </div>

        <FiscalCard className="shadow-xl">
          <h2 className="text-2xl font-semibold text-boho-coffee mb-6">
            Entrar na sua conta
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-boho-brown mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-terracotta/50 focus:border-boho-terracotta transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-boho-brown mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-terracotta/50 focus:border-boho-terracotta transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-boho-taupe hover:text-boho-coffee transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-boho-brown cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className="w-4 h-4 rounded border-boho-beige text-boho-terracotta focus:ring-boho-terracotta"
                />
                Lembrar-me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-boho-terracotta hover:text-boho-coffee transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-boho-coffee hover:bg-boho-brown text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-boho-beige text-center">
            <p className="text-sm text-boho-brown">
              Ainda não tem conta?{' '}
              <Link
                to="/register"
                className="text-boho-terracotta hover:text-boho-coffee font-medium transition-colors"
              >
                Registre-se
              </Link>
            </p>
          </div>

          {/* Credenciais de teste */}
          <div className="mt-4 p-3 bg-boho-sand/50 rounded-lg text-xs text-boho-brown">
            <p className="font-medium mb-1">Credenciais de teste:</p>
            <p>Admin: admin@fiscal.mz / password123</p>
            <p>Cliente: abc@comercial.co.mz / password123</p>
          </div>
        </FiscalCard>

        {/* Footer */}
        <p className="text-center text-sm text-boho-brown mt-8">
          © 2024 FISCAL.MZ - Sistema de Gestão Fiscal
        </p>
      </div>
    </div>
  )
}
