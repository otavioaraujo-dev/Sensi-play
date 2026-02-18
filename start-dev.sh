#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Sensplay Development Server${NC}"
echo "================================"
echo ""

# Parar processos antigos
echo -e "${YELLOW}🛑 Parando processos anteriores...${NC}"
pkill -f "java -jar" 2>/dev/null || true
pkill -f "http-server" 2>/dev/null || true
sleep 2

# Variáveis
BACKEND_DIR="/Users/migueldasensi/Desktop/sensi play/Sensi-play/1-Sensiplay/2-backend"
FRONTEND_DIR="/Users/migueldasensi/Desktop/sensi play/Sensi-play/1-Sensiplay/1-frontend"
BACKEND_PID=""
FRONTEND_PID=""

# Iniciar Backend
echo -e "${YELLOW}⚙️  Iniciando Backend (porta 8080)...${NC}"
cd "$BACKEND_DIR"
mvn clean spring-boot:run > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend PID: $BACKEND_PID${NC}"
echo ""

# Aguardar backend iniciar
echo -e "${YELLOW}⏳ Aguardando backend ficar pronto (25 segundos)...${NC}"
sleep 25

# Testar backend
echo -e "${YELLOW}🔍 Testando backend...${NC}"
if curl -s http://localhost:8080/api/movies/popular > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend respondendo em http://localhost:8080${NC}"
else
    echo -e "${YELLOW}⚠️  Backend pode ainda estar inicializando...${NC}"
fi
echo ""

# Iniciar Frontend (Vite dev server na porta 3000)
echo -e "${YELLOW}🌐 Iniciando Frontend (porta 3000 via Vite)...${NC}"
cd "$FRONTEND_DIR"

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências (npm install)...${NC}"
    npm install > /tmp/frontend-install.log 2>&1
fi

# Inicia Vite em background e redireciona logs
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend PID: $FRONTEND_PID${NC}"
echo ""

# Instruções
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Sensplay Dev Server iniciado!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📍 URLs:${NC}"
echo -e "   🏠 Home Page:      ${GREEN}http://localhost:3000/1-pages/7-home.html${NC}"
echo -e "   🎬 Filmes:        ${GREEN}http://localhost:3000/1-pages/5-filmes.html${NC}"
echo -e "   🔍 API Backend:   ${GREEN}http://localhost:8080/api/movies/popular${NC}"
echo ""
echo -e "${BLUE}📋 Logs:${NC}"
echo -e "   Backend:  ${YELLOW}tail -f /tmp/backend.log${NC}"
echo -e "   Frontend: ${YELLOW}tail -f /tmp/frontend.log${NC}"
echo ""
echo -e "${BLUE}🛑 Para parar:${NC}"
echo -e "   ${YELLOW}kill $BACKEND_PID $FRONTEND_PID${NC}"
echo ""
echo -e "${YELLOW}⏷ Pressione CTRL+C em qualquer terminal para interromper${NC}"
echo ""

# Manter script rodando
wait
