#!/bin/bash

# Script de teste do workflow FISCAL.MZ
# Testa: Seed → Login → Criar Cotação → Aceitar → Pagar

BASE_URL="http://localhost:3000"
echo "🚀 Testando FISCAL.MZ API"
echo "=========================="

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Seed
echo -e "\n📦 1. Executando Seed..."
SEED_RESPONSE=$(curl -s -X POST "$BASE_URL/seed/all")
if echo "$SEED_RESPONSE" | grep -q "sucesso"; then
    echo -e "${GREEN}✅ Seed concluído${NC}"
else
    echo -e "${RED}⚠️  Seed pode já ter sido executado${NC}"
fi

# 2. Login ABC Comercial
echo -e "\n🔐 2. Login ABC Comercial (Vendedor)..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@abc.co.mz","password":"admin123"}')

TOKEN_ABC=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
EMPRESA_ABC=$(echo "$LOGIN_RESPONSE" | grep -o '"nomeFiscal":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN_ABC" ]; then
    echo -e "${GREEN}✅ Login bem-sucedido: $EMPRESA_ABC${NC}"
else
    echo -e "${RED}❌ Falha no login${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

# 3. Buscar entidades
echo -e "\n👥 3. Buscando entidades (clientes)..."
ENTIDADES=$(curl -s "$BASE_URL/entidades?empresaId=$(echo "$LOGIN_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)" \
    -H "Authorization: Bearer $TOKEN_ABC")

ENTIDADE_ID=$(echo "$ENTIDADES" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
ENTIDADE_NOME=$(echo "$ENTIDADES" | grep -o '"nome":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$ENTIDADE_ID" ]; then
    echo -e "${GREEN}✅ Cliente encontrado: $ENTIDADE_NOME ($ENTIDADE_ID)${NC}"
else
    echo -e "${RED}❌ Nenhum cliente encontrado${NC}"
    exit 1
fi

# 4. Buscar artigos
echo -e "\n📋 4. Buscando artigos..."
ARTIGOS=$(curl -s "$BASE_URL/artigos?empresaId=$(echo "$LOGIN_RESPONSE" | grep -o '"empresa":{[^}]*"id":"[^"]*"' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)" \
    -H "Authorization: Bearer $TOKEN_ABC")

ARTIGO_ID=$(echo "$ARTIGOS" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
ARTIGO_NOME=$(echo "$ARTIGOS" | grep -o '"descricao":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$ARTIGO_ID" ]; then
    echo -e "${GREEN}✅ Artigo encontrado: $ARTIGO_NOME ($ARTIGO_ID)${NC}"
else
    echo -e "${RED}❌ Nenhum artigo encontrado${NC}"
    exit 1
fi

# 5. Criar Cotação
echo -e "\n📄 5. Criando cotação..."
COTACAO=$(curl -s -X POST "$BASE_URL/workflow/cotacoes" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN_ABC" \
    -d "{
        \"entidadeId\": \"$ENTIDADE_ID\",
        \"itens\": [
            {
                \"artigoId\": \"$ARTIGO_ID\",
                \"descricao\": \"$ARTIGO_NOME\",
                \"quantidade\": 10,
                \"precoUnitario\": 5000,
                \"taxaIva\": 16
            }
        ],
        \"observacoes\": \"Cotação de teste automatizado\"
    }")

COTACAO_ID=$(echo "$COTACAO" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
COTACAO_NUM=$(echo "$COTACAO" | grep -o '"numeroCompleto":"[^"]*"' | cut -d'"' -f4)
COTACAO_TOTAL=$(echo "$COTACAO" | grep -o '"totalPagar":[0-9.]*' | cut -d':' -f2)

if [ -n "$COTACAO_ID" ]; then
    echo -e "${GREEN}✅ Cotação criada: $COTACAO_NUM${NC}"
    echo "   Total: $COTACAO_TOTAL MZN"
else
    echo -e "${RED}❌ Falha ao criar cotação${NC}"
    echo "$COTACAO"
    exit 1
fi

# 6. Login como Cliente (XYZ Importações)
echo -e "\n🔐 6. Login como Cliente (XYZ Importações)..."
LOGIN_CLIENTE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@xyz.co.mz","password":"admin123"}')

TOKEN_XYZ=$(echo "$LOGIN_CLIENTE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN_XYZ" ]; then
    echo -e "${GREEN}✅ Login cliente bem-sucedido${NC}"
else
    echo -e "${RED}❌ Falha no login do cliente${NC}"
    exit 1
fi

# 7. Listar cotações recebidas
echo -e "\n📥 7. Listando cotações recebidas pelo cliente..."
COTACOES_RECEBIDAS=$(curl -s "$BASE_URL/workflow/cotacoes?tipo=recebidas" \
    -H "Authorization: Bearer $TOKEN_XYZ")

if echo "$COTACOES_RECEBIDAS" | grep -q "$COTACAO_ID"; then
    echo -e "${GREEN}✅ Cotação recebida encontrada${NC}"
else
    echo -e "${RED}❌ Cotação não encontrada nas recebidas${NC}"
fi

# 8. Aceitar Cotação
echo -e "\n✅ 8. Aceitando cotação..."
ACEITE=$(curl -s -X POST "$BASE_URL/workflow/cotacoes/$COTACAO_ID/aceitar" \
    -H "Authorization: Bearer $TOKEN_XYZ")

PROFORMA_ID=$(echo "$ACEITE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
PROFORMA_NUM=$(echo "$ACEITE" | grep -o '"numeroCompleto":"[^"]*"' | cut -d'"' -f4)

if [ -n "$PROFORMA_ID" ]; then
    echo -e "${GREEN}✅ Cotação aceita! Proforma criada: $PROFORMA_NUM${NC}"
else
    echo -e "${RED}❌ Falha ao aceitar cotação${NC}"
    echo "$ACEITE"
    exit 1
fi

# 9. Pagar Proforma
echo -e "\n💳 9. Pagando proforma..."
PAGAMENTO=$(curl -s -X POST "$BASE_URL/workflow/proformas/$PROFORMA_ID/pagar" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN_ABC" \
    -d '{
        "metodo": "MPESA",
        "referencia": "MP123456789"
    }')

FACTURA_NUM=$(echo "$PAGAMENTO" | grep -o '"factura":{[^}]*"numeroCompleto":"[^"]*"' | grep -o '"numeroCompleto":"[^"]*"' | cut -d'"' -f4)
RECIBO_NUM=$(echo "$PAGAMENTO" | grep -o '"recibo":{[^}]*"numeroCompleto":"[^"]*"' | grep -o '"numeroCompleto":"[^"]*"' | cut -d'"' -f4)

if [ -n "$FACTURA_NUM" ]; then
    echo -e "${GREEN}✅ Pagamento processado!${NC}"
    echo "   Factura: $FACTURA_NUM"
    echo "   Recibo: $RECIBO_NUM"
else
    echo -e "${RED}❌ Falha no pagamento${NC}"
    echo "$PAGAMENTO"
    exit 1
fi

# 10. Dashboard Stats
echo -e "\n📊 10. Estatísticas do Dashboard..."
STATS=$(curl -s "$BASE_URL/workflow/dashboard/stats" \
    -H "Authorization: Bearer $TOKEN_ABC")

echo "Estatísticas:"
echo "$STATS" | grep -o '"[a-zA-Z]*":[0-9.]*' | while read line; do
    echo "   $line"
done

# 11. Notificações
echo -e "\n🔔 11. Verificando notificações..."
NOTIFICACOES=$(curl -s "$BASE_URL/notificacoes?empresaId=$(echo "$LOGIN_RESPONSE" | grep -o '"empresa":{[^}]*"id":"[^"]*"' | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)" \
    -H "Authorization: Bearer $TOKEN_ABC")

COUNT_NOTIF=$(echo "$NOTIFICACOES" | grep -o '"id":"[^"]*"' | wc -l)
echo -e "${GREEN}✅ Notificações: $COUNT_NOTIF${NC}"

echo -e "\n=========================="
echo -e "${GREEN}🎉 Fluxo completo testado com sucesso!${NC}"
echo ""
echo "Resumo:"
echo "  • Cotação: $COTACAO_NUM"
echo "  • Proforma: $PROFORMA_NUM"
echo "  • Factura: $FACTURA_NUM"
echo "  • Recibo: $RECIBO_NUM"
