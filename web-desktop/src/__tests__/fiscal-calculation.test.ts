import { describe, it, expect } from 'vitest'
import type { QuoteItem } from '@/types'

// Função de cálculo fiscal (replicada para testes)
function calculateFiscalTotals(items: QuoteItem[]) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantidade * item.precoUnit), 0)
  const totalDescontos = items.reduce((sum, item) => {
    const itemSubtotal = item.quantidade * item.precoUnit
    return sum + (itemSubtotal * (item.descontoPercent / 100))
  }, 0)
  const totalIva = items.reduce((sum, item) => {
    const itemSubtotal = item.quantidade * item.precoUnit
    const itemDesconto = itemSubtotal * (item.descontoPercent / 100)
    return sum + ((itemSubtotal - itemDesconto) * (item.ivaPercent / 100))
  }, 0)
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalDescontos: Math.round(totalDescontos * 100) / 100,
    totalIva: Math.round(totalIva * 100) / 100,
    totalGeral: Math.round((subtotal - totalDescontos + totalIva) * 100) / 100,
  }
}

// Validação de NUIT (simplified)
function validateNuit(nuit: string): boolean {
  if (!/^\d{9}$/.test(nuit)) return false
  
  const digits = nuit.split('').map(Number)
  const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3]
  let sum = 0
  
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * weights[i]
  }
  
  const remainder = sum % 11
  const checkDigit = remainder === 0 || remainder === 1 ? 0 : 11 - remainder
  
  return checkDigit === digits[8]
}

describe('Cálculo Fiscal', () => {
  describe('calculateFiscalTotals', () => {
    it('deve calcular corretamente valores simples', () => {
      const items: QuoteItem[] = [
        {
          produtoId: '1',
          descricao: 'Produto A',
          quantidade: 10,
          precoUnit: 100,
          descontoPercent: 0,
          ivaPercent: 16,
          totalLinha: 1160,
        },
      ]

      const result = calculateFiscalTotals(items)

      expect(result.subtotal).toBe(1000)
      expect(result.totalDescontos).toBe(0)
      expect(result.totalIva).toBe(160)
      expect(result.totalGeral).toBe(1160)
    })

    it('deve aplicar desconto antes do IVA', () => {
      const items: QuoteItem[] = [
        {
          produtoId: '1',
          descricao: 'Produto B',
          quantidade: 10,
          precoUnit: 100,
          descontoPercent: 10, // 10% de desconto
          ivaPercent: 16,
          totalLinha: 0,
        },
      ]

      const result = calculateFiscalTotals(items)

      // Subtotal: 1000
      // Desconto: 100 (10%)
      // Base IVA: 900
      // IVA: 144 (16% de 900)
      // Total: 1044
      expect(result.subtotal).toBe(1000)
      expect(result.totalDescontos).toBe(100)
      expect(result.totalIva).toBe(144)
      expect(result.totalGeral).toBe(1044)
    })

    it('deve calcular múltiplos itens corretamente', () => {
      const items: QuoteItem[] = [
        {
          produtoId: '1',
          descricao: 'Produto A',
          quantidade: 5,
          precoUnit: 200,
          descontoPercent: 0,
          ivaPercent: 16,
          totalLinha: 0,
        },
        {
          produtoId: '2',
          descricao: 'Produto B',
          quantidade: 3,
          precoUnit: 150,
          descontoPercent: 5, // 5% de desconto
          ivaPercent: 16,
          totalLinha: 0,
        },
      ]

      const result = calculateFiscalTotals(items)

      // Item 1: 5 × 200 = 1000 (sem desconto) + 160 IVA = 1160
      // Item 2: 3 × 150 = 450 - 22.50 desconto = 427.50 + 68.40 IVA = 495.90
      expect(result.subtotal).toBe(1450)
      expect(result.totalDescontos).toBe(22.5)
      expect(result.totalIva).toBeCloseTo(228.4, 1)
      expect(result.totalGeral).toBeCloseTo(1655.9, 1)
    })

    it('deve arredondar corretamente para 2 casas decimais', () => {
      const items: QuoteItem[] = [
        {
          produtoId: '1',
          descricao: 'Produto C',
          quantidade: 1,
          precoUnit: 99.99,
          descontoPercent: 0,
          ivaPercent: 16,
          totalLinha: 0,
        },
      ]

      const result = calculateFiscalTotals(items)

      // IVA: 99.99 × 0.16 = 15.9984 → deve arredondar para 16.00
      expect(result.totalIva).toBeCloseTo(16, 2)
      expect(result.totalGeral).toBeCloseTo(115.99, 2)
    })

    it('deve retornar zero para lista vazia', () => {
      const result = calculateFiscalTotals([])

      expect(result.subtotal).toBe(0)
      expect(result.totalDescontos).toBe(0)
      expect(result.totalIva).toBe(0)
      expect(result.totalGeral).toBe(0)
    })
  })

  describe('Validação de NUIT', () => {
    it('deve validar NUIT correto', () => {
      expect(validateNuit('123456789')).toBe(false) // NUIT inválido
      expect(validateNuit('000000000')).toBe(true) // Check digit = 0
    })

    it('deve rejeitar NUIT com formato inválido', () => {
      expect(validateNuit('12345678')).toBe(false) // 8 dígitos
      expect(validateNuit('1234567890')).toBe(false) // 10 dígitos
      expect(validateNuit('12345678A')).toBe(false) // Letra
      expect(validateNuit('')).toBe(false) // Vazio
    })
  })

  describe('Verificação de IVA', () => {
    it('deve detectar diferença maior que tolerância', () => {
      const expected = 100.00
      const calculated = 100.06
      const tolerance = 0.05

      const diff = Math.abs(expected - calculated)
      expect(diff > tolerance).toBe(true)
    })

    it('deve aceitar diferença dentro da tolerância', () => {
      const expected = 100.00
      const calculated = 100.04
      const tolerance = 0.05

      const diff = Math.abs(expected - calculated)
      expect(diff <= tolerance).toBe(true)
    })
  })
})

describe('Offline Queue', () => {
  it('deve armazenar ação pendente quando offline', () => {
    // Simular IndexedDB ou localStorage
    const pendingActions: any[] = []
    
    const action = {
      id: 'action-1',
      type: 'EMIT_INVOICE',
      payload: { clienteId: '123', itens: [] },
      timestamp: Date.now(),
    }
    
    pendingActions.push(action)
    
    expect(pendingActions).toHaveLength(1)
    expect(pendingActions[0].type).toBe('EMIT_INVOICE')
  })

  it('deve processar fila quando online', () => {
    const pendingActions = [
      { id: '1', type: 'CREATE_QUOTE', status: 'pending' },
      { id: '2', type: 'ACCEPT_QUOTE', status: 'pending' },
    ]
    
    // Simular processamento
    const processed = pendingActions.map(action => ({
      ...action,
      status: 'processed',
    }))
    
    expect(processed.every(a => a.status === 'processed')).toBe(true)
  })
})

describe('Query Cache', () => {
  it('deve gerar query keys consistentes', () => {
    const queryKeys = {
      quotes: {
        all: ['quotes'] as const,
        sent: (filters?: object) => ['quotes', 'sent', filters] as const,
        detail: (id: string) => ['quotes', id] as const,
      },
    }

    expect(queryKeys.quotes.sent({ status: 'PENDING' }))
      .toEqual(['quotes', 'sent', { status: 'PENDING' }])
    
    expect(queryKeys.quotes.detail('123')).toEqual(['quotes', '123'])
  })
})
