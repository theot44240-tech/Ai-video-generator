#!/bin/bash
# =========================================
# AI Shorts Generator – Script de démarrage
# Top 0,1% optimisation pour CodeSpaces / Render
# =========================================

# Port par défaut
PORT=${PORT:-3000}

# Libère automatiquement le port si déjà utilisé
PID=$(lsof -t -i :$PORT)
if [ -n "$PID" ]; then
  echo "⚠️ Port $PORT déjà utilisé par PID $PID. On tue le processus..."
  kill -9 $PID
  echo "✅ Processus tué."
fi

# Lancement du serveur Node.js
echo "🚀 Démarrage du serveur sur le port $PORT..."
node index.js
