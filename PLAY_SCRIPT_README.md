# 🚀 Script de Automação - Sensplay Dev Server

## Como usar

Na raiz do projeto, execute:

```bash
./play sensi play
```

Isso iniciará:
- ✅ **Backend** na porta **8080** (Spring Boot)
- ✅ **Frontend** na porta **3000** (Vite)

## Comandos disponíveis

```bash
# Inicia backend e frontend
./play sensi play

# Para os servidores
./play stop

# Mostra logs em tempo real
./play logs

# Mostra esta mensagem de ajuda
./play help
```

## Configurações

- **Frontend**: Vite dev server → porta 3000
  - URL Landing: `http://localhost:3000/1-pages/1-index.html`
  - URL Home: `http://localhost:3000/1-pages/7-home.html`
  - URL Filmes: `http://localhost:3000/1-pages/5-filmes.html`
  - Hot reload automático
  - Proxy automático de `/api/*` para `http://localhost:8080`

- **Backend**: Spring Boot → porta 8080
  - Espera 25 segundos para inicializar
  - Endpoint de teste: `http://localhost:8080/api/movies/popular`

## Troubleshooting

### Porta em uso
Se a porta 3000 estiver ocupada, o Vite automaticamente tenta a próxima porta disponível.

### Logs
Para monitorar os logs em outro terminal:
```bash
# Backend
tail -f /tmp/backend.log

# Frontend
tail -f /tmp/frontend.log
```

### Parar manualmente
```bash
./play stop
# ou
kill -9 <PID>
```

---
**Desenvolvido para Sensplay** 🎬
