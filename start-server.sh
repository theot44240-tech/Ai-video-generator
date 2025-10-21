#!/bin/bash
# 🚀 Start-Server Ultra-Pro — AI Shorts Generator Top 0,1%

set -euo pipefail
IFS=$'\n\t'

echo "🌟 [AI Shorts Generator] Démarrage ultra-stable..."

# -------------------- CONFIG --------------------
OUTPUT_DIR="./output"
UPLOAD_DIR="./uploads"
PYTHON_ENV="./tts-env"

mkdir -p "$OUTPUT_DIR" "$UPLOAD_DIR"
echo "📌 Dossiers prêts : $OUTPUT_DIR, $UPLOAD_DIR"

# -------------------- NODE --------------------
if ! command -v node &> /dev/null; then
  echo "⚡ Node.js non trouvé, installation..."
  curl -fsSL https://deb.nodesource.com/setup_25.x | bash -
  apt-get install -y nodejs
fi

echo "📦 Installation des dépendances Node.js..."
npm install

# -------------------- NODE GLOBAL --------------------
if ! command -v nodemon &> /dev/null; then
  echo "⚡ nodemon non trouvé, installation globale..."
  npm install -g nodemon
fi

# -------------------- PYTHON TTS --------------------
echo "🐍 Création de l'environnement Python TTS..."
python3 -m venv "$PYTHON_ENV"
source "$PYTHON_ENV/bin/activate"

echo "🔄 Activation de l'environnement Python..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# -------------------- VERIFICATION KEYS --------------------
if [[ -z "${PLAYAI_TTS_KEY:-}" ]]; then
  echo "⚠️ PLAYAI_TTS_KEY non défini, fallback Google TTS activé"
fi

if [[ -z "${GROQ_API_KEY:-}" ]]; then
  echo "⚠️ GROQ_API_KEY non défini, certaines fonctionnalités AI désactivées"
fi

# -------------------- PORT CHECK --------------------
PORT="${PORT:-3000}"
echo "🔗 Serveur configuré pour le port $PORT"

# -------------------- LAUNCH --------------------
echo "🔄 Lancement serveur Node.js + TTS..."
nodemon index.js --watch index.js --watch ./server --delay 500ms --exec "node index.js"

echo "✅ Serveur lancé ! Logs vers ./logs/server_$(date +%Y%m%d_%H%M%S).log"
