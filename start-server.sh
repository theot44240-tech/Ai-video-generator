#!/bin/bash
set -euo pipefail

LOG_DIR="./logs"
OUTPUT_DIR="./output"
UPLOADS_DIR="./uploads"
PORT="${PORT:-3000}"

mkdir -p "$LOG_DIR" "$OUTPUT_DIR" "$UPLOADS_DIR"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/server_$TIMESTAMP.log"

echo "🌟 [AI Shorts Generator] Démarrage ultra-stable..." | tee -a "$LOG_FILE"
echo "📌 Dossiers prêts : $OUTPUT_DIR, $UPLOADS_DIR" | tee -a "$LOG_FILE"

# Node.js dependencies
echo "📦 Installation des dépendances Node.js..." | tee -a "$LOG_FILE"
if ! command -v nodemon >/dev/null 2>&1; then
    echo "⚡ nodemon non trouvé, installation globale..." | tee -a "$LOG_FILE"
    npm install -g nodemon
fi
npm install --legacy-peer-deps | tee -a "$LOG_FILE"

# Python TTS setup
PY_ENV="tts-env"
echo "🐍 Création de l'environnement Python TTS..." | tee -a "$LOG_FILE"
if [ ! -d "$PY_ENV" ]; then
    python3 -m venv "$PY_ENV"
fi

echo "🔄 Activation de l'environnement Python..." | tee -a "$LOG_FILE"
source "$PY_ENV/bin/activate"

echo "📦 Mise à jour pip et packages essentiels..." | tee -a "$LOG_FILE"
pip install --upgrade pip setuptools wheel | tee -a "$LOG_FILE"
pip install -r requirements.txt | tee -a "$LOG_FILE"

# TTS fallback check
if [ -z "${PLAYAI_TTS_KEY:-}" ]; then
    echo "⚠️ PLAYAI_TTS_KEY non défini, fallback Google TTS activé" | tee -a "$LOG_FILE"
else
    echo "🔑 PLAYAI_TTS_KEY détectée, PlayAI TTS activé" | tee -a "$LOG_FILE"
fi

# Start server
echo "🔗 Serveur configuré pour le port $PORT" | tee -a "$LOG_FILE"
echo "🔄 Lancement serveur Node.js + TTS..." | tee -a "$LOG_FILE"

nodemon index.js --watch index.js --watch server --ext js,json --delay 2 | tee -a "$LOG_FILE"
