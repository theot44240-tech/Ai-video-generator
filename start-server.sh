#!/bin/bash
# 🚀 AI Shorts Generator — Start Server v600%
# Top 0,1% Dev Workflow: Auto TTS, Montage Vidéo, Logs, Fallback, Restart, Alerts

set -euo pipefail
IFS=$'\n\t'

# ---------------- CONFIG ----------------
PORT=${PORT:-3000}
OUTPUT_DIR=${OUTPUT_DIR:-"./output"}
UPLOAD_DIR=${UPLOAD_DIR:-"./uploads"}
LOG_DIR=${LOG_DIR:-"./logs"}
PY_ENV=${PY_ENV:-"./tts-env"}

mkdir -p "$OUTPUT_DIR" "$UPLOAD_DIR" "$LOG_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/server_$TIMESTAMP.log"

# ---------------- LOGGING ----------------
log() {
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1" | tee -a "$LOG_FILE"
}

log "🌟 Lancement AI Shorts Generator v600%"

# ---------------- NODE DEPENDENCIES ----------------
log "📦 Vérification des dépendances Node.js..."
npm install || log "⚠️ npm install a échoué, tentative de réparation..." && npm audit fix --force || true

# Vérifier nodemon
if ! command -v nodemon &>/dev/null; then
    log "⚡ nodemon non trouvé, installation globale..."
    npm install -g nodemon
fi

# ---------------- PYTHON TTS ENV ----------------
log "🐍 Création/activation environnement Python TTS..."
python3 -m venv "$PY_ENV"
source "$PY_ENV/bin/activate"
pip install --upgrade pip setuptools wheel

if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
fi
log "✅ Python TTS prêt"

# ---------------- MONITOR + RESTART ----------------
restart_server() {
    log "🔄 Redémarrage serveur Node.js..."
    sleep 2
    exec "$0" "$@"
}

trap 'log "❌ Crash détecté, redémarrage..."; restart_server' SIGINT SIGTERM ERR

# ---------------- ALERTS SLACK/EMAIL ----------------
send_alert() {
    local msg="$1"
    if [ -n "${SLACK_WEBHOOK:-}" ]; then
        curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"[AI Shorts Generator Alert] $msg\"}" $SLACK_WEBHOOK
    fi
    if [ -n "${ALERT_EMAIL:-}" ]; then
        echo "$msg" | mail -s "[AI Shorts Generator Alert]" "$ALERT_EMAIL"
    fi
}

# ---------------- START SERVER ----------------
log "🔗 Lancement serveur Node.js sur le port $PORT"
PORT=$PORT nodemon index.js >>"$LOG_FILE" 2>&1 &
SERVER_PID=$!

log "✅ Serveur lancé avec PID $SERVER_PID"
wait $SERVER_PID
