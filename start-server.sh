#!/bin/bash

# =========================================================
# Start Server Script - AI Shorts Generator (Ultra-Perf)
# Node.js + Python TTS - Auto-Restart + Logs Centralisés
# =========================================================

# --- Couleurs ---
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# --- Logs ---
LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/server.log"
mkdir -p "$LOG_DIR"
touch "$LOG_FILE"

log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') | $1" | tee -a "$LOG_FILE"
}

log "${GREEN}🚀 Démarrage du serveur AI Shorts Generator...${NC}"

# =========================================================
# 1️⃣ Vérifier Node.js et npm
# =========================================================
if ! command -v node &>/dev/null; then
    log "${RED}❌ Node.js n'est pas installé !${NC}"
    exit 1
fi

if ! command -v npm &>/dev/null; then
    log "${RED}❌ npm n'est pas installé !${NC}"
    exit 1
fi

# =========================================================
# 2️⃣ Installer les dépendances Node.js
# =========================================================
log "${GREEN}📦 Installation des dépendances Node.js...${NC}"
npm install --silent 2>&1 | tee -a "$LOG_FILE"

# =========================================================
# 3️⃣ Vérifier Python et pip
# =========================================================
PYTHON_CMD="python3"
if ! command -v $PYTHON_CMD &>/dev/null; then
    log "${RED}❌ Python3 non trouvé !${NC}"
    exit 1
fi

if ! command -v pip3 &>/dev/null; then
    log "${RED}❌ pip3 non trouvé !${NC}"
    exit 1
fi

# =========================================================
# 4️⃣ Créer / activer l'environnement Python TTS
# =========================================================
VENV_DIR="./tts-env"
if [ ! -d "$VENV_DIR" ]; then
    log "${YELLOW}🐍 Création de l'environnement Python TTS...${NC}"
    $PYTHON_CMD -m venv "$VENV_DIR"
    source "$VENV_DIR/bin/activate"
    pip3 install --upgrade pip 2>&1 | tee -a "$LOG_FILE"
    pip3 install -r requirements.txt 2>&1 | tee -a "$LOG_FILE"
else
    log "${GREEN}🐍 Activation de l'environnement Python TTS...${NC}"
    source "$VENV_DIR/bin/activate"
fi

# =========================================================
# 5️⃣ Installer nodemon si absent
# =========================================================
if ! command -v nodemon &>/dev/null; then
    log "${YELLOW}⚡ nodemon non trouvé, installation globale...${NC}"
    npm install -g nodemon --silent 2>&1 | tee -a "$LOG_FILE"
fi

# =========================================================
# 6️⃣ Lancement auto-restart du serveur
# =========================================================
start_server() {
    log "${CYAN}🔄 Lancement du serveur Node.js + TTS...${NC}"
    nodemon index.js --watch . --ext js,json --delay 1 >>"$LOG_FILE" 2>&1 &
    NODE_PID=$!
    log "${GREEN}✅ Serveur lancé ! PID: $NODE_PID${NC}"
    log "${GREEN}📄 Logs : $LOG_FILE${NC}"
    wait $NODE_PID
    log "${RED}⚠️ Serveur arrêté ! Tentative de relance dans 5s...${NC}"
    sleep 5
}

# Boucle infinie pour auto-restart
while true; do
    start_server
done
