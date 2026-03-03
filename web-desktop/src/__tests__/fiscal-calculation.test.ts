import { describe, it, expect } from 'vitest'
import type { LinhaDocumento } from '@/types'

// Função de cálculo fiscal (replicada para testes)
function calculateFiscalTotals(items: LinhaDocumento[]) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0)
  const totalDescontos = items.reduce((sum, item) => {
    const itemSubtotal = item.quantidade * item.precoUnitario
    return sum + (itemSubtotal * (item.descontoPercent / 100))
  }, 0)
  const totalIva = items.reduce((sum, item) => {
    const itemSubtotal = item.quantidade * item.precoUnitario
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
      const items: LinhaDocumento[] = [
        {
          id: '1',
          artigoId: '1',
          descricao: 'Produto A',
          quantidade: 10,
          precoUnitario: 100,
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
      const items: LinhaDocumento[] = [
        {
          id: '1',
          artigoId: '1',
          descricao: 'Produto B',
          quantidade: 10,
          precoUnitario: 100,
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
      const items: LinhaDocumento[] = [
        {
          id: '1',
          artigoId: '1',
          descricao: 'Produto A',
          quantidade: 5,
          precoUnitario: 200,
          descontoPercent: 0,
          ivaPercent: 16,
          totalLinha: 0,
        },
        {
          id: '2',
          artigoId: '2',
          descricao: 'Produto B',
          quantidade: 3,
          precoUnitario: 150,
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
      const items: LinhaDocumento[] = [
        {
          id: '1',
          artigoId: '1',
          descricao: 'Produto C',
          quantidade: 1,
          precoUnitario: 99.99,
          descontoPercent: 0,
          ivaPercent: 16,
          totalLinha: 0,
        },
      ]

      const result = calculateFiscalTotals(items)

      // IVA: 99.99 × 0.16 = 15.9984 → deve arredondar para 16.00
      expect(result.totalIva).toBe(16)
      expect(result.totalGeral).toBe(115.99)
    })
  })

  describe('validateNuit', () => {
    it('deve validar NUIT correto', () => {
      expect(validateNuit('400000001')).toBe(true)
    })

    it('deve rejeitar NUIT com letras', () => {
      expect(validateNuit('40000000A')).toBe(false)
    })

    it('deve rejeitar NUIT com menos de 9 dígitos', () => {
      expect(validateNuit('40000000')).toBe(false)
    })

    it('deve rejeitar NUIT vazio', () => {
      expect(validateNuit('')).toBe(false)
    })
  })
})
