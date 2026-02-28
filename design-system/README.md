# FISCAL.MZ 2.0 - Design System

Sistema de design completo para FISCAL.MZ 2.0, inspirado no Linear.app com estética minimalista, dark mode elegante e foco em produtividade.

---

## 📁 Estrutura

```
design-system/
├── tokens.css                    # CSS Variables - Design Tokens
├── tailwind.config.ts            # Tailwind Configuration
├── react-components/
│   ├── NegotiationCard.tsx       # Card de negociação B2B
│   ├── PaymentModal.tsx          # Modal de pagamento
│   └── FiscalBadge.tsx           # Badge de status fiscal
├── flutter-widgets/
│   ├── design_tokens.dart        # Tokens para Flutter
│   ├── negotiation_card.dart     # Card de negociação
│   ├── payment_bottom_sheet.dart # Bottom sheet de pagamento
│   └── fiscal_badge.dart         # Badge fiscal
├── animations/
│   └── animation-specs.md        # Especificações de animação
└── prototipo_figma.md            # Descrição textual para Figma
```

---

## 🎨 Paleta de Cores

### Dark Mode (Padrão)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-bg-primary` | `#0F1115` | Background principal |
| `--color-bg-secondary` | `#161922` | Cards, surfaces elevadas |
| `--color-bg-tertiary` | `#1E2028` | Inputs, hover states |
| `--color-accent-primary` | `#5E6AD2` | Ações principais, botões |
| `--color-accent-secondary` | `#8B5CF6` | Highlights, gradientes |
| `--color-success` | `#10B981` | Pago, sucesso, válido |
| `--color-warning` | `#F59E0B` | Pendente, alerta |
| `--color-error` | `#EF4444` | Erro, inválido, rejeitado |
| `--color-text-primary` | `#F7F8F8` | Texto principal |
| `--color-text-secondary` | `#8B949E` | Texto secundário |
| `--color-text-muted` | `#6E7681` | Labels, placeholders |
| `--color-border` | `#2E3038` | Bordas, divisores |

---

## 🔤 Tipografia

### Fontes

- **Sans-serif**: Inter (UI, conteúdo)
- **Monospace**: JetBrains Mono (números, hashes, códigos)

### Scale

| Nome | Tamanho | Uso |
|------|---------|-----|
| Display | 48px / 600 | Valores monetários grandes |
| Headline | 24px / 600 | Títulos de página |
| Title | 18px / 600 | Cards, headers |
| Body | 15px / 400 | Conteúdo principal |
| Caption | 13px / 500 | Labels, metadata |
| Small | 12px / 400 | Texto auxiliar |

---

## 🧩 Componentes Principais

### 1. NegotiationCard (B2B Workflow)

Card para exibir cotações com timeline visual de estados.

**Props:**
- `status`: RASCUNHO | ENVIADA | NEGOCIANDO | ACEITE | REJEITADA | CONVERTIDA
- `clienteNome`, `totalEstimado`, `itens[]`
- `historico[]`: Trail de negociação
- Callbacks: `onEnviar`, `onAceitar`, `onRejeitar`, `onCounterOffer`

**Features:**
- Status dot com pulse animation
- Timeline de negociação expandível
- Preview de itens
- Ações contextuais por status

---

### 2. PaymentModal / PaymentBottomSheet

Wizard de pagamento com 4 passos.

**Props:**
- `proforma`: Dados da proforma
- `clienteNome`, `tenantNome`
- `onProcessPayment`: Callback assíncrono

**Steps:**
1. **Método**: Seleção entre M-Pesa, EMola, BIM, Cartão, Cash, Escrow
2. **Resumo**: Confirmação com dados do pagamento
3. **Processando**: Loading com animação
4. **Sucesso/Erro**: Feedback final

---

### 3. FiscalBadge

Indicador de status fiscal do documento.

**Variants:**
- `pill`: Badge compacto inline
- `card`: Card completo com detalhes
- `minimal`: Apenas ícone + texto

**Status:**
- `VALIDO`: Verde com glow
- `PENDENTE_SYNC`: Âmbar
- `SYNCING`: Azul com animação
- `ERRO_HASH`: Vermelho
- `VALIDADO_RECENTE`: Verde com pulse especial

---

## ⚡ Animações

### Tokens de Duração

| Token | Valor | Uso |
|-------|-------|-----|
| `duration-fast` | 150ms | Hover, focus |
| `duration-normal` | 200ms | Transições padrão |
| `duration-slow` | 300ms | Modais, expansões |
| `duration-slower` | 500ms | Animações complexas |

### Curvas de Aceleração

| Nome | Valor | Uso |
|------|-------|-----|
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Padrão |
| `ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Entrada com bounce |
| `ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Elasticidade |

### Animações Implementadas

- **Card Hover**: `translateY(-2px)` + shadow
- **Button Press**: `scale(0.98)`
- **Modal Entry**: Scale + fade com bounce
- **Timeline Pulse**: Scale 1.0 → 1.3, infinite
- **Skeleton Shimmer**: Gradient slide, 1.5s
- **Success Check**: Stroke draw, 400ms
- **Spinner**: Rotate 360° + pulse ring

---

## 🚀 Uso

### React + Tailwind

```tsx
import './tokens.css';
import { NegotiationCard } from './react-components/NegotiationCard';

function App() {
  return (
    <div className="bg-background-primary min-h-screen">
      <NegotiationCard
        status="ENVIADA"
        clienteNome="ABC Lda."
        totalEstimado={12500}
        // ...
      />
    </div>
  );
}
```

### Flutter

```dart
import 'design_tokens.dart';
import 'negotiation_card.dart';

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: FmTheme.darkTheme,
      home: Scaffold(
        body: NegotiationCard(
          status: CotacaoStatus.enviada,
          clienteNome: 'ABC Lda.',
          totalEstimado: 12500,
          // ...
        ),
      ),
    );
  }
}
```

---

## 📱 Responsividade

### Breakpoints

| Nome | Largura | Layout |
|------|---------|--------|
| Mobile | < 768px | Stack vertical, bottom nav |
| Tablet | 768px - 1024px | Sidebar colapsada, grid 2 col |
| Desktop | > 1024px | Sidebar expandida, grid 3-4 col |

### Mobile Adaptations

- **Bottom Navigation**: 5 itens (Início, Vender, FAB, Documentos, Perfil)
- **FAB**: Expande para menu com 3 opções
- **Swipe Gestures**: Direita (ações), Esquerda (pagar)
- **Modais**: Full-screen sheets

---

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Cmd/Ctrl + K` | Command Palette |
| `Cmd/Ctrl + N` | Nova Fatura |
| `Cmd/Ctrl + Shift + Q` | Nova Cotação |
| `Cmd/Ctrl + /` | Toggle Sidebar |
| `Esc` | Fechar Modal |

---

## ♿ Acessibilidade

- Todos os componentes suportam `prefers-reduced-motion`
- Foco visível em todos elementos interativos
- Contraste mínimo 4.5:1 para texto
- Labels semânticos para leitores de tela

---

## 📄 Licença

Copyright © 2025 FISCAL.MZ. Todos os direitos reservados.
