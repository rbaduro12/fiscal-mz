# 🚀 FASE 1 — CORE FISCAL & WORKFLOW
## Implementação Completa do Sistema de Documentos

---

## ✅ Funcionalidades Implementadas

### 1. Sistema de Seed (Dados de Teste)
```
POST /seed/all              → Popula todo o banco
POST /seed/empresas         → Cria empresas de exemplo
POST /seed/utilizadores     → Cria utilizadores
POST /seed/entidades        → Cria clientes/fornecedores
POST /seed/artigos          → Cria produtos/serviços
```

### 2. Autenticação JWT
```
POST /auth/login            → Login com email/senha
POST /auth/register         → Registro de nova empresa
GET  /auth/me               → Perfil do utilizador logado
```

**Credenciais de Teste:**
- `admin@abc.co.mz` / `admin123` (Empresa: ABC Comercial)
- `vendedor@abc.co.mz` / `vendedor123`
- `admin@xyz.co.mz` / `admin123` (Empresa: XYZ Importações)

### 3. Workflow de Documentos
```
POST /workflow/cotacoes              → Criar cotação
POST /workflow/cotacoes/:id/aceitar  → Aceitar cotação (cliente)
POST /workflow/cotacoes/:id/rejeitar → Rejeitar cotação
POST /workflow/proformas/:id/pagar   → Pagar proforma

GET  /workflow/cotacoes?tipo=enviadas|recebidas
GET  /workflow/proformas/pendentes
GET  /workflow/dashboard/stats
```

### 4. APIs de Entidades
```
GET /empresas               → Listar empresas
GET /entidades              → Listar clientes/fornecedores
GET /artigos                → Listar produtos/serviços
GET /documentos             → Listar documentos
GET /notificacoes           → Listar notificações
```

---

## 📊 Estrutura de Dados

### Empresas Criadas (Seed)
| NUIT | Nome | Cidade |
|------|------|--------|
| 400123456 | ABC Comercial, Lda | Maputo |
| 400654321 | XYZ Importações, Lda | Beira |
| 400111222 | Tech Solutions Moçambique, Lda | Nampula |

### Artigos Criados (Seed)
| Código | Descrição | Tipo | Preço | IVA |
|--------|-----------|------|-------|-----|
| SERV001 | Consultoria Fiscal - Hora | Serviço | 5.000 MZN | 16% |
| SERV002 | Despacho Aduaneiro | Serviço | 15.000 MZN | 16% |
| SERV003 | Registro de Empresa | Serviço | 25.000 MZN | 16% |
| PROD001 | Arroz Importado 50kg | Produto | 3.500 MZN | 5% |
| PROD002 | Óleo Alimentar 20L | Produto | 2.800 MZN | 5% |
| PROD003 | Frigorífico | Produto | 85.000 MZN | 16% |

---

## 🔄 Fluxo de Teste Completo

### 1. Executar Seed
```bash
curl -X POST http://localhost:3000/seed/all
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@abc.co.mz","password":"admin123"}'
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "email": "admin@abc.co.mz",
    "nome": "Manuel Fernando",
    "role": "ADMIN",
    "empresa": {
      "id": "...",
      "nomeFiscal": "ABC Comercial, Lda",
      "nuit": "400123456"
    }
  }
}
```

### 3. Criar Cotação
```bash
curl -X POST http://localhost:3000/workflow/cotacoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "entidadeId": "UUID_DO_CLIENTE",
    "itens": [
      {
        "artigoId": "UUID_DO_SERV001",
        "descricao": "Consultoria Fiscal - Hora",
        "quantidade": 10,
        "precoUnitario": 5000,
        "taxaIva": 16
      }
    ],
    "observacoes": "Cotação para serviços de consultoria fiscal"
  }'
```

### 4. Aceitar Cotação (como cliente)
```bash
# Login como cliente (admin@xyz.co.mz)
curl -X POST http://localhost:3000/workflow/cotacoes/$COTACAO_ID/aceitar \
  -H "Authorization: Bearer $TOKEN_CLIENTE"
```

### 5. Pagar Proforma
```bash
curl -X POST http://localhost:3000/workflow/proformas/$PROFORMA_ID/pagar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_ABC" \
  -d '{
    "metodo": "MPESA",
    "referencia": "MP123456789"
  }'
```

**Resultado:** Gera automaticamente:
- ✅ Factura Fiscal (com hash e QR Code)
- ✅ Recibo de Pagamento
- ✅ Movimentação de Stock (se produto)
- ✅ Notificações para ambas as partes

---

## 📈 Dashboard Stats

```bash
curl http://localhost:3000/workflow/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Resposta:**
```json
{
  "cotacoesPendentes": 5,
  "cotacoesEnviadasMes": 12,
  "proformasPendentes": 3,
  "faturasMes": 8,
  "totalFaturadoMes": 1250000.00
}
```

---

## 🧪 Testes Automatizados

### Unitários
```bash
npm run test
```

### E2E
```bash
npm run test:e2e
```

---

## 🔐 Segurança Implementada

- ✅ JWT Authentication
- ✅ Password hashing com bcrypt
- ✅ Guards em todas as rotas protegidas
- ✅ Multi-tenant (empresa_id isolamento)
- ✅ Transações atômicas no workflow
- ✅ Numeração sequencial com locks (PostgreSQL)

---

## 📋 Próximos Passos (Fase 2)

1. **Modelo A de IVA** - Geração de declaração mensal
2. **Relatórios PDF** - Facturas, Recibos, Guia de Transporte
3. **QR Code** - Validação fiscal
4. **Notificações Email** - SendGrid/AWS SES
5. **Stock Avançado** - Contagem de inventário

---

## 🚀 Como Iniciar

```bash
# 1. Subir infraestrutura
docker compose up -d

# 2. Instalar dependências
npm install

# 3. Compilar
npm run build

# 4. Executar seed
curl -X POST http://localhost:3000/seed/all

# 5. Iniciar servidor
npm run start:dev

# 6. Testar login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@abc.co.mz","password":"admin123"}'
```

---

**Status:** ✅ **FASE 1 CONCLUÍDA** 
