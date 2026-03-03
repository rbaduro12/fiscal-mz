# 🔄 Como Reiniciar o Sistema Corretamente

## Problema Identificado
Os logs mostram:
- `Cannot GET /v1/stock/resumo` → Backend não tem as rotas carregadas
- `Firefox can't establish connection to ws://localhost:3000/notificacoes` → WebSocket não está ativo

## Solução

### Passo 1: Parar Todos os Servidores

No terminal onde está rodando o backend, pressione:
```
CTRL + C
```

No terminal onde está rodando o frontend, pressione:
```
CTRL + C
```

### Passo 2: Rebuild do Backend

```bash
cd /home/hambastele/Documents/Projectos/FISCAL_ERP/backend-nestjs
npm run build
```

### Passo 3: Reiniciar Backend

```bash
npm run start:dev
```

Aguarde ver a mensagem:
```
🚀 FISCAL.MZ 2.0 API running on port 3000
📚 API Documentation: http://localhost:3000/api/docs
🔌 WebSocket: ws://localhost:3000/notificacoes
```

### Passo 4: Reiniciar Frontend

Em outro terminal:
```bash
cd /home/hambastele/Documents/Projectos/FISCAL_ERP/web-desktop
npm run dev
```

### Passo 5: Testar

1. Acesse http://localhost:5173
2. Faça login
3. Clique em **"Stock"** no menu
4. Clique no ícone **🔔** de notificações

## Verificação Rápida

Teste no navegador:
```
http://localhost:3000/v1/stock/resumo
```

Deve retornar um array (pode estar vazio `[]` mas não erro 404)

## Script Automático

Ou use o script que criei:
```bash
cd /home/hambastele/Documents/Projectos/FISCAL_ERP
./iniciar-sistema.sh
```

## ⚠️ IMPORTANTE

Sempre que modificar arquivos no **backend**, é necessário:
1. Parar o servidor (`CTRL+C`)
2. Rebuild (`npm run build`)
3. Reiniciar (`npm run start:dev`)

O frontend (Vite) atualiza automaticamente, mas o backend (NestJS) precisa ser reiniciado manualmente.
