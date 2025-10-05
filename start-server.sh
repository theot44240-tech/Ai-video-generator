#!/bin/bash
# =========================================
# AI Shorts Generator – Script de démarrage
# Optimisé top 0,1% pour Codespaces / Render
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

# Vérifie que HF_TOKEN est défini
if [ -z "$HF_TOKEN" ]; then
  echo "❌ ERREUR : HF_TOKEN non défini dans .env !"
  exit 1
fi

# Affiche les infos avant lancement
echo "🚀 Démarrage du serveur AI Shorts Generator..."
echo "📌 Port : $PORT"
echo "📌 Modèle : distilgpt2"

# Démarrage du serveur Node.js
node index.js

# Fin du script
echo "✅ Serveur lancé !"
