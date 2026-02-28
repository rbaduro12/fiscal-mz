import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Building2, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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

  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simular criação de conta
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    // Mostrar sucesso e redirecionar
    navigate({ to: '/login' })
  }

  return (
    <div className="min-h-screen bg-boho-cream flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8">
        {/* Left Side - Form */}
        <div className="bg-white rounded-3xl p-8 shadow-boho-lg border border-boho-beige">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-boho-brown hover:text-boho-coffee mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            <h1 className="text-3xl font-display font-bold text-boho-coffee mb-2">
              Criar Conta
            </h1>
            <p className="text-boho-brown">
              Comece sua jornada com o FISCAL.MZ
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                  step >= s ? 'bg-boho-terracotta text-white' : 'bg-boho-sand text-boho-brown'
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                <span className={`text-sm ${step >= s ? 'text-boho-coffee' : 'text-boho-taupe'}`}>
                  {s === 1 ? 'Dados Pessoais' : 'Empresa'}
                </span>
                {s === 1 && <div className="w-8 h-px bg-boho-beige ml-2" />}
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-boho-coffee mb-2">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-taupe" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Seu nome completo"
                      className="w-full pl-12 pr-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:border-boho-terracotta transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-boho-coffee mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-taupe" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:border-boho-terracotta transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-boho-coffee mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-taupe" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full pl-12 pr-12 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:border-boho-terracotta transition-colors"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-boho-taupe hover:text-boho-coffee"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-boho-coffee mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+258 XX XXX XXXX"
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:border-boho-terracotta transition-colors"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-xl font-medium transition-colors"
                >
                  Continuar
                </button>
              </>
            ) : (
              <>
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-boho-coffee mb-2">
                    Nome da Empresa
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-taupe" />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="Nome da sua empresa"
                      className="w-full pl-12 pr-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:border-boho-terracotta transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* NUIT */}
                <div>
                  <label className="block text-sm font-medium text-boho-coffee mb-2">
                    NUIT
                  </label>
                  <input
                    type="text"
                    value={formData.nuit}
                    onChange={(e) => setFormData({...formData, nuit: e.target.value})}
                    placeholder="Número único de identificação tributária"
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:border-boho-terracotta transition-colors"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-boho-beige hover:border-boho-terracotta text-boho-coffee rounded-xl font-medium transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-boho-brown mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-boho-terracotta hover:text-boho-coffee font-medium">
              Entrar
            </Link>
          </p>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex flex-col justify-center">
          <h2 className="text-3xl font-display font-bold text-boho-coffee mb-6">
            Por que escolher o FISCAL.MZ?
          </h2>
          <div className="space-y-4">
            {[
              {
                title: 'Conformidade Garantida',
                description: 'Documentos fiscais validados automaticamente segundo as normas da AGT.'
              },
              {
                title: 'Pagamentos Integrados',
                description: 'Aceite M-Pesa, transferências bancárias e cartões em um só lugar.'
              },
              {
                title: 'Suporte Especializado',
                description: 'Equipe local pronta para ajudar com suas dúvidas fiscais.'
              },
              {
                title: 'Comece Grátis',
                description: 'Teste todas as funcionalidades por 14 dias sem compromisso.'
              },
            ].map((benefit, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white rounded-xl shadow-boho border border-boho-beige">
                <div className="w-10 h-10 bg-boho-sage/10 rounded-lg flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-boho-sage" />
                </div>
                <div>
                  <h3 className="font-semibold text-boho-coffee mb-1">{benefit.title}</h3>
                  <p className="text-sm text-boho-brown">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
