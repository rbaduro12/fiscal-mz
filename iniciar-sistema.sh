#!/bin/bash
# Script para iniciar o FISCAL.MZ 2.0

echo "🚀 FISCAL.MZ 2.0 - Sistema de Gestão Fiscal"
echo "============================================"
echo ""

# Verificar PostgreSQL
echo "📡 Verificando PostgreSQL..."
if pg_isready -h localhost -p 5433 > /dev/null 2>&1; then
    echo "   ✅ PostgreSQL conectado"
else
    echo "   ⚠️  Iniciando PostgreSQL via Docker..."
    docker-compose up -d postgres
    sleep 5
fi

echo ""
echo "📦 Iniciando Backend (NestJS)..."
cd backend-nestjs
npm run start:dev &
BACKEND_PID=$!
cd ..

echo "🌐 Iniciando Frontend (React + Vite)..."
cd web-desktop
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo "✅ Sistema iniciado com sucesso!"
echo ""
echo "🔗 Acesse:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo "   API Docs: http://localhost:3000/api/docs"
echo ""
echo "🔑 Login de teste:"
echo "   Email: admin@abc.co.mz"
echo "   Senha: admin123"
echo ""
echo "📋 Funcionalidades disponíveis:"
echo "   • Gestão de Stock (/stock)"
echo "   • Notificações em tempo real (🔔)"
echo "   • Cotações (/quotes)"
echo "   • Produtos (/products)"
echo "   • Clientes (/clients)"
echo "   • Pagamentos (/payments)"
echo ""
echo "⚠️  Pressione CTRL+C para parar"
echo "============================================"

wait
