import { useState, useMemo } from 'react'
import { Search, User, X, Building2 } from 'lucide-react'
import type { Entidade } from '@/types'

interface ClienteSelectorProps {
  clientes: Entidade[]
  clienteSelecionado?: Entidade | null
  onSelect: (cliente: Entidade) => void
  onClear: () => void
  disabled?: boolean
}

export function ClienteSelector({
  clientes,
  clienteSelecionado,
  onSelect,
  onClear,
  disabled,
}: ClienteSelectorProps) {
  const [busca, setBusca] = useState('')
  const [mostrarLista, setMostrarLista] = useState(false)

  const clientesFiltrados = useMemo(() => {
    if (!busca) return clientes.slice(0, 10)
    return clientes
      .filter(
        (c) =>
          c.nome.toLowerCase().includes(busca.toLowerCase()) ||
          c.nuit?.includes(busca)
      )
      .slice(0, 10)
  }, [clientes, busca])

  if (clienteSelecionado) {
    return (
      <div className="p-4 bg-boho-sand/30 rounded-lg border border-boho-beige">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-boho-accent/10 rounded-full flex items-center justify-center">
              <Building2 size={24} className="text-boho-accent" />
            </div>
            <div>
              <p className="font-semibold text-boho-coffee">{clienteSelecionado.nome}</p>
              <p className="text-sm text-boho-brown">NUIT: {clienteSelecionado.nuit}</p>
              {clienteSelecionado.email && (
                <p className="text-sm text-boho-taupe">{clienteSelecionado.email}</p>
              )}
            </div>
          </div>
          {!disabled && (
            <button
              onClick={onClear}
              className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-boho-taupe" size={20} />
        <input
          type="text"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value)
            setMostrarLista(true)
          }}
          onFocus={() => setMostrarLista(true)}
          placeholder="Buscar cliente por nome ou NUIT..."
          disabled={disabled}
          className="w-full pl-10 pr-4 py-3 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-accent/50 disabled:opacity-50"
        />
      </div>

      {mostrarLista && clientesFiltrados.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-boho-beige rounded-lg shadow-lg max-h-64 overflow-auto">
          {clientesFiltrados.map((cliente) => (
            <button
              key={cliente.id}
              onClick={() => {
                onSelect(cliente)
                setBusca('')
                setMostrarLista(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-boho-sand border-b border-boho-beige last:border-0 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-boho-accent/10 rounded-full flex items-center justify-center">
                  <User size={16} className="text-boho-accent" />
                </div>
                <div>
                  <p className="font-medium text-boho-coffee">{cliente.nome}</p>
                  <p className="text-sm text-boho-brown">NUIT: {cliente.nuit}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {busca && clientesFiltrados.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-boho-beige rounded-lg shadow-lg p-4 text-center">
          <p className="text-boho-brown">Nenhum cliente encontrado.</p>
        </div>
      )}

      {/* Overlay para fechar ao clicar fora */}
      {mostrarLista && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setMostrarLista(false)}
        />
      )}
    </div>
  )
}
