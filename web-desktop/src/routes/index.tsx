import { createFileRoute, Link } from '@tanstack/react-router'
import { 
  ArrowRight, CheckCircle, Users, FileText, CreditCard, 
  Shield, Zap, BarChart3, Globe, Leaf, ChevronRight,
  Star, Quote
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen bg-boho-cream">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-boho-beige">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-boho-terracotta to-boho-sage rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-boho-coffee">FISCAL.MZ</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-boho-brown hover:text-boho-coffee transition-colors">Funcionalidades</a>
            <a href="#how-it-works" className="text-boho-brown hover:text-boho-coffee transition-colors">Como Funciona</a>
            <a href="#pricing" className="text-boho-brown hover:text-boho-coffee transition-colors">Preços</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-boho-coffee hover:text-boho-terracotta font-medium transition-colors">
              Entrar
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2.5 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-xl font-medium transition-colors shadow-boho"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-boho-terracotta/10 rounded-full text-boho-terracotta text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                Sistema #1 de Gestão Fiscal em Moçambique
              </div>
              <h1 className="text-5xl lg:text-6xl font-display font-bold text-boho-coffee leading-tight mb-6">
                Simplifique sua <br />
                <span className="text-boho-terracotta">Gestão Fiscal</span>
              </h1>
              <p className="text-xl text-boho-brown mb-8 max-w-lg">
                Plataforma completa para gestão de documentos fiscais, cotações B2B, 
                pagamentos e conformidade com a AGT.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-xl font-semibold transition-colors shadow-boho-lg"
                >
                  Experimente Grátis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a 
                  href="#demo"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-boho-sand text-boho-coffee rounded-xl font-semibold transition-colors border border-boho-beige"
                >
                  Ver Demonstração
                </a>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-boho-beige">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-boho-sand border-2 border-white flex items-center justify-center text-xs font-medium text-boho-coffee">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-boho-mustard">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-boho-brown">+500 empresas confiam</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-boho-terracotta/20 to-boho-sage/20 rounded-3xl transform rotate-3" />
              <div className="relative bg-white rounded-3xl shadow-boho-xl p-8 border border-boho-beige">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-boho-taupe">Vendas do Mês</p>
                    <p className="text-3xl font-display font-bold text-boho-coffee">MZN 245.000</p>
                  </div>
                  <div className="w-12 h-12 bg-boho-sage/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-boho-sage" />
                  </div>
                </div>
                <div className="h-32 bg-boho-cream rounded-xl mb-6 flex items-end p-4 gap-2">
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-boho-terracotta rounded-t-lg" style={{height: `${h}%`}} />
                  ))}
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Cotações Pendentes', value: '12', color: 'bg-boho-mustard' },
                    { label: 'Pagamentos Recebidos', value: '18', color: 'bg-boho-sage' },
                    { label: 'Documentos Emitidos', value: '45', color: 'bg-boho-terracotta' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-boho-cream rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-sm text-boho-brown">{item.label}</span>
                      </div>
                      <span className="font-semibold text-boho-coffee">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-boho-beige">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Empresas' },
              { value: '50K+', label: 'Documentos Processados' },
              { value: 'MZN 10M+', label: 'Em Transações' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-display font-bold text-boho-terracotta mb-2">{stat.value}</p>
                <p className="text-boho-brown">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-bold text-boho-coffee mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-boho-brown">
              Ferramentas poderosas para gerenciar seu negócio com eficiência e conformidade fiscal.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="w-6 h-6" />,
                title: 'Cotações B2B',
                description: 'Crie e envie cotações profissionais. Acompanhe negociações em tempo real.'
              },
              {
                icon: <CreditCard className="w-6 h-6" />,
                title: 'Pagamentos Integrados',
                description: 'Aceite M-Pesa, transferências e cartões. Automatize reconciliação.'
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Conformidade AGT',
                description: 'Documentos fiscais validados automaticamente. Exportação SAFT-AO.'
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Gestão de Clientes',
                description: 'Cadastro completo com histórico de transações e comunicação integrada.'
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Automação',
                description: 'Workflows automáticos para cotações, pagamentos e lembretes.'
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: 'Acesso Multi-dispositivo',
                description: 'Web, mobile e desktop. Trabalhe de qualquer lugar.'
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-boho border border-boho-beige hover:shadow-boho-lg transition-shadow group">
                <div className="w-14 h-14 bg-boho-terracotta/10 rounded-xl flex items-center justify-center text-boho-terracotta mb-6 group-hover:bg-boho-terracotta group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-display font-semibold text-boho-coffee mb-3">{feature.title}</h3>
                <p className="text-boho-brown">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-bold text-boho-coffee mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-boho-brown">
              Comece a usar em minutos. Processo simples e intuitivo.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Crie sua conta',
                description: 'Cadastre-se gratuitamente e configure sua empresa em poucos minutos.'
              },
              {
                step: '02',
                title: 'Cadastre seus clientes',
                description: 'Adicione seus clientes e configure produtos ou serviços.'
              },
              {
                step: '03',
                title: 'Comece a faturar',
                description: 'Crie cotações, envie proformas e receba pagamentos.'
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-display font-bold text-boho-beige mb-4">{item.step}</div>
                <h3 className="text-xl font-display font-semibold text-boho-coffee mb-3">{item.title}</h3>
                <p className="text-boho-brown">{item.description}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-boho-beige">
                    <ChevronRight className="w-5 h-5 text-boho-taupe absolute right-0 -top-2.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-bold text-boho-coffee mb-4">
              O que dizem nossos clientes
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: 'O FISCAL.MZ transformou nossa gestão fiscal. Economizamos horas de trabalho manual.',
                author: 'Manuel Fernando',
                company: 'ABC Comercial',
                avatar: 'MF'
              },
              {
                quote: 'Integração perfeita com M-Pesa. Nossos pagamentos nunca foram tão rápidos.',
                author: 'Ana Santos',
                company: 'XYZ Imports',
                avatar: 'AS'
              },
              {
                quote: 'Suporte técnico excelente e sistema sempre atualizado com as normas da AGT.',
                author: 'Carlos Domingos',
                company: 'Maputo Tech',
                avatar: 'CD'
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-boho border border-boho-beige">
                <Quote className="w-8 h-8 text-boho-terracotta/30 mb-4" />
                <p className="text-boho-coffee mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-boho-terracotta rounded-full flex items-center justify-center text-white font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-boho-coffee">{testimonial.author}</p>
                    <p className="text-sm text-boho-brown">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-bold text-boho-coffee mb-4">
              Planos e Preços
            </h2>
            <p className="text-xl text-boho-brown">
              Escolha o plano ideal para o seu negócio.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Grátis',
                description: 'Para freelancers e pequenos negócios',
                features: ['5 cotações/mês', '3 clientes', 'Pagamentos M-Pesa', 'Suporte por email'],
                cta: 'Começar Grátis',
                popular: false
              },
              {
                name: 'Business',
                price: 'MZN 2.990',
                period: '/mês',
                description: 'Para empresas em crescimento',
                features: ['Cotações ilimitadas', 'Clientes ilimitados', 'Todos os métodos de pagamento', 'Documentos fiscais', 'Suporte prioritário'],
                cta: 'Escolher Business',
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Personalizado',
                description: 'Para grandes empresas',
                features: ['Tudo do Business', 'API access', 'Integrações customizadas', 'Gerente de conta dedicado', 'SLA garantido'],
                cta: 'Falar com Vendas',
                popular: false
              },
            ].map((plan, i) => (
              <div key={i} className={`rounded-2xl p-8 border ${plan.popular ? 'bg-boho-coffee text-white border-boho-coffee shadow-boho-xl' : 'bg-white border-boho-beige shadow-boho'}`}>
                {plan.popular && (
                  <span className="inline-block px-3 py-1 bg-boho-terracotta rounded-full text-xs font-medium mb-4">
                    Mais Popular
                  </span>
                )}
                <h3 className={`text-xl font-display font-semibold mb-2 ${plan.popular ? 'text-white' : 'text-boho-coffee'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.popular ? 'text-boho-sand' : 'text-boho-brown'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className={`text-4xl font-display font-bold ${plan.popular ? 'text-white' : 'text-boho-coffee'}`}>
                    {plan.price}
                  </span>
                  {plan.period && <span className={plan.popular ? 'text-boho-sand' : 'text-boho-brown'}>{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <CheckCircle className={`w-5 h-5 ${plan.popular ? 'text-boho-sage' : 'text-boho-sage'}`} />
                      <span className={plan.popular ? 'text-boho-sand' : 'text-boho-brown'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block w-full py-3 text-center rounded-xl font-medium transition-colors ${
                    plan.popular 
                      ? 'bg-white text-boho-coffee hover:bg-boho-sand' 
                      : 'bg-boho-terracotta text-white hover:bg-boho-coffee'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-boho-terracotta to-boho-coffee rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-display font-bold mb-4">
              Pronto para simplificar sua gestão fiscal?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Junte-se a mais de 500 empresas que já confiam no FISCAL.MZ 
              para gerenciar seus negócios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-boho-coffee rounded-xl font-semibold hover:bg-boho-sand transition-colors"
              >
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Agendar Demonstração
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-boho-coffee text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-boho-terracotta rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-display font-bold">FISCAL.MZ</span>
              </div>
              <p className="text-boho-sand text-sm">
                Simplificando a gestão fiscal para empresas moçambicanas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-boho-sand">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-boho-sand">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-boho-sand">
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Segurança</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-boho-sand">
              © 2024 FISCAL.MZ. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-boho-sand hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-boho-sand hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-boho-sand hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
