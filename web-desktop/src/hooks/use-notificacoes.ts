import { useEffect, useRef, useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { io, Socket } from 'socket.io-client'
import { api } from '@/lib/api'
import { queryKeys } from '@/lib/query-client'
import { useAuth } from '@/contexts/auth-context'

// ============================================
// TIPOS
// ============================================

export type TipoNotificacao = 
  | 'COTACAO_RECEBIDA'
  | 'COTACAO_ACEITE'
  | 'COTACAO_REJEITADA'
  | 'PROFORMA_EMITIDA'
  | 'PAGAMENTO_CONFIRMADO'
  | 'FACTURA_EMITIDA'
  | 'STOCK_BAIXO'
  | 'DOCUMENTO_VENCIDO'
  | 'SISTEMA'

export interface Notificacao {
  id: string
  tipo: TipoNotificacao
  titulo: string
  mensagem: string
  lida: boolean
  acaoUrl?: string
  acaoTexto?: string
  documentoId?: string
  createdAt: string
}

// ============================================
// HOOK DE SOCKET.IO
// ============================================

export function useNotificacoesWebSocket() {
  const { user, isAuthenticated } = useAuth()
  const [connected, setConnected] = useState(false)
  const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState<Notificacao[]>([])
  const [contador, setContador] = useState(0)
  const socketRef = useRef<Socket | null>(null)
  const queryClient = useQueryClient()

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return

    const token = localStorage.getItem('access_token')
    if (!token) return

    // Criar conexão Socket.IO
    const socket = io('ws://localhost:3000/notificacoes', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('🔔 Socket.IO conectado')
      setConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('🔔 Socket.IO desconectado')
      setConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão Socket.IO:', error.message)
      setConnected(false)
    })

    // Eventos de notificações
    socket.on('notificacao:nova', (data) => {
      console.log('📨 Nova notificação:', data)
      const novaNotificacao = data.notificacao
      setNotificacoesNaoLidas(prev => [novaNotificacao, ...prev])
      setContador(prev => prev + 1)
      
      // Mostrar notificação do navegador
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(novaNotificacao.titulo, {
          body: novaNotificacao.mensagem,
          icon: '/icon-192x192.png'
        })
      }
      
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] })
    })

    socket.on('notificacoes:contador', (data) => {
      setContador(data.count)
    })

    socket.on('notificacoes:nao-lidas', (data) => {
      setNotificacoesNaoLidas(data.notificacoes || [])
      setContador(data.count || 0)
    })

    socketRef.current = socket
  }, [isAuthenticated, user, queryClient])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }, [])

  const marcarComoLida = useCallback((notificacaoId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('notificacao:marcar-lida', { notificacaoId })
    }
    
    // Atualizar estado local
    setNotificacoesNaoLidas(prev => prev.filter(n => n.id !== notificacaoId))
    setContador(prev => Math.max(0, prev - 1))
  }, [])

  const marcarTodasComoLidas = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('notificacoes:marcar-todas-lidas', {})
    }
    
    setNotificacoesNaoLidas([])
    setContador(0)
  }, [])

  useEffect(() => {
    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    connect()
    
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    connected,
    contador,
    notificacoesNaoLidas,
    marcarComoLida,
    marcarTodasComoLidas
  }
}

// ============================================
// HOOKS DE API REST (fallback)
// ============================================

export function useNotificacoes(options?: { limite?: number; apenasNaoLidas?: boolean }) {
  const { limite = 50, apenasNaoLidas = false } = options || {}
  
  return useQuery({
    queryKey: queryKeys.notificacoes.all({ limite, apenasNaoLidas }),
    queryFn: async (): Promise<Notificacao[]> => {
      const { data } = await api.get('/notificacoes', { 
        params: { limite, apenasNaoLidas } 
      })
      return data || []
    },
  })
}

export function useNotificacoesNaoLidas() {
  return useQuery({
    queryKey: queryKeys.notificacoes.naoLidas(),
    queryFn: async (): Promise<{ count: number; notificacoes: Notificacao[] }> => {
      const { data } = await api.get('/notificacoes/nao-lidas')
      return data || { count: 0, notificacoes: [] }
    },
  })
}
