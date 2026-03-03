import { useState, useMemo } from 'react'
import { Search, Plus, Trash2 } from 'lucide-react'
import type { Artigo } from '@/types'

export interface ItemCotacao {
  id?: string
  artigoId?: string
  codigo?: string
  descricao: string
  quantidade: number
  precoUnitario: number
  desconto: number
  taxaIva: number
}

interface ItemSelectorProps {
  artigos: Artigo[]
  itens: ItemCotacao[]
  onChange: (itens: ItemCotacao[]) => void
  disabled?: boolean
}

export function ItemSelector({ artigos, itens, onChange, disabled }: ItemSelectorProps) {
  const [busca, setBusca] = useState('')
  const [mostrarLista, setMostrarLista] = useState<number | null>(null)

  const artigosFiltrados = useMemo(() => {
    if (!busca) return artigos.slice(0, 10)
    return artigos
      .filter(
        (a) =>
          a.descricao.toLowerCase().includes(busca.toLowerCase()) ||
          a.codigo.toLowerCase().includes(busca.toLowerCase())
      )
      .slice(0, 10)
  }, [artigos, busca])

  const addItem = () => {
    onChange([
      ...itens,
      { descricao: '', quantidade: 1, precoUnitario: 0, desconto: 0, taxaIva: 16 },
    ])
  }

  const removeItem = (index: number) => {
    if (itens.length > 1) {
      onChange(itens.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof ItemCotacao, value: any) => {
    const newItens = [...itens]
    newItens[index] = { ...newItens[index], [field]: value }
    onChange(newItens)
  }

  const selecionarArtigo = (index: number, artigo: Artigo) => {
    const newItens = [...itens]
    newItens[index] = {
      ...newItens[index],
      artigoId: artigo.id,
      codigo: artigo.codigo,
      descricao: artigo.descricao,
      precoUnitario: artigo.precoUnitario,
      taxaIva: artigo.ivaPercent || 16,
    }
    onChange(newItens)
    setBusca('')
    setMostrarLista(null)
  }

  const calcularTotalLinha = (item: ItemCotacao) => {
    const valor = item.quantidade * item.precoUnitario * (1 - item.desconto / 100)
    return valor * (1 + item.taxaIva / 100)
  }

  return (
    <div className="space-y-4">
      {itens.map((item, index) => (
        <div
          key={index}
          className="p-4 bg-white border border-boho-beige rounded-lg space-y-3"
        >
          {/* Busca de artigo */}
          {!item.artigoId && (
            <div className="relative">
              <div className="flex items-center gap-2">
                <Search size={18} className="text-boho-taupe" />
                <input
                  type="text"
                  value={mostrarLista === index ? busca : ''}
                  onChange={(e) => {
                    setBusca(e.target.value)
                    setMostrarLista(index)
                  }}
                  onFocus={() => setMostrarLista(index)}
                  placeholder="Buscar artigo..."
                  disabled={disabled}
                  className="flex-1 px-3 py-2 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee placeholder:text-boho-taupe focus:outline-none focus:ring-2 focus:ring-boho-accent/50"
                />
              </div>

              {mostrarLista === index && artigosFiltrados.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-boho-beige rounded-lg shadow-lg max-h-48 overflow-auto">
                  {artigosFiltrados.map((artigo) => (
                    <button
                      key={artigo.id}
                      onClick={() => selecionarArtigo(index, artigo)}
                      className="w-full px-4 py-2 text-left hover:bg-boho-sand border-b border-boho-beige last:border-0 transition-colors"
                    >
                      <p className="font-medium text-boho-coffee">{artigo.descricao}</p>
                      <p className="text-sm text-boho-brown">
                        {artigo.codigo} • MZN {artigo.precoUnitario.toLocaleString('pt-MZ')} • IVA {artigo.ivaPercent}%
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Campos do item */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-6">
              <label className="text-xs text-boho-brown block mb-1">Descrição *</label>
              <input
                type="text"
                value={item.descricao}
                onChange={(e) => updateItem(index, 'descricao', e.target.value)}
                disabled={disabled}
                placeholder="Descrição do item"
                className="w-full px-3 py-2 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50 disabled:opacity-50"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-boho-brown block mb-1">Qtd *</label>
              <input
                type="number"
                min={1}
                value={item.quantidade}
                onChange={(e) => updateItem(index, 'quantidade', parseInt(e.target.value) || 1)}
                disabled={disabled}
                className="w-full px-3 py-2 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee text-center focus:outline-none focus:ring-2 focus:ring-boho-accent/50 disabled:opacity-50"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-boho-brown block mb-1">Preço *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={item.precoUnitario}
                onChange={(e) => updateItem(index, 'precoUnitario', parseFloat(e.target.value) || 0)}
                disabled={disabled}
                className="w-full px-3 py-2 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee text-right focus:outline-none focus:ring-2 focus:ring-boho-accent/50 disabled:opacity-50"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-boho-brown block mb-1">IVA %</label>
              <select
                value={item.taxaIva}
                onChange={(e) => updateItem(index, 'taxaIva', Number(e.target.value))}
                disabled={disabled}
                className="w-full px-3 py-2 bg-boho-cream border border-boho-beige rounded-lg text-boho-coffee focus:outline-none focus:ring-2 focus:ring-boho-accent/50 disabled:opacity-50"
              >
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={10}>10%</option>
                <option value={16}>16%</option>
              </select>
            </div>
          </div>

          {/* Desconto e Total */}
          <div className="flex items-center justify-between pt-2 border-t border-boho-beige/50">
            <div className="flex items-center gap-2">
              <label className="text-xs text-boho-brown">Desconto %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={item.desconto}
                onChange={(e) => updateItem(index, 'desconto', parseFloat(e.target.value) || 0)}
                disabled={disabled}
                className="w-20 px-2 py-1 bg-boho-cream border border-boho-beige rounded text-boho-coffee text-right text-sm focus:outline-none focus:ring-2 focus:ring-boho-accent/50 disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-boho-brown">
                Total:{' '}
                <span className="font-mono font-medium text-boho-coffee">
                  MZN {calcularTotalLinha(item).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                </span>
              </span>
              {itens.length > 1 && !disabled && (
                <button
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Botão adicionar */}
      {!disabled && (
        <button
          onClick={addItem}
          className="w-full py-3 px-4 border-2 border-dashed border-boho-beige hover:border-boho-accent text-boho-brown hover:text-boho-accent rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Adicionar Item
        </button>
      )}
    </div>
  )
}
