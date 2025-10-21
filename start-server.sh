#!/bin/bash
# 🚀 AI Shorts Generator — Ultra-stable start script, Top 0.1%
# Author: Théo
# Usage: bash start-server.sh

set -e  # Stop script on first error
set -o pipefail

# ========= CONFIGURATION =========
NODE_PORT=${PORT:-3000}
PYTHON_ENV_DIR="./tts-env"
LOG_DIR="./logs"
UPLOADS_DIR="./uploads"
OUTPUT_DIR="./output"
ENV_FILE="./.env"
NVM_DIR="$HOME/.nvm"

# ========= COLORS =========
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🌟 [AI Shorts Generator] Starting ultra-stable environment...${NC}"

# ========= CREATE FOLDERS =========
mkdir -p $UPLOADS_DIR $OUTPUT_DIR $LOG_DIR
echo -e "${GREEN}📂 Directories ready: $UPLOADS_DIR, $OUTPUT_DIR, $LOG_DIR${NC}"

# ========= CHECK ENV FILE =========
if [ ! -f $ENV_FILE ]; then
    echo -e "${YELLOW}⚠️  Warning: $ENV_FILE not found. Creating default .env file${NC}"
    touch $ENV_FILE
    echo "# Add your TTS keys and configs here" > $ENV_FILE
fi

# ========= NODE DEPENDENCIES =========
echo -e "${CYAN}📦 Installing/updating Node.js dependencies...${NC}"
npm install || {
    echo -e "${RED}❌ Node dependencies installation failed${NC}"
    exit 1
}

# Check nodemon
if ! command -v nodemon &> /dev/null; then
    echo -e "${YELLOW}⚡ nodemon not found, installing globally...${NC}"
    npm install -g nodemon
fi

# ========= PYTHON TTS ENV =========
echo -e "${CYAN}🐍 Setting up Python virtual environment for TTS...${NC}"
python3 -m venv $PYTHON_ENV_DIR
source $PYTHON_ENV_DIR/bin/activate
pip install --upgrade pip setuptools wheel
if [ -f requirements.txt ]; then
    pip install -r requirements.txt
fi
deactivate
echo -e "${GREEN}✅ Python TTS environment ready${NC}"

# ========= CHECK TTS KEYS =========
source $ENV_FILE
if [ -z "$PLAYAI_TTS_KEY" ]; then
    echo -e "${YELLOW}⚠️ PLAYAI_TTS_KEY not defined, fallback to Google TTS enabled${NC}"
fi

# ========= LAUNCH SERVER =========
echo -e "${CYAN}🔗 Launching Node.js server on port $NODE_PORT...${NC}"
export PORT=$NODE_PORT

# Start with nodemon if in dev, else node
if [ "$1" == "dev" ]; then
    nodemon index.js --watch index.js --watch server
else
    node index.js
fi

echo -e "${GREEN}🚀 Server launched successfully!${NC}"
