#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

echo "🚀 [AI Shorts Generator] Déploiement ultra-stable — Top 0,1%"

# -------------------- Fonctions utils --------------------
log() { echo -e "📌 [$(date '+%Y-%m-%d %H:%M:%S')] $1"; }
error_exit() { echo -e "❌ ERREUR: $1"; exit 1; }

# -------------------- Vérification Node --------------------
NODE_VERSION_REQUIRED=20
NODE_VERSION_CURRENT=$(node -v | cut -d v -f 2 | cut -d . -f 1 || echo "0")
if [ "$NODE_VERSION_CURRENT" -lt "$NODE_VERSION_REQUIRED" ]; then
    error_exit "Node.js $NODE_VERSION_REQUIRED+ requis. Version actuelle : $NODE_VERSION_CURRENT"
fi

# -------------------- Création dossiers --------------------
OUTPUT_DIR="./output"
UPLOADS_DIR="./uploads"
mkdir -p "$OUTPUT_DIR" "$UPLOADS_DIR"
log "Dossiers prêts : $OUTPUT_DIR, $UPLOADS_DIR"

# -------------------- Installation Node --------------------
log "📦 Installation des dépendances Node.js..."
npm install --legacy-peer-deps

# -------------------- Vérification Nodemon --------------------
if ! command -v nodemon &>/dev/null; then
    log "⚡ nodemon non trouvé, installation globale..."
    npm install -g nodemon
fi

# -------------------- Setup Python TTS --------------------
PYTHON_ENV="./tts-env"
if [ ! -d "$PYTHON_ENV" ]; then
    log "🐍 Création de l'environnement Python TTS..."
    python3 -m venv "$PYTHON_ENV"
fi

log "🔄 Activation de l'environnement Python..."
source "$PYTHON_ENV/bin/activate"
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt || log "⚠️ Certaines dépendances Python ont échoué. Vérifie requirements.txt"

# -------------------- Check variables d'environnement --------------------
[ -z "${PORT:-}" ] && export PORT=3000
log "🔗 Serveur configuré pour le port $PORT"
[ -z "${GROQ_API_KEY:-}" ] && log "⚠️ GROQ_API_KEY non défini dans .env"
[ -z "${PLAYAI_TTS_KEY:-}" ] && log "⚠️ PLAYAI_TTS_KEY non défini dans .env"

# -------------------- Monitoring et logs --------------------
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/server_$(date '+%Y%m%d_%H%M%S').log"
log "📄 Logs vers : $LOG_FILE"

# -------------------- Auto-restart (top 0,1%) --------------------
restart_server() {
    while true; do
        log "🔄 Lancement serveur Node.js..."
        node index.js >> "$LOG_FILE" 2>&1
        log "⚠️ Serveur arrêté. Redémarrage automatique dans 3s..."
        sleep 3
    done
}

# -------------------- Final startup --------------------
restart_server
