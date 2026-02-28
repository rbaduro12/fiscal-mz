# FISCAL.MZ 2.0 - Arquitetura de Dados

## Visão Geral

Arquitetura completa para **FISCAL.MZ 2.0** com módulos:
- **B2B Marketplace** - Negociações e cotações entre empresas
- **Payment Orchestration** - Gestão de pagamentos multi-gateway
- **Documentação Fiscal** - FT, FR, NC, ND, Recibos (conforme legislação)

## 📁 Entregáveis

| Ficheiro | Descrição |
|----------|-----------|
| `fiscal_mz_2_0_schema.sql` | Script SQL completo com DDL, triggers, functions, RLS |
| `diagramas_mermaid.md` | Diagramas ER e State Machines em Mermaid |
| `queries_exemplos.sql` | 15+ queries de exemplo para casos de uso |
| `README_ARQUITETURA.md` | Este documento |

---

## 🏗️ Arquitetura de Dados

### Separação Conceitual Crítica

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENTOS COMERCIAIS                        │
│                      (Negociáveis)                              │
├─────────────────────────────────────────────────────────────────┤
│  workflow_negociacoes  →  proformas                            │
│  (Cotações)              (Pré-faturas)                          │
│                                                                 │
│  • Sem hash fiscal                                              │
│  • Sem QR code                                                  │
│  • Podem ser canceladas                                         │
│  • Negociáveis (preços, quantidades)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Quando paga
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DOCUMENTOS FISCAIS                          │
│                      (Imutáveis)                                │
├─────────────────────────────────────────────────────────────────┤
│  documentos_fiscais  +  recibos                                 │
│  (FT, FR, NC, ND)       (Comprovativos)                        │
│                                                                 │
│  • Hash SHA256 obrigatório                                      │
│  • QR Code fiscal                                               │
│  • Série oficial (FT/FR/NC/ND/R)                                │
│  • Imutáveis após emissão                                       │
│  • Anulação apenas via NC                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Entidades Principais

### 1. workflow_negociacoes (Cotações)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `status` | ENUM | RASCUNHO → ENVIADA → NEGOCIANDO → ACEITE → CONVERTIDA |
| `itens` | JSONB | Array de produtos com preços negociáveis |
| `historico_negociacao` | JSONB | Trail de alterações (counter-offers) |
| `validade_ate` | DATE | Prazo de validade (default: 30 dias) |

**Trigger principal**: Ao mudar para ACEITE, gera automaticamente uma proforma.

### 2. proformas (Documento Comercial)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `numero_proforma` | VARCHAR | Série P/ (ex: P/2025/1) |
| `itens` | JSONB | **Snapshot imutável** dos itens acordados |
| `condicoes_pagamento` | ENUM | IMMEDIATO, 30_DIAS, 50_50, ESCROW |
| `status` | ENUM | PENDENTE → EM_ESCROW → PAGA → FT Gerada |

### 3. pagamentos (Payment Orchestration)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `metodo` | ENUM | CASH, MPESA, EMOLA, BIM, CARTAO_DEBITO, CARTAO_CREDITO, ESCROW |
| `estado` | ENUM | PENDENTE → PROCESSANDO → CONCLUIDO/FALHADO/REEMBOLSADO |
| `gateway_ref` | VARCHAR | ID da transação no gateway externo |
| `is_escrow` | BOOLEAN | Pagamento em garantia |
| `escrow_release_date` | TIMESTAMPTZ | Data de libertação do escrow |

### 4. documentos_fiscais (FT, FR, NC, ND)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `proforma_origin_id` | UUID | FK para proforma de origem (quando aplicável) |
| `hash_documento` | VARCHAR(64) | SHA256 conforme legislação fiscal |
| `estado_pagamento` | ENUM | PENDENTE → PARCIAL → PAGO → EXCEDENTE |
| `pagamento_integrado` | BOOLEAN | TRUE se pago via app FISCAL.MZ |

### 5. recibos (Documento Fiscal de Pagamento)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `numero_recibo` | VARCHAR | Série R/ (ex: R/2025/1) |
| `hash_recibo` | VARCHAR(64) | SHA256 do comprovativo |
| `valor_recebido` | DECIMAL | Valor efetivamente recebido |

---

## 🔄 Workflows Principais

### Workflow 1: Cotação → Proforma → FT (Pagamento Imediato)

```
Vendedor cria COTAÇÃO (RASCUNHO)
    ↓
Enviada ao Comprador
    ↓
Comprador ACEITA (ou propõe alterações)
    ↓
TRIGGER: Gera PROFORMA (P/2025/1) - Série P/
    ↓
Comprador paga IMEDIATAMENTE via M-Pesa/Stripe
    ↓
Pagamento CONCLUÍDO → TRIGGER
    ↓
Gera FT (Fatura) + RECIBO simultâneos
```

### Workflow 2: Cotação → Proforma → FT (Pagamento 30 Dias - Crédito)

```
Cotação ACEITA → Proforma gerada
    ↓
Condição: 30_DIAS
    ↓
Gera FT IMEDIATAMENTE (crédito ao cliente)
    ↓
FT com estado_pagamento = 'PENDENTE'
    ↓
Aguarda pagamento dentro de 30 dias
    ↓
Quando pago → Gera RECIBO
```

### Workflow 3: Escrow/Pagamento em Garantia

```
Cotação ACEITE → Proforma com condicao_pagamento = ESCROW
    ↓
Comprador deposita valor (retido em garantia)
    ↓
Pagamento estado = 'CONCLUIDO', is_escrow = TRUE
    ↓
Valor NÃO vai para wallet do vendedor (retido)
    ↓
Vendedor entrega produto/serviço
    ↓
Comprador confirma recebimento
    ↓
Libertação do escrow → Valor para wallet
    ↓
Geração da FT + Recibo
```

---

## 🛡️ Segurança e Auditoria

### Row Level Security (RLS)

Todas as tabelas financeiras têm RLS ativado:

```sql
-- Usuário só vê pagamentos onde é:
-- 1. Recebedor (tenant_id) OU
-- 2. Pagador (cliente_id)

CREATE POLICY pagamentos_access_policy ON pagamentos
    FOR SELECT
    USING (
        tenant_id = current_setting('app.current_tenant_id')::UUID
        OR cliente_id = current_setting('app.current_cliente_id')::UUID
    );
```

### Auditoria

```sql
-- Toda mudança de estado em pagamentos é logada
audit_log_pagamentos: estado_anterior → estado_novo

-- Toda mudança de status em proformas é logada  
audit_log_proformas: status_anterior → status_novo

-- Wallet só atualizável via trigger (nunca diretamente)
-- Função: calcular_wallet_balance(tenant_id)
```

---

## 📈 Performance

### Indexes Otimizados

```sql
-- Workflow de negociações
CREATE INDEX idx_cotacoes_cliente_status ON workflow_negociacoes(cliente_id, status);

-- Proformas pendentes (alertas de vencimento)
CREATE INDEX idx_proformas_vencimento ON proformas(status, validade_ate) WHERE status = 'PENDENTE';

-- Conciliação bancária
CREATE INDEX idx_pagamentos_gateway ON pagamentos(gateway_ref, estado);

-- GIN indexes para JSONB
CREATE INDEX idx_cotacoes_itens_gin ON workflow_negociacoes USING GIN (itens);
```

---

## 💰 Gestão de Wallet

### Cálculo do Saldo

```sql
-- Saldo disponível = 
--   SUM(pagamentos CONCLUIDO desde último saque)
--   - SUM(pagamentos em ESCROW não libertados)

SELECT calcular_wallet_balance('UUID_TENANT');
```

### Saques

```sql
-- Tabela wallet_saques controla retiradas
-- Estados: PENDENTE → PROCESSANDO → CONCLUIDO/REJEITADO
```

---

## 🔧 Instalação

```bash
# 1. Criar a base de dados
createdb fiscal_mz_20

# 2. Executar o script principal
psql -d fiscal_mz_20 -f fiscal_mz_2_0_schema.sql

# 3. Verificar instalação
psql -d fiscal_mz_20 -c "\dt"
```

---

## 📋 Checklist de Implementação

- [ ] Criar base de dados e executar schema
- [ ] Configurar variáveis de ambiente para RLS (`app.current_tenant_id`, `app.current_cliente_id`)
- [ ] Implementar integração com gateways de pagamento (M-Pesa, Stripe, etc.)
- [ ] Configurar jobs para alertas de proformas vencidas
- [ ] Implementar geração de QR Code e hash fiscal
- [ ] Configurar notificações para transições de estado
- [ ] Implementar interface de conciliação bancária
- [ ] Configurar backups automatizados das tabelas de auditoria

---

## 📞 Suporte

Para dúvidas sobre a arquitetura:
1. Consultar `diagramas_mermaid.md` para fluxos visuais
2. Consultar `queries_exemplos.sql` para casos de uso comuns
3. Verificar comentários nas tabelas no schema SQL
