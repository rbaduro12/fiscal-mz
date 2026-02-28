import { createFileRoute } from '@tanstack/react-router'
import { Building2, User, Bell, Shield, CreditCard } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { useState } from 'react'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fm-primary">Configurações</h1>
        <p className="text-fm-muted mt-1">Gerencie as configurações da sua empresa</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <nav className="space-y-1">
            <SettingsTab
              label="Empresa"
              icon={<Building2 size={18} />}
              active={activeTab === 'company'}
              onClick={() => setActiveTab('company')}
            />
            <SettingsTab
              label="Perfil"
              icon={<User size={18} />}
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            />
            <SettingsTab
              label="Notificações"
              icon={<Bell size={18} />}
              active={activeTab === 'notifications'}
              onClick={() => setActiveTab('notifications')}
            />
            <SettingsTab
              label="Configurações Fiscais"
              icon={<Shield size={18} />}
              active={activeTab === 'fiscal'}
              onClick={() => setActiveTab('fiscal')}
            />
            <SettingsTab
              label="Métodos de Pagamento"
              icon={<CreditCard size={18} />}
              active={activeTab === 'payment'}
              onClick={() => setActiveTab('payment')}
            />
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'company' && <CompanySettings />}
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'fiscal' && <FiscalSettings />}
          {activeTab === 'payment' && <PaymentSettings />}
        </div>
      </div>
    </div>
  )
}

function SettingsTab({ label, icon, active, onClick }: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
        active
          ? 'bg-fm-accent/10 text-fm-accent'
          : 'text-fm-muted hover:text-fm-primary hover:bg-fm-tertiary'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  )
}

function CompanySettings() {
  return (
    <FiscalCard>
      <h2 className="text-lg font-semibold mb-6">Dados da Empresa</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-fm-muted block mb-2">Razão Social</label>
          <input
            type="text"
            defaultValue="FISCAL.MZ Lda."
            className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-fm-muted block mb-2">Nome Comercial</label>
          <input
            type="text"
            defaultValue="FISCAL.MZ"
            className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-fm-muted block mb-2">NUIT</label>
          <input
            type="text"
            defaultValue="123456789"
            className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-fm-muted block mb-2">Registro Comercial</label>
          <input
            type="text"
            defaultValue="12345/2020"
            className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm text-fm-muted block mb-2">Endereço</label>
          <input
            type="text"
            defaultValue="Av. 25 de Setembro, 1234, Maputo"
            className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-fm-muted block mb-2">Telefone</label>
          <input
            type="tel"
            defaultValue="+258 21 123 456"
            className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-fm-muted block mb-2">Email</label>
          <input
            type="email"
            defaultValue="info@fiscal.mz"
            className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button className="px-6 py-3 border border-fm-default hover:border-fm-muted text-fm-muted rounded-lg font-medium transition-colors">
          Cancelar
        </button>
        <button className="px-6 py-3 bg-fm-accent hover:bg-fm-accent/80 text-white rounded-lg font-medium transition-colors">
          Salvar Alterações
        </button>
      </div>
    </FiscalCard>
  )
}

function ProfileSettings() {
  return (
    <FiscalCard>
      <h2 className="text-lg font-semibold mb-6">Perfil do Usuário</h2>
      <div className="flex items-center gap-6 mb-6">
        <div className="w-20 h-20 rounded-full bg-fm-accent flex items-center justify-center text-2xl font-bold text-white">
          JD
        </div>
        <div>
          <h3 className="text-lg font-medium text-fm-primary">João da Silva</h3>
          <p className="text-fm-muted">Administrador</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-fm-muted block mb-2">Nome Completo</label>
          <input
            type="text"
            defaultValue="João da Silva"
            className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-fm-muted block mb-2">Email</label>
          <input
            type="email"
            defaultValue="joao@fiscal.mz"
            className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-fm-muted block mb-2">Telefone</label>
          <input
            type="tel"
            defaultValue="+258 84 123 4567"
            className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-fm-muted block mb-2">Idioma</label>
          <select className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none">
            <option value="pt">Português</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </FiscalCard>
  )
}

function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailQuote: true,
    emailPayment: true,
    pushQuote: true,
    pushPayment: false,
    weeklyReport: true,
  })

  return (
    <FiscalCard>
      <h2 className="text-lg font-semibold mb-6">Notificações</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-fm-primary font-medium mb-4">Email</h3>
          <div className="space-y-3">
            <Toggle
              label="Nova cotação recebida"
              checked={settings.emailQuote}
              onChange={() => setSettings({ ...settings, emailQuote: !settings.emailQuote })}
            />
            <Toggle
              label="Pagamento confirmado"
              checked={settings.emailPayment}
              onChange={() => setSettings({ ...settings, emailPayment: !settings.emailPayment })}
            />
            <Toggle
              label="Relatório semanal"
              checked={settings.weeklyReport}
              onChange={() => setSettings({ ...settings, weeklyReport: !settings.weeklyReport })}
            />
          </div>
        </div>

        <div className="border-t border-fm-default pt-6">
          <h3 className="text-fm-primary font-medium mb-4">Push</h3>
          <div className="space-y-3">
            <Toggle
              label="Nova cotação recebida"
              checked={settings.pushQuote}
              onChange={() => setSettings({ ...settings, pushQuote: !settings.pushQuote })}
            />
            <Toggle
              label="Pagamento confirmado"
              checked={settings.pushPayment}
              onChange={() => setSettings({ ...settings, pushPayment: !settings.pushPayment })}
            />
          </div>
        </div>
      </div>
    </FiscalCard>
  )
}

function FiscalSettings() {
  return (
    <FiscalCard>
      <h2 className="text-lg font-semibold mb-6">Configurações Fiscais</h2>
      <div className="space-y-6">
        <div>
          <label className="text-sm text-fm-muted block mb-2">Regime de IVA</label>
          <select className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none">
            <option value="simplified">Regime Simplificado</option>
            <option value="general">Regime Geral</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-fm-muted block mb-2">Taxa de IVA Padrão (%)</label>
          <input
            type="number"
            defaultValue="14"
            className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
          />
        </div>

        <div>
          <label className="text-sm text-fm-muted block mb-2">Série de Documentos</label>
            <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Faturas (FT)"
              defaultValue="2024"
              className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
            />
            <input
              type="text"
              placeholder="Factura-Recibo (FR)"
              defaultValue="2024"
              className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
            />
          </div>
        </div>

        <div className="p-4 bg-fm-primary rounded-lg">
          <h3 className="text-fm-primary font-medium mb-2">Certificação Software</h3>
          <p className="text-sm text-fm-muted mb-3">Número de certificação atribuído pela AGT</p>
          <input
            type="text"
            defaultValue="1234/2020"
            className="w-full px-4 py-3 bg-fm-secondary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
          />
        </div>
      </div>
    </FiscalCard>
  )
}

function PaymentSettings() {
  return (
    <FiscalCard>
      <h2 className="text-lg font-semibold mb-6">Métodos de Pagamento</h2>
      <div className="space-y-4">
        <PaymentMethodConfig
          name="M-Pesa"
          description="Pagamentos via M-Pesa"
          enabled={true}
          config={[
            { label: 'API Key', value: '••••••••' },
            { label: 'Merchant ID', value: 'MP123456' },
          ]}
        />
        <PaymentMethodConfig
          name="Numerário"
          description="Pagamentos em dinheiro"
          enabled={true}
        />
        <PaymentMethodConfig
          name="Cartão"
          description="Cartões de crédito/débito"
          enabled={false}
          config={[
            { label: 'Terminal ID', value: 'T123456' },
          ]}
        />
        <PaymentMethodConfig
          name="Escrow"
          description="Pagamento condicional"
          enabled={true}
        />
      </div>
    </FiscalCard>
  )
}

function PaymentMethodConfig({ name, description, enabled, config }: {
  name: string
  description: string
  enabled: boolean
  config?: { label: string; value: string }[]
}) {
  return (
    <div className="p-4 bg-fm-primary rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-fm-primary font-medium">{name}</h3>
          <p className="text-sm text-fm-muted">{description}</p>
        </div>
        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${enabled ? 'bg-[#10B981]' : 'bg-fm-default'}`}>
          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : ''}`} />
        </div>
      </div>
      {config && (
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-fm-default">
          {config.map((item, i) => (
            <div key={i}>
              <label className="text-xs text-fm-muted">{item.label}</label>
              <p className="text-fm-primary font-mono">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-fm-primary">{label}</span>
      <div
        onClick={onChange}
        className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-fm-accent' : 'bg-fm-default'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : ''}`} />
      </div>
    </label>
  )
}
