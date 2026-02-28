# FISCAL.MZ 2.0 - Web Desktop

Aplicação web moderna para gestão fiscal e B2B Marketplace.

---

## 🚀 Stack Tecnológico

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.2+ | UI Library |
| Vite | 5.0+ | Build Tool |
| TypeScript | 5.3+ | Type Safety |
| TanStack Query | 5.18+ | Server State |
| TanStack Router | 1.15+ | Routing |
| Zustand | 4.5+ | Client State |
| Radix UI | Latest | Primitives |
| Tailwind CSS | 3.4+ | Styling |
| Framer Motion | Latest | Animations |

---

## 📁 Estrutura de Pastas (Feature-Based)

```
src/
├── features/
│   ├── negotiation/          # Módulo de cotações
│   │   ├── components/       # NegotiationTimeline, etc
│   │   ├── hooks/            # useQuoteWorkflow
│   │   └── types/
│   ├── payment/              # Módulo de pagamentos
│   │   ├── components/       # PaymentModal
│   │   ├── hooks/            # usePayment
│   │   └── types/
│   ├── fiscal/               # Módulo fiscal
│   │   ├── components/       # FiscalValidator
│   │   ├── hooks/            # useFiscalValidation
│   │   └── types/
│   └── workspace/            # Layout e navegação
├── components/ui/            # Componentes genéricos
├── hooks/                    # Hooks globais
├── lib/                      # Configurações (Query, API)
├── stores/                   # Zustand stores
├── types/                    # Types TypeScript
└── __tests__/                # Testes Vitest
```

---

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview

# Executar testes
npm test

# Executar testes com UI
npm run test:ui
```

---

## 🎯 Componentes Principais

### 1. NegotiationTimeline

Timeline visual do workflow de negociação com:
- Status animados (pulse)
- Histórico de eventos
- Ações contextuais (Aceitar, Rejeitar, Contra-propor)
- Preview de itens com totais

```tsx
import { NegotiationTimeline } from '@/features/negotiation/components/negotiation-timeline'

<NegotiationTimeline 
  quote={quote}
  isBuyer={true}
  onAccept={handleAccept}
  onReject={handleReject}
  onCounterOffer={handleCounterOffer}
/>
```

### 2. PaymentModal

Wizard de pagamento em 4 passos:
- Seleção de método (M-Pesa, Cash, Escrow)
- Confirmação com resumo
- Processamento com animação
- Sucesso/erro

```tsx
import { PaymentModal } from '@/features/payment/components/payment-modal'

<PaymentModal
  isOpen={isOpen}
  onClose={handleClose}
  proforma={proforma}
/>
```

### 3. FiscalValidator

Validação fiscal em tempo real:
- Cálculo de IVA
- Validação de NIF/NUIT
- Preview de QR Code
- Alertas de série fiscal

```tsx
import { FiscalValidator } from '@/features/fiscal/components/fiscal-validator'

<FiscalValidator
  cliente={cliente}
  itens={itens}
  onValidationChange={handleValidation}
  showPreview={true}
/>
```

---

## 🎣 Hooks Customizados

### useQuoteWorkflow

```tsx
const {
  quote,
  isLoading,
  acceptQuote,
  rejectQuote,
  counterOffer,
  isAccepting,
} = useQuoteWorkflow(quoteId)
```

### usePayment

```tsx
const {
  payment,
  paymentStatus,
  initiatePayment,
  confirmCashReceipt,
  isInitiating,
} = usePayment(proformaId)
```

### useFiscalValidation

```tsx
const {
  validate,
  isValidating,
  validationResult,
  calculateTotals,
  validateNuit,
} = useFiscalValidation()
```

---

## 📱 PWA - Offline Support

### Service Worker

Configurado via `vite-plugin-pwa` com:
- Cache estratégico (NetworkFirst para API)
- Background sync para ações pendentes
- Offline fallback

### IndexedDB Queue

Ações offline são armazenadas e sincronizadas automaticamente:

```typescript
// Quando usuário tenta emitir FT offline
if (!isOnline()) {
  await offlineQueue.add({
    type: 'EMIT_INVOICE',
    payload: { clienteId, itens },
  })
  showToast('Ação salva. Será sincronizada quando online.')
}
```

---

## ⚡ Performance

### Code Splitting

Chunks separados por feature:
```javascript
// vite.config.ts
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'query': ['@tanstack/react-query'],
  'charts': ['recharts'],
  'pdf': ['jspdf', 'react-pdf'],
}
```

### React Query Config

- `staleTime`: 5 minutos
- `gcTime`: 10 minutos
- Retry com backoff exponencial
- Refetch on reconnect

### Virtualização

Listas longas usam `react-window` para renderização eficiente.

---

## 🧪 Testes

### Vitest + Testing Library

```bash
# Executar testes
npm test

# Com coverage
npm run coverage
```

### Exemplo de Teste

```typescript
import { describe, it, expect } from 'vitest'
import { calculateFiscalTotals } from '@/utils/fiscal'

describe('Cálculo Fiscal', () => {
  it('deve calcular IVA corretamente', () => {
    const items = [{
      quantidade: 10,
      precoUnit: 100,
      descontoPercent: 0,
      ivaPercent: 16,
    }]
    
    const result = calculateFiscalTotals(items)
    
    expect(result.subtotal).toBe(1000)
    expect(result.totalIva).toBe(160)
    expect(result.totalGeral).toBe(1160)
  })
})
```

---

## 📚 Documentação API

Acesse `/api/docs` no backend para documentação Swagger completa.

---

## 🎨 Design System

Cores do FISCAL.MZ:
- Primary: `#5E6AD2` (Indigo)
- Background: `#0F1115` (Dark)
- Success: `#10B981` (Emerald)
- Warning: `#F59E0B` (Amber)
- Error: `#EF4444` (Red)

---

## 🔐 Variáveis de Ambiente

```bash
VITE_API_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000
VITE_APP_NAME=FISCAL.MZ
```

---

## 📦 Build para Produção

```bash
npm run build

# Saída em dist/
# - index.html
# - assets/ (JS, CSS)
# - manifest.json (PWA)
# - sw.js (Service Worker)
```
