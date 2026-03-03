import { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck, ExternalLink, Package, FileText, CreditCard, AlertTriangle, Info } from 'lucide-react'
import { useNotificacoesWebSocket, useNotificacoes, TipoNotificacao } from '@/hooks/use-notificacoes'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

const iconesPorTipo: Record<TipoNotificacao, React.ReactNode> = {
  COTACAO_RECEBIDA: <FileText className="w-5 h-5 text-blue-500" />,
  COTACAO_ACEITE: <Check className="w-5 h-5 text-green-500" />,
  COTACAO_REJEITADA: <AlertTriangle className="w-5 h-5 text-red-500" />,
  PROFORMA_EMITIDA: <FileText className="w-5 h-5 text-purple-500" />,
  PAGAMENTO_CONFIRMADO: <CreditCard className="w-5 h-5 text-green-500" />,
  FACTURA_EMITIDA: <FileText className="w-5 h-5 text-boho-terracotta" />,
  STOCK_BAIXO: <Package className="w-5 h-5 text-orange-500" />,
  DOCUMENTO_VENCIDO: <AlertTriangle className="w-5 h-5 text-red-500" />,
  SISTEMA: <Info className="w-5 h-5 text-blue-500" />,
}

const coresPorTipo: Record<TipoNotificacao, string> = {
  COTACAO_RECEBIDA: 'bg-blue-50 border-blue-200',
  COTACAO_ACEITE: 'bg-green-50 border-green-200',
  COTACAO_REJEITADA: 'bg-red-50 border-red-200',
  PROFORMA_EMITIDA: 'bg-purple-50 border-purple-200',
  PAGAMENTO_CONFIRMADO: 'bg-green-50 border-green-200',
  FACTURA_EMITIDA: 'bg-orange-50 border-orange-200',
  STOCK_BAIXO: 'bg-orange-50 border-orange-200',
  DOCUMENTO_VENCIDO: 'bg-red-50 border-red-200',
  SISTEMA: 'bg-blue-50 border-blue-200',
}

export function NotificacoesDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  
  const { 
    connected, 
    contador, 
    notificacoesNaoLidas,
    marcarComoLida,
    marcarTodasComoLidas 
  } = useNotificacoesWebSocket()
  
  const { data: todasNotificacoes } = useNotificacoes({ limite: 20 })
  
  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleMarcarComoLida = async (id: string) => {
    try {
      await api.post(`/notificacoes/${id}/lida`)
      marcarComoLida(id)
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] })
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }
  
  const handleMarcarTodasComoLidas = async () => {
    try {
      await api.post('/notificacoes/marcar-todas-lidas')
      marcarTodasComoLidas()
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] })
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }
  
  const formatarData = (data: string) => {
    const date = new Date(data)
    const agora = new Date()
    const diff = agora.getTime() - date.getTime()
    
    const minutos = Math.floor(diff / 60000)
    const horas = Math.floor(diff / 3600000)
    const dias = Math.floor(diff / 86400000)
    
    if (minutos < 1) return 'Agora'
    if (minutos < 60) return `${minutos}min atrás`
    if (horas < 24) return `${horas}h atrás`
    if (dias < 7) return `${dias}d atrás`
    return date.toLocaleDateString('pt-MZ')
  }
  
  const notificacoes = isOpen ? (todasNotificacoes || notificacoesNaoLidas) : []
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-boho-taupe hover:text-boho-coffee transition-colors rounded-lg hover:bg-boho-sand"
      >
        <Bell size={20} />
        
        {/* Badge de contador */}
        {contador > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {contador > 9 ? '9+' : contador}
          </span>
        )}
        
        {/* Indicador de conexão */}
        <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
          connected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-xl border border-boho-beige z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-boho-beige bg-boho-cream/50">
            <div>
              <h3 className="font-semibold text-boho-coffee">Notificações</h3>
              <p className="text-xs text-boho-brown">
                {connected ? '🟢 Em tempo real' : '🔴 Desconectado'}
              </p>
            </div>
            {contador > 0 && (
              <button
                onClick={handleMarcarTodasComoLidas}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-boho-terracotta hover:bg-boho-terracotta/10 rounded-lg transition-colors"
              >
                <CheckCheck size={16} />
                Marcar todas
              </button>
            )}
          </div>
          
          {/* Lista */}
          <div className="max-h-96 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 text-boho-taupe mx-auto mb-3" />
                <p className="text-boho-brown">Sem notificações</p>
              </div>
            ) : (
              notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`flex gap-3 p-4 border-b border-boho-beige hover:bg-boho-cream/30 transition-colors ${
                    !notificacao.lida ? 'bg-boho-cream/20' : ''
                  } ${coresPorTipo[notificacao.tipo]}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-boho-beige flex items-center justify-center">
                    {iconesPorTipo[notificacao.tipo]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-medium text-boho-coffee text-sm ${
                        !notificacao.lida ? 'font-semibold' : ''
                      }`}>
                        {notificacao.titulo}
                      </h4>
                      <span className="text-xs text-boho-taupe whitespace-nowrap">
                        {formatarData(notificacao.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-boho-brown mt-1 line-clamp-2">
                      {notificacao.mensagem}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {notificacao.acaoUrl && (
                        <a
                          href={notificacao.acaoUrl}
                          className="inline-flex items-center gap-1 text-xs text-boho-terracotta hover:underline"
                          onClick={() => handleMarcarComoLida(notificacao.id)}
                        >
                          {notificacao.acaoTexto || 'Ver'}
                          <ExternalLink size={12} />
                        </a>
                      )}
                      
                      {!notificacao.lida && (
                        <button
                          onClick={() => handleMarcarComoLida(notificacao.id)}
                          className="inline-flex items-center gap-1 text-xs text-boho-taupe hover:text-boho-coffee"
                        >
                          <Check size={12} />
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {!notificacao.lida && (
                    <div className="flex-shrink-0 w-2 h-2 bg-boho-terracotta rounded-full mt-2" />
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-2 border-t border-boho-beige bg-boho-cream/30 text-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-boho-brown hover:text-boho-coffee transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
