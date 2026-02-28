# FISCAL.MZ 2.0 - Diagramas de Arquitetura

## 1. Diagrama ER - Workflow Comercial → Fiscal

```mermaid
erDiagram
    %% Entidades Principais
    TENANTS {
        uuid id PK
        varchar nome
        varchar nif
        decimal wallet_balance
        jsonb conta_bancaria
        jsonb configuracoes_pagamento
        varchar serie_ft
        varchar serie_proforma
        int contador_proforma
        int ano_fiscal_atual
    }
    
    CLIENTES {
        uuid id PK
        uuid tenant_id FK
        varchar nome
        varchar nif
        varchar email
        decimal credito_autorizado
    }
    
    PRODUTOS {
        uuid id PK
        uuid tenant_id FK
        varchar codigo
        varchar descricao
        decimal preco_unitario
        decimal iva_percentual
        decimal stock_disponivel
    }
    
    %% Entidades B2B - Documentos Comerciais (Negociáveis)
    WORKFLOW_NEGOCIACOES {
        uuid id PK
        uuid tenant_id FK
        uuid cliente_id FK
        enum status
        jsonb itens
        decimal total_estimado
        date validade_ate
        jsonb historico_negociacao
        uuid conversao_documento_id FK
    }
    
    PROFORMAS {
        uuid id PK
        uuid cotacao_id FK
        uuid tenant_id FK
        uuid cliente_id FK
        varchar numero_proforma
        jsonb itens
        decimal total_geral
        enum condicoes_pagamento
        enum status
        date validade_ate
    }
    
    %% Payment Orchestration
    PAGAMENTOS {
        uuid id PK
        uuid tenant_id FK
        uuid cliente_id FK
        uuid proforma_id FK
        uuid fatura_id FK
        enum metodo
        decimal valor
        enum estado
        varchar gateway_ref
        boolean is_escrow
        timestamptz escrow_release_date
        text comprovativo_url
    }
    
    %% Documentos Fiscais (Imutáveis)
    DOCUMENTOS_FISCAIS {
        uuid id PK
        uuid tenant_id FK
        uuid cliente_id FK
        uuid proforma_origin_id FK
        enum tipo
        varchar numero_documento
        jsonb itens
        decimal total_geral
        varchar hash_documento
        boolean pagamento_integrado
        enum estado_pagamento
        decimal valor_pago
    }
    
    RECIBOS {
        uuid id PK
        uuid tenant_id FK
        uuid fatura_id FK
        uuid pagamento_id FK
        varchar numero_recibo
        date data_recibo
        decimal valor_recebido
        varchar hash_recibo
    }
    
    %% Auditoria
    AUDIT_LOG_PAGAMENTOS {
        uuid id PK
        uuid pagamento_id FK
        enum estado_anterior
        enum estado_novo
        timestamptz alterado_em
    }
    
    WALLET_SAQUES {
        uuid id PK
        uuid tenant_id FK
        decimal valor
        varchar estado
        timestamptz processado_at
    }
    
    %% Relacionamentos
    TENANTS ||--o{ CLIENTES : possui
    TENANTS ||--o{ PRODUTOS : possui
    TENANTS ||--o{ WORKFLOW_NEGOCIACOES : cria
    TENANTS ||--o{ PROFORMAS : emite
    TENANTS ||--o{ PAGAMENTOS : recebe
    TENANTS ||--o{ DOCUMENTOS_FISCAIS : emite
    TENANTS ||--o{ RECIBOS : emite
    TENANTS ||--o{ WALLET_SAQUES : solicita
    
    CLIENTES ||--o{ WORKFLOW_NEGOCIACOES : recebe
    CLIENTES ||--o{ PROFORMAS : recebe
    CLIENTES ||--o{ PAGAMENTOS : efetua
    CLIENTES ||--o{ DOCUMENTOS_FISCAIS : recebe
    
    WORKFLOW_NEGOCIACOES ||--|| PROFORMAS : converte_para
    WORKFLOW_NEGOCIACOES ||--o| PROFORMAS : referencia_conversao
    
    PROFORMAS ||--o{ PAGAMENTOS : gera
    PROFORMAS ||--o| DOCUMENTOS_FISCAIS : origina
    
    PAGAMENTOS ||--o| DOCUMENTOS_FISCAIS : paga
    PAGAMENTOS ||--o| RECIBOS : gera
    PAGAMENTOS ||--o{ AUDIT_LOG_PAGAMENTOS : audita
    
    DOCUMENTOS_FISCAIS ||--o{ RECIBOS : comprova
```

---

## 2. State Machine - Workflow de Negociação (Cotação)

```mermaid
stateDiagram-v2
    [*] --> RASCUNHO: Nova Cotação
    
    RASCUNHO --> ENVIADA: Enviar para Cliente
    RASCUNHO --> [*]: Cancelar
    
    ENVIADA --> NEGOCIANDO: Cliente propõe alterações
    ENVIADA --> ACEITE: Cliente aceita
    ENVIADA --> REJEITADA: Cliente rejeita
    ENVIADA --> VENCIDA: Ultrapassa validade
    
    NEGOCIANDO --> ACEITE: Acordo alcançado
    NEGOCIANDO --> ENVIADA: Nova proposta enviada
    NEGOCIANDO --> REJEITADA: Sem acordo
    NEGOCIANDO --> VENCIDA: Ultrapassa validade
    
    ACEITE --> CONVERTIDA: TRIGGER gera Proforma
    
    REJEITADA --> [*]: Arquivar
    VENCIDA --> [*]: Arquivar
    CONVERTIDA --> [*]: Processo comercial iniciado
```

### Descrição dos Estados:

| Estado | Descrição | Ações Permitidas |
|--------|-----------|------------------|
| **RASCUNHO** | Cotação em elaboração pelo vendedor | Editar itens, preços; Enviar para cliente; Cancelar |
| **ENVIADA** | Cotação enviada ao cliente para análise | Aguardar resposta; Não editável pelo vendedor |
| **NEGOCIANDO** | Cliente propôs contra-proposta | Responder cliente; Aceitar/rejeitar contra-proposta |
| **ACEITE** | Cliente aceitou termos | Trigger automático gera proforma |
| **REJEITADA** | Cliente recusou a cotação | Arquivar; Criar nova versão |
| **CONVERTIDA** | Transformada em proforma | Read-only; Referência para documento gerado |
| **VENCIDA** | Ultrapassou data de validade | Renovar; Arquivar |

---

## 3. State Machine - Proforma (Documento Comercial)

```mermaid
stateDiagram-v2
    [*] --> PENDENTE: Criada da Cotação Aceite
    
    PENDENTE --> EM_ESCROW: Pagamento em garantia iniciado
    PENDENTE --> PAGA: Pagamento imediato concluído
    PENDENTE --> VENCIDA: Ultrapassa data vencimento
    PENDENTE --> CANCELADA: Cancelada pelo vendedor
    
    EM_ESCROW --> PAGA: Entrega confirmada (libertação)
    EM_ESCROW --> REEMBOLSADA: Cancelada/Disputa
    
    PAGA --> [*]: Geração de FT (Documento Fiscal)
    VENCIDA --> [*]: Arquivar
    CANCELADA --> [*]: Arquivar
```

---

## 4. State Machine - Pagamento (Payment Orchestration)

```mermaid
stateDiagram-v2
    [*] --> PENDENTE: Iniciar pagamento
    
    PENDENTE --> PROCESSANDO: Gateway processando
    PENDENTE --> FALHADO: Timeout/Cancelado
    
    PROCESSANDO --> CONCLUIDO: Confirmação gateway
    PROCESSANDO --> FALHADO: Erro no gateway
    
    CONCLUIDO --> REEMBOLSADO: Devolução solicitada
    
    FALHADO --> PENDENTE: Retentativa
    FALHADO --> [*]: Cancelar
    
    REEMBOLSADO --> [*]: Finalizado
    CONCLUIDO --> [*]: Finalizado
```

---

## 5. State Machine - Documento Fiscal (FT/FR)

```mermaid
stateDiagram-v2
    [*] --> PENDENTE: Emitir documento
    
    PENDENTE --> PARCIAL: Pagamento parcial recebido
    PENDENTE --> PAGO: Pagamento total recebido
    
    PARCIAL --> PAGO: Pagamento complementar
    PARCIAL --> EXCEDENTE: Pagamento acima do valor
    
    PAGO --> [*]: Quitado
    EXCEDENTE --> [*]: Ajustar/Nota de crédito
    
    PENDENTE --> ANULADO: Cancelar documento
    PARCIAL --> ANULADO: Cancelar com NC
```

---

## 6. Fluxo Completo - B2B Marketplace

```mermaid
sequenceDiagram
    actor Vendedor
    actor Comprador
    participant Cotação as workflow_negociacoes
    participant Proforma as proformas
    participant Gateway as M-Pesa/Stripe
    participant Pagto as pagamentos
    participant FT as documentos_fiscais
    participant Recibo as recibos
    participant Wallet as Wallet Tenant

    Vendedor->>Cotação: Criar cotação (RASCUNHO)
    Vendedor->>Cotação: Enviar cotação
    Cotação->>Comprador: Notificação
    
    alt Negociação
        Comprador->>Cotação: Contra-proposta
        Cotação->>Vendedor: Notificação
        Vendedor->>Cotação: Aceitar/Counter-offer
    end
    
    Comprador->>Cotação: Aceitar cotação
    Cotação->>Proforma: TRIGGER: Gerar Proforma
    Proforma->>Comprador: Enviar P/2025/1
    
    alt Pagamento ESCROW
        Comprador->>Gateway: Depositar valor
        Gateway->>Pagto: Criar registro EM_ESCROW
        Note over Pagto: Valor retido em garantia
        Vendedor->>Comprador: Entregar produto/serviço
        Comprador->>Pagto: Confirmar recebimento
        Pagto->>Gateway: Liberar pagamento
        Gateway->>Wallet: Credit wallet
    else Pagamento IMEDIATO
        Comprador->>Gateway: Pagar
        Gateway->>Pagto: Confirmar CONCLUIDO
        Pagto->>Wallet: Credit wallet
    else Pagamento 30 DIAS
        Proforma->>FT: Gerar FT (crédito)
        Note over FT: Status FT = PENDENTE
        Comprador->>Gateway: Pagar posteriormente
        Gateway->>Pagto: Registrar pagamento
        Pagto->>FT: Atualizar estado para PAGO
    end
    
    alt Quando Proforma PAGA
        Proforma->>FT: TRIGGER: Gerar FT
        FT->>Recibo: TRIGGER: Gerar Recibo
        Recibo->>Comprador: Enviar comprovativo
    end
    
    Vendedor->>Wallet: Solicitar saque
    Wallet->>Gateway: Transferir para IBAN
```

---

## 7. Diferença: Documentos Comerciais vs Fiscais

```mermaid
graph TB
    subgraph "DOCUMENTOS COMERCIAIS<br/>(Negociáveis / Não-fiscais)"
        C[COTAÇÃO<br/>workflow_negociacoes]
        P[PROFORMA<br/>proformas]
        
        C -->|Aceite| P
        
        note1[Características:<br/>• Sem hash fiscal<br/>• Sem QR code<br/>• Sem série oficial<br/>• Negociáveis<br/>• Podem ser canceladas<br/>• Não têm valor fiscal]
    end
    
    subgraph "DOCUMENTOS FISCAIS<br/>(Imutáveis / Oficiais)"
        FT[FATURA<br/>documentos_fiscais]
        FR[FATURA-RECIBO<br/>documentos_fiscais]
        NC[NOTA DE CRÉDITO<br/>documentos_fiscais]
        ND[NOTA DE DÉBITO<br/>documentos_fiscais]
        R[RECIBO<br/>recibos]
        
        note2[Características:<br/>• Hash SHA256<br/>• QR Code obrigatório<br/>• Série oficial (FT/FR/NC/ND/R)<br/>• Imutáveis após emissão<br/>• Anulação via NC<br/>• Valor fiscal/legal]
        
        FT -.->|Cancelamento| NC
        FT -.->|Acerto| ND
        FT -.->|Pagamento| R
    end
    
    P -->|Quando paga| FT
    P -->|Quando paga| FR
```

---

## 8. Diagrama de Componentes - Payment Orchestration

```mermaid
graph TB
    subgraph "FISCAL.MZ 2.0 - Payment Orchestration"
        PO[PAGAMENTOS<br/>Tabela Central]
        
        subgraph "Gateways Suportados"
            MP[M-Pesa]
            EM[EMola]
            BIM[BIM]
            CD[CARTÃO DÉBITO]
            CC[CARTÃO CRÉDITO]
            CASH[CASH/Manual]
        end
        
        subgraph "Mecanismos de Pagamento"
            IM[IMEDIATO]
            P30[30 DIAS]
            ESC[ESCROW/Garantia]
            P50[50/50]
        end
        
        subgraph "Estados"
            PEND[PENDENTE]
            PROC[PROCESSANDO]
            CONC[CONCLUIDO]
            FALH[FALHADO]
            REEM[REEMBOLSADO]
        end
        
        subgraph "Auditoria"
            AUD[audit_log_pagamentos]
            WLT[wallet_saques]
        end
        
        PO --> MP
        PO --> EM
        PO --> BIM
        PO --> CD
        PO --> CC
        PO --> CASH
        
        PO --> IM
        PO --> P30
        PO --> ESC
        PO --> P50
        
        PO --> PEND
        PO --> PROC
        PO --> CONC
        PO --> FALH
        PO --> REEM
        
        PO -.-> AUD
        PO -.-> WLT
    end
```
