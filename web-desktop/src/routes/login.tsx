import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Eye, EyeOff, Loader2, Building2, Shield, CheckCircle } from 'lucide-react'

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
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Lado Esquerdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-[#1e3a5f] relative overflow-hidden">
        {/* Pattern de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-20">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">FISCAL.MZ</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Sistema de Gestão<br />
              <span className="text-blue-300">Fiscal & Comercial</span>
            </h1>
            
            <p className="text-lg text-blue-100 max-w-xl leading-relaxed">
              Plataforma completa para gestão de cotações, faturação e stock. 
              Desenvolvido para empresas moçambicanas.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-100">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <span>Cotações digitais com rastreabilidade</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <span>Faturação integrada com validação fiscal</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <span>Gestão de stock em tempo real</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <CheckCircle className="w-5 h-5 text-blue-400" />
              <span>Validação de NUIT automática</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1e3a5f]">FISCAL.MZ</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-gray-500">
                Entre com suas credenciais para acessar o sistema
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email profissional
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                  placeholder="nome@empresa.co.mz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                  />
                  Lembrar-me
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-[#1e3a5f] hover:text-blue-700 font-medium transition-colors"
                >
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#1e3a5f] hover:bg-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar no Sistema'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Ainda não tem conta?{' '}
                <Link
                  to="/register"
                  className="text-[#1e3a5f] hover:text-blue-700 font-semibold transition-colors"
                >
                  Registre sua empresa
                </Link>
              </p>
            </div>

            {/* Credenciais de teste */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ambiente de Teste</span>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setFormData({ email: 'admin@abc.co.mz', password: 'admin123', remember: false })}
                  className="w-full flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg hover:border-[#1e3a5f] hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-700">A</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Admin ABC</p>
                      <p className="text-xs text-gray-500">admin@abc.co.mz</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-400 group-hover:text-[#1e3a5f]">Usar →</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ email: 'vendedor@abc.co.mz', password: 'vendedor123', remember: false })}
                  className="w-full flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-green-700">V</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Vendedor ABC</p>
                      <p className="text-xs text-gray-500">vendedor@abc.co.mz</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-400 group-hover:text-green-600">Usar →</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            © 2024 FISCAL.MZ - Sistema de Gestão Fiscal para Moçambique
          </p>
        </div>
      </div>
    </div>
  )
}
