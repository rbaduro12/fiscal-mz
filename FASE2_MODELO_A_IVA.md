# 🚀 FASE 2 — MODELO A DE IVA & RELATÓRIOS
## Sistema Fiscal Completo para Moçambique

---

## ✅ Funcionalidades Implementadas

### 1. Modelo A de IVA (Declaração Periódica)

**Endpoints:**
```
POST   /fiscal/iva/modelo-a/:ano/:mes      → Gerar declaração
GET    /fiscal/iva/modelo-a/:ano/:mes/xml  → Download XML
GET    /fiscal/iva/declaracoes             → Listar declarações
GET    /fiscal/iva/resumo-atual            → Resumo mês atual
```

### 2. Estrutura do Modelo A (6 Quadros)

```
┌─────────────────────────────────────────────────────┐
│  MODELO A - DECLARAÇÃO PERIÓDICA DE IVA             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  QUADRO 01: Taxa Normal (16%)                       │
│    • Vendas de bens:        [BASE] [IVA]           │
│    • Prestação serviços:    [BASE] [IVA]           │
│    • TOTAL:                 [BASE] [IVA]           │
│                                                     │
│  QUADRO 02: Taxa Intermédia (10%)                   │
│    • Bens:                  [BASE] [IVA]           │
│    • Serviços:              [BASE] [IVA]           │
│                                                     │
│  QUADRO 03: Taxa Reduzida (5%)                      │
│    • Bens:                  [BASE] [IVA]           │
│    • Serviços:              [BASE] [IVA]           │
│                                                     │
│  QUADRO 04: Isentas e Não Sujeitas                 │
│    • Exportações:           [VALOR]                 │
│    • Isentos Art. 15:       [VALOR]                 │
│    • Não sujeitos:          [VALOR]                 │
│                                                     │
│  QUADRO 05: Operações Passivas (Compras)           │
│    • Compras bens 16%:      [BASE] [IVA]           │
│    • Compras serviços 16%:  [BASE] [IVA]           │
│    • Importações:           [BASE] [IVA]           │
│    • Compras 5%:            [BASE] [IVA]           │
│                                                     │
│  QUADRO 06: Apuramento                             │
│    • IVA Liquidado:         [TOTAL]                 │
│    • IVA Dedutível:         [TOTAL]                 │
│    • Diferença:             [VALOR]                 │
│    • Crédito anterior:      [VALOR]                 │
│    • IVA A PAGAR:           [VALOR]  ⬅️             │
│    • Crédito transportar:   [VALOR]                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3. Cálculo Automático do Apuramento

```typescript
// Lógica implementada:

// 1. IVA Liquidado = Soma de todos os IVAs cobrados
ivaLiquidado = q1.totalIva16 + q2.totalIva10 + q3.totalIva5

// 2. IVA Dedutível = Soma dos IVAs pagos em compras
ivaDedutivel = q5.totalIvaDedutivel

// 3. Diferença
 diferenca = ivaLiquidado - ivaDedutivel

// 4. Apuramento final
if (diferenca > 0) {
    // Devemos ao Fisco
    ivaAPagar = diferenca - creditoAnterior
    creditoTransportar = 0
} else {
    // Temos crédito
    ivaAPagar = 0
    creditoTransportar = |diferenca| + creditoAnterior
}
```

---

## 📊 Exemplo de Uso

### Gerar Declaração do Mês Atual

```bash
curl -X GET http://localhost:3000/fiscal/iva/resumo-atual \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta:**
```json
{
  "id": "uuid-da-declaracao",
  "periodoAno": 2025,
  "periodoMes": 2,
  "estado": "RASCUNHO",
  
  "q1VendasBens16": 850000.00,
  "q1VendasBensIva": 136000.00,
  "q1VendasServicos16": 450000.00,
  "q1VendasServicosIva": 72000.00,
  "q1TotalBase16": 1300000.00,
  "q1TotalIva16": 208000.00,
  
  "q3Bens5": 350000.00,
  "q3BensIva5": 17500.00,
  
  "q6IvaLiquidado": 225500.00,
  "q6IvaDedutivel": 85000.00,
  "q6Diferenca": 140500.00,
  "q6CreditoPeriodoAnterior": 0.00,
  "q6IvaAPagar": 140500.00,
  "q6CreditoTransportar": 0.00
}
```

### Gerar XML para Upload na AT

```bash
curl -X GET http://localhost:3000/fiscal/iva/modelo-a/2025/2/xml \
  -H "Authorization: Bearer $TOKEN" \
  --output modelo-a-2025-02.xml
```

**XML Gerado:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<ModeloA xmlns="http://www.at.gov.mz/iva/v1">
  <Cabecalho>
    <NUIT>400123456</NUIT>
    <NomeContribuinte>ABC Comercial, Lda</NomeContribuinte>
    <Periodo>02/2025</Periodo>
    <Regime>NORMAL</Regime>
  </Cabecalho>
  <Quadro01>
    <VendasBens16>850000.00</VendasBens16>
    <IVABens16>136000.00</IVABens16>
    <VendasServicos16>450000.00</VendasServicos16>
    <IVAServicos16>72000.00</IVAServicos16>
    <TotalBase16>1300000.00</TotalBase16>
    <TotalIVA16>208000.00</TotalIVA16>
  </Quadro01>
  <!-- ... demais quadros ... -->
  <Quadro06>
    <IVALiquidado>225500.00</IVALiquidado>
    <IVADedutivel>85000.00</IVADedutivel>
    <Diferenca>140500.00</Diferenca>
    <CreditoAnterior>0.00</CreditoAnterior>
    <IVAPagar>140500.00</IVAPagar>
    <CreditoTransportar>0.00</CreditoTransportar>
  </Quadro06>
</ModeloA>
```

---

## 📋 Alíquotas de IVA (Lei 10/2025)

| Tipo | Taxa | Aplicação |
|------|------|-----------|
| **Normal** | 16% | Bens e serviços padrão |
| **Intermédia** | 10% | Turismo, hotelaria, restaurantes |
| **Reduzida** | 5% | Bens essenciais (arroz, pão, óleo) |
| **Isenta** | 0% | Exportações, alguns medicamentos |
| **Não sujeita** | - | Transferência de imóveis |

---

## 🔧 Implementação Técnica

### Serviço: IvaReportService

```typescript
@Injectable()
export class IvaReportService {
  // Calcula todos os quadros automaticamente
  async gerarModeloA(empresaId, ano, mes): Promise<DeclaracaoIVA>
  
  // Gera XML conforme schema AT
  async gerarXML(empresaId, ano, mes): Promise<string>
  
  // Lista histórico de declarações
  async listarDeclaracoes(empresaId): Promise<DeclaracaoIVA[]>
}
```

### Entidade: DeclaracaoIVA

- 25 campos mapeando todos os quadros
- Estados: RASCUNHO → VALIDADA → SUBMETIDA → ACEITE
- XML gerado automaticamente
- Crédito transportado entre períodos

---

## 🧪 Testes

```bash
# 1. Criar documentos fiscais primeiro
./test-workflow.sh

# 2. Gerar declaração do mês
curl -X POST http://localhost:3000/fiscal/iva/modelo-a/2025/2 \
  -H "Authorization: Bearer $TOKEN"

# 3. Verificar cálculos
curl http://localhost:3000/fiscal/iva/resumo-atual \
  -H "Authorization: Bearer $TOKEN" | jq '.q6IvaAPagar'

# 4. Download XML
curl http://localhost:3000/fiscal/iva/modelo-a/2025/2/xml \
  -H "Authorization: Bearer $TOKEN" \
  --output declaracao.xml
```

---

## 📁 Arquivos Criados

```
backend-nestjs/src/modules/fiscal/
├── entities/
│   └── declaracao-iva.entity.ts
├── services/
│   └── iva-report.service.ts
├── controllers/
│   └── iva-report.controller.ts
└── fiscal.module.ts
```

---

## 🚀 Próximos Passos (Fase 3)

1. **Geração de PDFs** - Facturas, Recibos, Declarações
2. **QR Code Fiscal** - Conforme Portaria 97/2021
3. **Hash SHA-256** - Validação de documentos
4. **Notificações Email** - SendGrid/AWS SES

---

**Status:** ✅ **FASE 2 CONCLUÍDA**
