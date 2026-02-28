import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { FiscalCard } from '@/components/ui/fiscal-card'
import { useState } from 'react'

export const Route = createFileRoute('/quotes/new')({
  component: NewQuotePage,
})

function NewQuotePage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([{ description: '', qty: 1, price: 0 }])
  const [client, setClient] = useState({ name: '', nuit: '', email: '', phone: '' })

  const addItem = () => {
    setItems([...items, { description: '', qty: 1, price: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0)

  const handleSubmit = () => {
    console.log('Creating quote:', { client, items })
    navigate({ to: '/quotes' })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/quotes" className="p-2 hover:bg-fm-tertiary rounded-lg text-fm-muted">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-fm-primary">Nova Cotação</h1>
          <p className="text-fm-muted mt-1">Crie uma nova cotação para seu cliente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info */}
          <FiscalCard>
            <h2 className="text-lg font-semibold mb-4">Dados do Cliente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-fm-muted block mb-2">Nome do Cliente *</label>
                <input
                  type="text"
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                  placeholder="Ex: ABC Lda."
                  className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-fm-muted block mb-2">NUIT</label>
                <input
                  type="text"
                  value={client.nuit}
                  onChange={(e) => setClient({ ...client, nuit: e.target.value })}
                  placeholder="Ex: 123456789"
                  className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-fm-muted block mb-2">Email</label>
                <input
                  type="email"
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                  placeholder="cliente@email.com"
                  className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-fm-muted block mb-2">Telefone</label>
                <input
                  type="tel"
                  value={client.phone}
                  onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  placeholder="+258 84 123 4567"
                  className="w-full px-4 py-3 bg-fm-primary border border-fm-default rounded-lg text-fm-primary focus:border-fm-accent outline-none"
                />
              </div>
            </div>
          </FiscalCard>

          {/* Items */}
          <FiscalCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Itens</h2>
              <button
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-fm-accent hover:bg-[#4F5BC0] text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                Adicionar Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-fm-primary rounded-lg">
                  <div className="flex-1">
                    <label className="text-xs text-fm-muted block mb-1">Descrição</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Descrição do serviço ou produto"
                      className="w-full px-3 py-2 bg-fm-secondary border border-fm-default rounded text-fm-primary focus:border-fm-accent outline-none"
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-xs text-fm-muted block mb-1">Qtd</label>
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-fm-secondary border border-fm-default rounded text-fm-primary text-center focus:border-fm-accent outline-none"
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-xs text-fm-muted block mb-1">Preço (MZN)</label>
                    <input
                      type="number"
                      min={0}
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-fm-secondary border border-fm-default rounded text-fm-primary text-right focus:border-fm-accent outline-none"
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-xs text-fm-muted block mb-1">Total</label>
                    <div className="px-3 py-2 bg-fm-secondary rounded text-fm-primary text-right font-mono">
                      MZN {(item.qty * item.price).toLocaleString('pt-MZ')}
                    </div>
                  </div>
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="mt-6 p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </FiscalCard>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <FiscalCard className="sticky top-8">
            <h2 className="text-lg font-semibold mb-4">Resumo</h2>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-fm-default">
                <span className="text-fm-muted">Subtotal</span>
                <span className="font-mono text-fm-primary">MZN {total.toLocaleString('pt-MZ')}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-fm-default">
                <span className="text-fm-muted">IVA (0%)</span>
                <span className="font-mono text-fm-primary">MZN 0</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-fm-primary font-medium">Total</span>
                <span className="font-mono text-2xl font-bold text-fm-accent">
                  MZN {total.toLocaleString('pt-MZ')}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleSubmit}
                className="w-full py-3 px-4 bg-fm-accent hover:bg-[#4F5BC0] text-white rounded-lg font-medium transition-colors"
              >
                Criar Cotação
              </button>
              <Link
                to="/quotes"
                className="block w-full py-3 px-4 text-center border border-fm-default hover:border-fm-muted text-fm-muted rounded-lg font-medium transition-colors"
              >
                Cancelar
              </Link>
            </div>
          </FiscalCard>
        </div>
      </div>
    </div>
  )
}
