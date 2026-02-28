# FISCAL.MZ 2.0 - Backend NestJS

Backend API completo com arquitetura Domain-Driven Design (DDD), CQRS e Event Sourcing.

---

## 🏗️ Arquitetura

```
src/
├── modules/
│   ├── workflow/          # Ciclo de cotação → proforma
│   │   ├── commands/      # Handlers de comandos CQRS
│   │   ├── events/        # Eventos de domínio
│   │   ├── queries/       # Queries CQRS
│   │   └── dto/           # Data Transfer Objects
│   ├── fiscal/            # Documentos fiscais (FT, Recibos)
│   │   ├── commands/
│   │   ├── domain/        # Invoice Aggregate (Event Sourcing)
│   │   └── events/
│   ├── payments/          # Orchestration de pagamentos
│   │   ├── strategies/    # M-Pesa, Cash, Card, Escrow
│   │   └── escrow/        # Lógica de garantia
│   ├── sync/              # Offline/Online sync
│   └── notifications/     # Push, Email, SMS
├── common/                # Decorators, Guards, Pipes
└── infrastructure/        # Database, Event Store
```

---

## 🚀 Tecnologias

- **Framework**: NestJS 10
- **Padrões**: CQRS, Event Sourcing, DDD
- **Database**: PostgreSQL + TypeORM
- **Message Bus**: NestJS EventEmitter
- **Docs**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

---

## ⚡ Patterns Implementados

### CQRS (Command Query Responsibility Segregation)

```typescript
// Command - Altera estado
@CommandHandler(CreateQuoteCommand)
class CreateQuoteHandler implements ICommandHandler<CreateQuoteCommand> {
  async execute(command: CreateQuoteCommand) {
    // Lógica de negócio
  }
}

// Query - Retorna dados (read-only)
@QueryHandler(GetPendingQuotesQuery)
class GetPendingQuotesHandler implements IQueryHandler<GetPendingQuotesQuery> {
  async execute(query: GetPendingQuotesQuery) {
    // Consulta otimizada
  }
}
```

### Event Sourcing

Todos os eventos de domínio são persistidos em `event_store`:

```sql
CREATE TABLE event_store (
  id UUID PRIMARY KEY,
  aggregate_id UUID,
  aggregate_type VARCHAR,
  aggregate_version INT,
  event_type VARCHAR,
  payload JSONB,
  metadata JSONB,
  tenant_id UUID,
  occurred_on TIMESTAMPTZ,
  published BOOLEAN
);
```

### Strategy Pattern (Pagamentos)

```typescript
interface IPaymentStrategy {
  processPayment(proformaId, amount, metadata): Promise<PaymentResult>
}

class MpesaStrategy implements IPaymentStrategy { }
class CashStrategy implements IPaymentStrategy { }
class EscrowStrategy implements IPaymentStrategy { }
```

---

## 📋 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com credenciais do PostgreSQL

# Executar migrações
npm run migration:run

# Iniciar em desenvolvimento
npm run start:dev

# Documentação Swagger
http://localhost:3000/api/docs
```

---

## 🔌 API Endpoints

### Workflow (Cotações)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/quotes` | Criar cotação |
| GET | `/api/v1/quotes/sent` | Listar enviadas |
| GET | `/api/v1/quotes/received` | Listar recebidas |
| PATCH | `/api/v1/quotes/:id/accept` | Aceitar cotação |

### Payments

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/proformas/:id/pay` | Iniciar pagamento |
| POST | `/api/v1/payments/webhook/:gateway` | Webhooks |
| GET | `/api/v1/wallet/balance` | Saldo wallet |

---

## 🧪 Testes

```bash
# Unit tests
npm test

# E2E tests (fluxo completo)
npm run test:e2e

# Coverage
npm run test:cov
```

### Teste E2E Completo

O arquivo `test/workflow.e2e-spec.ts` cobre:
1. Criar cotação
2. Aceitar cotação (gera proforma)
3. Iniciar pagamento M-Pesa
4. Webhook confirma pagamento
5. Fatura fiscal gerada automaticamente
6. Fluxo de Escrow

---

## 🔄 Fluxo B2B

```
Cliente cria COTAÇÃO (RASCUNHO)
    ↓
Vendedor envia → status=ENVIADA
    ↓
Comprador aceita → status=ACEITE
    ↓
TRIGGER: Gerar PROFORMA (P/2025/1)
    ↓
Comprador paga via M-Pesa/Escrow
    ↓
Pagamento CONCLUÍDO
    ↓
TRIGGER: Gerar FT (Fatura Fiscal)
    ↓
Emitir RECIBO
    ↓
Notificar ambas as partes
```

---

## 🛡️ Segurança

- **Rate Limiting**: 10 req/min para pagamentos
- **Idempotency-Key**: Evita duplicados em POSTs
- **HMAC Validation**: Webhooks assinados
- **RLS**: Row Level Security no PostgreSQL
- **Audit Log**: Todos os comandos em event_store

---

## 📦 Entregáveis

✅ Commands e Handlers principais
✅ Strategies de Pagamento (M-Pesa, Cash, Escrow)
✅ Event Store schema
✅ Testes e2e do fluxo completo
✅ Documentação OpenAPI/Swagger
