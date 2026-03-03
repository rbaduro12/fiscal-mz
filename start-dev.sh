#!/bin/bash
# Script para iniciar o ambiente de desenvolvimento FISCAL.MZ 2.0

echo "🚀 FISCAL.MZ 2.0 - Iniciando ambiente de desenvolvimento"
echo "=========================================================="

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se PostgreSQL está rodando
echo -e "${BLUE}Verificando PostgreSQL...${NC}"
if pg_isready -h localhost -p 5433 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL conectado (porta 5433)${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL não está acessível na porta 5433${NC}"
    echo "   Certifique-se que o Docker está rodando:"
    echo "   docker-compose up -d postgres"
fi

echo ""
echo -e "${BLUE}Iniciando serviços...${NC}"
echo ""

# Iniciar Backend
echo -e "${GREEN}📦 Backend (NestJS) - http://localhost:3000${NC}"
echo "   API: http://localhost:3000/v1"
echo "   Docs: http://localhost:3000/api/docs"
echo "   WS: ws://localhost:3000/notificacoes"
cd backend-nestjs
npm run start:dev &
BACKEND_PID=$!

cd ..

# Aguardar backend iniciar
sleep 5

# Iniciar Frontend
echo ""
echo -e "${GREEN}🌐 Frontend (React + Vite) - http://localhost:5173${NC}"
cd web-desktop
npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "=========================================================="
echo -e "${GREEN}✅ FISCAL.MZ 2.0 em execução!${NC}"
echo ""
echo "🔗 URLs de Acesso:"
echo "   Frontend:    http://localhost:5173"
echo "   Backend API: http://localhost:3000/v1"
echo "   Swagger:     http://localhost:3000/api/docs"
echo ""
echo "🔑 Credenciais de Teste:"
echo "   admin@abc.co.mz / admin123"
echo "   vendedor@abc.co.mz / vendedor123"
echo ""
echo "⚠️  Pressione CTRL+C para parar todos os serviços"
echo "=========================================================="

# Aguardar interrupção
trap "echo ''; echo '🛑 Parando serviços...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait
