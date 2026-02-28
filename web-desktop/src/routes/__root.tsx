import { Outlet, createRootRoute, Link, useNavigate, useLocation } from '@tanstack/react-router'
import { 
  Home, FileText, CreditCard, Settings, Plus, LogOut, 
  LayoutDashboard, Users, Receipt, BarChart3, Bell, User
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useEffect } from 'react'

// Rotas públicas que não requerem autenticação
const PUBLIC_ROUTES = ['/', '/login', '/register']

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const currentPath = location.pathname
  const isPublicRoute = PUBLIC_ROUTES.includes(currentPath)

  // Redirecionar para login se não estiver autenticado e não for rota pública
  useEffect(() => {
    if (!isAuthenticated && !isPublicRoute) {
      navigate({ to: '/login' })
    }
  }, [isAuthenticated, isPublicRoute, navigate])

  // Se for rota pública, renderiza sem o layout de dashboard
  if (isPublicRoute) {
    return <Outlet />
  }

  // Se não estiver autenticado e não for rota pública, não renderiza nada
  if (!isAuthenticated) {
    return null
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="min-h-screen flex bg-boho-cream">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-boho-beige flex flex-col">
        {/* Logo */}
        <div className="p-8 border-b border-boho-beige">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-boho-terracotta to-boho-sage rounded-xl flex items-center justify-center shadow-boho">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-boho-coffee">FISCAL.MZ</h1>
              <p className="text-xs text-boho-brown">{isAdmin ? 'Administração' : 'Portal do Cliente'}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-boho-taupe uppercase tracking-wider mb-4">
            Menu Principal
          </p>
          
          {isAdmin ? (
            <>
              <NavLink to="/admin/dashboard" icon={<Home size={20} />} label="Dashboard" />
              <NavLink to="/clients" icon={<Users size={20} />} label="Clientes" />
              <NavLink to="/quotes" icon={<FileText size={20} />} label="Cotações" />
              <NavLink to="/payments" icon={<CreditCard size={20} />} label="Pagamentos" />
              <NavLink to="/fiscal" icon={<Receipt size={20} />} label="Documentos Fiscais" />
              <NavLink to="/reports" icon={<BarChart3 size={20} />} label="Relatórios" />
            </>
          ) : (
            // Client Navigation
            <>
              <NavLink to="/dashboard" icon={<Home size={20} />} label="Dashboard" />
              <NavLink to="/my-quotes" icon={<FileText size={20} />} label="Minhas Cotações" />
              <NavLink to="/my-payments" icon={<CreditCard size={20} />} label="Meus Pagamentos" />
              <NavLink to="/my-documents" icon={<Receipt size={20} />} label="Meus Documentos" />
            </>
          )}

          <div className="pt-6 mt-6 border-t border-boho-beige">
            <p className="px-4 text-xs font-semibold text-boho-taupe uppercase tracking-wider mb-4">
              Configurações
            </p>
            <NavLink to="/settings" icon={<Settings size={20} />} label="Configurações" />
            <NavLink to="/profile" icon={<User size={20} />} label="Perfil" />
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-boho-beige">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=C67B5C&color=fff`}
              alt={user?.name}
              className="w-12 h-12 rounded-full border-2 border-boho-beige"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-boho-coffee truncate">{user?.name}</p>
              <p className="text-xs text-boho-brown truncate">{user?.email}</p>
            </div>
            <button className="relative p-2 text-boho-taupe hover:text-boho-coffee transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-boho-terracotta rounded-full" />
            </button>
          </div>
          
          {isAdmin && (
            <Link
              to="/quotes/new"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-boho-terracotta to-boho-mustard hover:opacity-90 text-white rounded-xl font-medium transition-all shadow-boho"
            >
              <Plus size={20} />
              Nova Cotação
            </Link>
          )}
          
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full mt-3 py-3 px-4 border border-boho-stone hover:border-boho-terracotta text-boho-brown hover:text-boho-terracotta rounded-xl font-medium transition-all"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-boho-brown hover:text-boho-coffee hover:bg-boho-sand transition-all [&.active]:bg-boho-terracotta/10 [&.active]:text-boho-terracotta font-medium"
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}
