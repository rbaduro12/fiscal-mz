import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowLeft, CheckCircle, AlertCircle, Briefcase } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nuitValid, setNuitValid] = useState<boolean | null>(null)
  const [nuitChecking, setNuitChecking] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    nuit: '',
    phone: '',
  })

  // Se já estiver autenticado, redireciona
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' })
    }
  }, [isAuthenticated, navigate])

  // Valida NUIT em tempo real
  useEffect(() => {
    const validateNuit = async () => {
      if (formData.nuit.length === 9) {
        setNuitChecking(true)
        try {
          const response = await api.get(`/empresas/validate-nuit/${formData.nuit}`)
          setNuitValid(response.data.valid)
        } catch {
          setNuitValid(false)
        } finally {
          setNuitChecking(false)
        }
      } else {
        setNuitValid(null)
      }
    }

    const timeout = setTimeout(validateNuit, 500)
    return () => clearTimeout(timeout)
  }, [formData.nuit])

  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      // Registro via API
      await api.post('/auth/register', {
        nome: formData.name,
        email: formData.email,
        password: formData.password,
        telefone: formData.phone,
        empresa: {
          nome: formData.companyName,
          nuit: formData.nuit,
        }
      })
      
      navigate({ to: '/login' })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatNuit = (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 9)
    return clean
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Lado Esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1e3a5f] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Criar Conta
            </h1>
            <p className="text-gray-500">
              Registre sua empresa no FISCAL.MZ
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  step >= s ? 'bg-[#1e3a5f] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                <span className={`text-sm font-medium ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                  {s === 1 ? 'Utilizador' : 'Empresa'}
                </span>
                {s === 1 && <div className="w-8 h-px bg-gray-200 ml-2" />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Seu nome completo"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email profissional
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="nome@empresa.co.mz"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+258</span>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                      placeholder="84 123 4567"
                      maxLength={9}
                      className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.password && formData.password.length < 8 && (
                    <p className="mt-1.5 text-xs text-red-500">Senha deve ter pelo menos 8 caracteres</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.name || !formData.email || !formData.password || formData.password.length < 8}
                  className="w-full py-3.5 bg-[#1e3a5f] hover:bg-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                >
                  Continuar
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Empresa
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="Nome fiscal da empresa"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NUIT <span className="text-gray-400 font-normal">(9 dígitos)</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.nuit}
                      onChange={(e) => setFormData({...formData, nuit: formatNuit(e.target.value)})}
                      placeholder="123 456 789"
                      maxLength={9}
                      className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        nuitValid === true ? 'border-green-500 focus:ring-green-500/20 focus:border-green-500' :
                        nuitValid === false ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' :
                        'border-gray-200 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]'
                      }`}
                      required
                    />
                    {nuitChecking && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-[#1e3a5f] rounded-full animate-spin" />
                      </div>
                    )}
                    {!nuitChecking && nuitValid === true && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                    {!nuitChecking && nuitValid === false && formData.nuit.length === 9 && (
                      <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                    )}
                  </div>
                  {nuitValid === false && formData.nuit.length === 9 && (
                    <p className="mt-1.5 text-xs text-red-500">NUIT inválido. Verifique os dígitos.</p>
                  )}
                  {nuitValid === true && (
                    <p className="mt-1.5 text-xs text-green-600">NUIT válido ✓</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Validação automática</p>
                      <p className="text-xs text-blue-700 mt-1">
                        O NUIT é validado automaticamente conforme o algoritmo oficial da Autoridade Tributária de Moçambique.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || nuitValid !== true}
                    className="flex-1 py-3.5 bg-[#1e3a5f] hover:bg-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-[#1e3a5f] hover:text-blue-700 font-semibold">
              Entrar
            </Link>
          </p>
        </div>
      </div>

      {/* Lado Direito - Info */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-[#1e3a5f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-20">
          <h2 className="text-3xl xl:text-4xl font-bold text-white mb-8">
            Por que escolher o<br />
            <span className="text-blue-300">FISCAL.MZ?</span>
          </h2>
          
          <div className="space-y-6">
            {[
              {
                title: 'Conformidade Fiscal',
                description: 'Documentos validados automaticamente segundo as normas da AGT. Númeração sequencial e hash fiscal.'
              },
              {
                title: 'Integração B2B',
                description: 'Crie cotações e faturas para outras empresas com validação automática de NUIT.'
              },
              {
                title: 'Gestão Integrada',
                description: 'Cotações, faturação e stock em um só lugar. Fluxo completo de negócio.'
              },
              {
                title: 'Suporte Local',
                description: 'Equipe em Moçambique pronta para ajudar com suas questões fiscais.'
              },
            ].map((benefit, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <CheckCircle className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                  <p className="text-sm text-blue-100 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-blue-200">
              "O FISCAL.MZ transformou nossa gestão fiscal. 
              Economizamos horas de trabalho manual."
            </p>
            <p className="text-sm text-white mt-2 font-medium">
              — Construções Maputo, Lda
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
