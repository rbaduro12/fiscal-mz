import { createFileRoute } from '@tanstack/react-router'
import { Camera, Mail, Phone, Building2, MapPin, FileText, CreditCard, Save } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useState } from 'react'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.companyName || '',
    companyAddress: user?.companyAddress || '',
    nuit: user?.nuit || '',
  })

  const handleSave = () => {
    // Aqui iria a chamada API para salvar
    setIsEditing(false)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-boho-coffee mb-1">
          Meu Perfil
        </h1>
        <p className="text-boho-brown">
          Gerencie suas informações pessoais e da empresa
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-boho border border-boho-beige text-center">
            <div className="relative inline-block mb-4">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=C67B5C&color=fff`}
                alt={user?.name}
                className="w-32 h-32 rounded-2xl border-4 border-boho-beige mx-auto"
              />
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-xl flex items-center justify-center shadow-lg transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="font-display font-semibold text-xl text-boho-coffee mb-1">
              {user?.name}
            </h2>
            <p className="text-boho-brown text-sm mb-4">{user?.email}</p>
            
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
              user?.role === 'ADMIN' 
                ? 'bg-boho-terracotta/10 text-boho-terracotta' 
                : 'bg-boho-sage/10 text-boho-sage'
            }`}>
              {user?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
            </span>

            <div className="mt-6 pt-6 border-t border-boho-beige">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-boho-sand/50 rounded-xl">
                  <FileText className="w-5 h-5 text-boho-terracotta mx-auto mb-1" />
                  <p className="text-2xl font-bold text-boho-coffee">8</p>
                  <p className="text-xs text-boho-taupe">Cotações</p>
                </div>
                <div className="p-3 bg-boho-sand/50 rounded-xl">
                  <CreditCard className="w-5 h-5 text-boho-sage mx-auto mb-1" />
                  <p className="text-2xl font-bold text-boho-coffee">5</p>
                  <p className="text-xs text-boho-taupe">Pagamentos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-8 shadow-boho border border-boho-beige">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-xl text-boho-coffee">
                Informações Pessoais
              </h3>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-boho-terracotta hover:bg-boho-coffee text-white rounded-lg font-medium transition-colors"
                >
                  Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-boho-stone hover:border-boho-terracotta text-boho-brown rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-4 py-2 bg-boho-sage hover:bg-boho-olive text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Salvar
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-boho-coffee mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta disabled:bg-boho-sand/50 disabled:cursor-not-allowed transition-colors"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-boho-coffee mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta disabled:bg-boho-sand/50 disabled:cursor-not-allowed transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-boho-coffee mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta disabled:bg-boho-sand/50 disabled:cursor-not-allowed transition-colors"
                  />
                </div>
              </div>

              {/* NUIT */}
              <div>
                <label className="block text-sm font-medium text-boho-coffee mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  NUIT
                </label>
                <input
                  type="text"
                  value={formData.nuit}
                  onChange={(e) => setFormData({...formData, nuit: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta disabled:bg-boho-sand/50 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              {/* Company */}
              <div className="border-t border-boho-beige pt-6">
                <h4 className="font-display font-semibold text-lg text-boho-coffee mb-4">
                  Dados da Empresa
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-boho-coffee mb-2">
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta disabled:bg-boho-sand/50 disabled:cursor-not-allowed transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-boho-coffee mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Endereço
                    </label>
                    <textarea
                      value={formData.companyAddress}
                      onChange={(e) => setFormData({...formData, companyAddress: e.target.value})}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta disabled:bg-boho-sand/50 disabled:cursor-not-allowed transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl p-8 shadow-boho border border-boho-beige mt-6">
            <h3 className="font-display font-semibold text-xl text-boho-coffee mb-6">
              Alterar Senha
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-boho-coffee mb-2">
                  Senha Atual
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-boho-coffee mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-boho-coffee mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-boho-cream border border-boho-beige rounded-xl text-boho-coffee focus:outline-none focus:border-boho-terracotta transition-colors"
                  />
                </div>
              </div>
              <button className="px-6 py-3 bg-boho-coffee hover:bg-boho-brown text-white rounded-xl font-medium transition-colors">
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
