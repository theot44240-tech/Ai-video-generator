#!/bin/bash

# =========================================================
# Start Server Script - AI Shorts Generator (Prod Ready)
# Node.js + Python TTS - Logs centralisés et sécurité
# =========================================================

# --- Couleurs ---
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# --- Logs ---
LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/server.log"
mkdir -p "$LOG_DIR"
touch "$LOG_FILE"

echo -e "${GREEN}🚀 Démarrage du serveur AI Shorts Generator...${NC}" | tee -a "$LOG_FILE"

# =========================================================
# 1️⃣ Vérifier Node.js et npm
# =========================================================
if ! command -v node &>/dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé !${NC}" | tee -a "$LOG_FILE"
    exit 1
fi

if ! command -v npm &>/dev/null; then
    echo -e "${RED}❌ npm n'est pas installé !${NC}" | tee -a "$LOG_FILE"
    exit 1
fi

# =========================================================
# 2️⃣ Installer les dépendances Node.js
# =========================================================
echo -e "${GREEN}📦 Installation des dépendances Node.js...${NC}" | tee -a "$LOG_FILE"
npm install --silent 2>&1 | tee -a "$LOG_FILE"

# =========================================================
# 3️⃣ Vérifier Python et pip
# =========================================================
PYTHON_CMD="python3"
if ! command -v $PYTHON_CMD &>/dev/null; then
    echo -e "${RED}❌ Python3 non trouvé !${NC}" | tee -a "$LOG_FILE"
    exit 1
fi

if ! command -v pip3 &>/dev/null; then
    echo -e "${RED}❌ pip3 non trouvé !${NC}" | tee -a "$LOG_FILE"
    exit 1
fi

# =========================================================
# 4️⃣ Créer / activer l'environnement Python TTS
# =========================================================
VENV_DIR="./tts-env"
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}🐍 Création de l'environnement Python TTS...${NC}" | tee -a "$LOG_FILE"
    $PYTHON_CMD -m venv "$VENV_DIR"
    source "$VENV_DIR/bin/activate"
    pip3 install --upgrade pip 2>&1 | tee -a "$LOG_FILE"
    pip3 install -r requirements.txt 2>&1 | tee -a "$LOG_FILE"
else
    echo -e "${GREEN}🐍 Activation de l'environnement Python TTS...${NC}" | tee -a "$LOG_FILE"
    source "$VENV_DIR/bin/activate"
fi

# =========================================================
# 5️⃣ Installer nodemon si absent
# =========================================================
if ! command -v nodemon &>/dev/null; then
    echo -e "${YELLOW}⚡ nodemon non trouvé, installation globale...${NC}" | tee -a "$LOG_FILE"
    npm install -g nodemon --silent 2>&1 | tee -a "$LOG_FILE"
fi

# =========================================================
# 6️⃣ Lancer le serveur Node.js + TTS en background avec logs
# =========================================================
echo -e "${GREEN}🔄 Lancement du serveur Node.js + TTS...${NC}" | tee -a "$LOG_FILE"

# Lancement sécurisé avec redirection des logs
nodemon index.js --watch . --ext js,json --delay 1 >>"$LOG_FILE" 2>&1 &

NODE_PID=$!
echo -e "${GREEN}✅ Serveur lancé ! PID: $NODE_PID${NC}" | tee -a "$LOG_FILE"
echo -e "${GREEN}📄 Logs : $LOG_FILE${NC}" | tee -a "$LOG_FILE"
echo -e "${GREEN}Pour stopper le serveur : kill $NODE_PID${NC}" | tee -a "$LOG_FILE"

# =========================================================
# 7️⃣ Lancer un script Python TTS si besoin (optionnel)
# =========================================================
# Exemple : python3 tts_script.py >>"$LOG_FILE" 2>&1 &
