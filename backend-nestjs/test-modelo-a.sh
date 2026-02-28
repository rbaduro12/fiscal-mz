#!/bin/bash

# Script de teste do Modelo A de IVA
# Testa: Geração de declaração, cálculos e XML

BASE_URL="http://localhost:3000"
echo "🧮 Testando Modelo A de IVA"
echo "============================"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Login
echo -e "\n🔐 1. Login..."
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@abc.co.mz","password":"admin123"}')

TOKEN=$(echo "$LOGIN" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Falha no login${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Login OK${NC}"

# 2. Criar algumas facturas primeiro (se não existirem)
echo -e "\n📄 2. Verificando documentos fiscais..."
DOCUMENTOS=$(curl -s "$BASE_URL/documentos" \
    -H "Authorization: Bearer $TOKEN")

NUM_DOCS=$(echo "$DOCUMENTOS" | grep -o '"id":"[^"]*"' | wc -l)
echo "   Documentos existentes: $NUM_DOCS"

if [ "$NUM_DOCS" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Execute ./test-workflow.sh primeiro para criar documentos${NC}"
fi

# 3. Gerar Modelo A para Fevereiro 2025
echo -e "\n📊 3. Gerando Modelo A (02/2025)..."
MODELO_A=$(curl -s -X POST "$BASE_URL/fiscal/iva/modelo-a/2025/2" \
    -H "Authorization: Bearer $TOKEN")

if echo "$MODELO_A" | grep -q "q6IvaAPagar"; then
    echo -e "${GREEN}✅ Modelo A gerado!${NC}"
    
    # Extrair valores
    IVA_LIQUIDADO=$(echo "$MODELO_A" | grep -o '"q6IvaLiquidado":[0-9.]*' | cut -d':' -f2)
    IVA_DEDUTIVEL=$(echo "$MODELO_A" | grep -o '"q6IvaDedutivel":[0-9.]*' | cut -d':' -f2)
    IVA_PAGAR=$(echo "$MODELO_A" | grep -o '"q6IvaAPagar":[0-9.]*' | cut -d':' -f2)
    CREDITO_TRANS=$(echo "$MODELO_A" | grep -o '"q6CreditoTransportar":[0-9.]*' | cut -d':' -f2)
    
    echo ""
    echo "   📈 RESUMO DO APURAMENTO:"
    echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    printf "   IVA Liquidado:      %10s MZN\n" "$IVA_LIQUIDADO"
    printf "   IVA Dedutível:      %10s MZN\n" "$IVA_DEDUTIVEL"
    printf "   ─────────────────────────────────\n"
    printf "   Diferença:          %10s MZN\n" "$(echo "$IVA_LIQUIDADO - $IVA_DEDUTIVEL" | bc)"
    echo ""
    
    if [ "$(echo "$IVA_PAGAR > 0" | bc -l)" -eq 1 ]; then
        echo -e "   ${RED}⚠️  IVA A PAGAR: $IVA_PAGAR MZN${NC}"
    else
        echo -e "   ${GREEN}✅ Crédito a Transportar: $CREDITO_TRANS MZN${NC}"
    fi
else
    echo -e "${RED}❌ Falha ao gerar Modelo A${NC}"
    echo "$MODELO_A"
    exit 1
fi

# 4. Listar declarações
echo -e "\n📋 4. Listando declarações..."
DECLARACOES=$(curl -s "$BASE_URL/fiscal/iva/declaracoes" \
    -H "Authorization: Bearer $TOKEN")

NUM_DECL=$(echo "$DECLARACOES" | grep -o '"id":"[^"]*"' | wc -l)
echo "   Total de declarações: $NUM_DECL"

# 5. Download XML
echo -e "\n💾 5. Gerando XML..."
curl -s "$BASE_URL/fiscal/iva/modelo-a/2025/2/xml" \
    -H "Authorization: Bearer $TOKEN" \
    -o /tmp/modelo-a-test.xml

if [ -f /tmp/modelo-a-test.xml ] && [ -s /tmp/modelo-a-test.xml ]; then
    echo -e "${GREEN}✅ XML gerado: /tmp/modelo-a-test.xml${NC}"
    echo ""
    echo "   Preview:"
    head -15 /tmp/modelo-a-test.xml | sed 's/^/   /'
else
    echo -e "${RED}❌ Falha ao gerar XML${NC}"
fi

# 6. Mostrar detalhes do Quadro 01
echo -e "\n📊 6. Detalhes do Quadro 01 (Taxa 16%):"
Q1_BENS=$(echo "$MODELO_A" | grep -o '"q1VendasBens16":[0-9.]*' | cut -d':' -f2)
Q1_SERV=$(echo "$MODELO_A" | grep -o '"q1VendasServicos16":[0-9.]*' | cut -d':' -f2)
Q1_TOTAL=$(echo "$MODELO_A" | grep -o '"q1TotalBase16":[0-9.]*' | cut -d':' -f2)
Q1_IVA=$(echo "$MODELO_A" | grep -o '"q1TotalIva16":[0-9.]*' | cut -d':' -f2)

echo "   Vendas de bens:        $Q1_BENS MZN"
echo "   Prestação de serviços: $Q1_SERV MZN"
echo "   ─────────────────────────────"
echo "   TOTAL BASE:            $Q1_TOTAL MZN"
echo "   TOTAL IVA (16%):       $Q1_IVA MZN"

# 7. Verificar se há operações a 5%
echo -e "\n📊 7. Operações a 5% (Quadro 03):"
Q3_BENS=$(echo "$MODELO_A" | grep -o '"q3Bens5":[0-9.]*' | cut -d':' -f2)
Q3_IVA=$(echo "$MODELO_A" | grep -o '"q3BensIva5":[0-9.]*' | cut -d':' -f2)

if [ "$(echo "$Q3_BENS > 0" | bc -l)" -eq 1 ]; then
    echo "   Bens a 5%: $Q3_BENS MZN"
    echo "   IVA (5%):  $Q3_IVA MZN"
else
    echo "   Nenhuma operação a 5% no período"
fi

echo -e "\n============================"
echo -e "${GREEN}🎉 Teste do Modelo A concluído!${NC}"
echo ""
echo "Para submeter à AT:"
echo "  1. Acesse: https://www.at.gov.mz"
echo "  2. Faça upload do XML: /tmp/modelo-a-test.xml"
echo "  3. Pague o IVA via: https://bim.mz"
