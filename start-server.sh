#!/bin/bash

# ===============================================
# Start Server Script - AI Shorts Generator (Prod Ready)
# Node.js + Python TTS
# Logs centralisés dans logs/server_YYYYMMDD_HHMMSS.log
# ===============================================

set -e  # Stop le script si une commande échoue
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# -------------------------------
# Logs
# -------------------------------
mkdir -p ./logs
LOG_FILE="./logs/server_$(date +%Y%m%d_%H%M%S).log"
touch $LOG_FILE

echo -e "${GREEN}🚀 Démarrage du serveur AI Shorts Generator...${NC}" | tee -a $LOG_FILE

# -------------------------------
# 1️⃣ Vérifier Node.js et npm
# -------------------------------
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé !${NC}" | tee -a $LOG_FILE
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé !${NC}" | tee -a $LOG_FILE
    exit 1
fi

# -------------------------------
# 2️⃣ Vérifier Python3 et pip3
# -------------------------------
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 non trouvé !${NC}" | tee -a $LOG_FILE
    exit 1
fi

if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}❌ pip3 non trouvé !${NC}" | tee -a $LOG_FILE
    exit 1
fi

# -------------------------------
# 3️⃣ Installer les dépendances Node.js
# -------------------------------
echo -e "${GREEN}📦 Installation des dépendances Node.js...${NC}" | tee -a $LOG_FILE
npm install 2>&1 | tee -a $LOG_FILE

# -------------------------------
# 4️⃣ Activer l'environnement Python TTS
# -------------------------------
if [ -d "./tts-env" ]; then
    echo -e "${GREEN}🐍 Activation de l'environnement Python TTS...${NC}" | tee -a $LOG_FILE
    source ./tts-env/bin/activate
else
    echo -e "${RED}❌ Environnement Python TTS non trouvé !${NC}" | tee -a $LOG_FILE
    echo "💡 Crée-le avec : python3 -m venv tts-env && pip3 install -r requirements.txt" | tee -a $LOG_FILE
    exit 1
fi

# -------------------------------
# 5️⃣ Installer nodemon local si absent
# -------------------------------
if ! command -v nodemon &> /dev/null; then
    echo -e "${YELLOW}⚡ nodemon non trouvé, installation locale...${NC}" | tee -a $LOG_FILE
    npm install --save-dev nodemon 2>&1 | tee -a $LOG_FILE
fi

# -------------------------------
# 6️⃣ Lancer Node.js + Python TTS en background
# -------------------------------
echo -e "${GREEN}🔄 Lancement du serveur Node.js + TTS...${NC}" | tee -a $LOG_FILE

# Node.js
npx nodemon main.js --watch . --ext js,json --delay 1 >> $LOG_FILE 2>&1 &
NODE_PID=$!
echo -e "${GREEN}Node.js PID: $NODE_PID${NC}" | tee -a $LOG_FILE

# Python TTS (si tu as un script TTS)
if [ -f "./tts_script.py" ]; then
    python3 tts_script.py >> $LOG_FILE 2>&1 &
    TTS_PID=$!
    echo -e "${GREEN}Python TTS PID: $TTS_PID${NC}" | tee -a $LOG_FILE
fi

# -------------------------------
# 7️⃣ Trap pour arrêt propre
# -------------------------------
trap "echo -e '${RED}⛔ Arrêt du serveur...${NC}'; kill $NODE_PID ${TTS_PID:-}; exit 0" SIGINT SIGTERM

# -------------------------------
# 8️⃣ Message final
# -------------------------------
echo -e "${GREEN}✅ Serveur lancé ! Logs dans ${LOG_FILE}${NC}" | tee -a $LOG_FILE
echo -e "${GREEN}Pour stopper le serveur : kill $NODE_PID ${TTS_PID:-}${NC}" | tee -a $LOG_FILE

# Keep script running pour trap
wait
