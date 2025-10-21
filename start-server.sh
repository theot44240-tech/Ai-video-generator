#!/bin/bash
# =============================================
# 🚀 AI Shorts Generator – Render Ultra-Stable
# =============================================

set -e  # Arrêt immédiat si une commande échoue
set -o pipefail

echo "🌟 Démarrage du serveur AI Shorts Generator..."

# --- 1️⃣ Préparer les dossiers ---
OUTPUT_DIR="${OUTPUT_DIR:-./output}"
UPLOADS_DIR="./uploads"

mkdir -p "$OUTPUT_DIR" "$UPLOADS_DIR"
echo "📁 Dossiers prêts : $OUTPUT_DIR, $UPLOADS_DIR"

# --- 2️⃣ Installer les dépendances Node.js ---
echo "📦 Installation des dépendances Node.js..."
npm install --no-audit --silent

# --- 3️⃣ Installer Nodemon global si absent (pour dev) ---
if ! command -v nodemon >/dev/null 2>&1; then
  echo "⚡ nodemon non trouvé, installation globale..."
  npm install -g nodemon
fi

# --- 4️⃣ Installer l'environnement Python pour TTS ---
if [ ! -d "./tts-env" ]; then
  echo "🐍 Création de l'environnement Python TTS..."
  python3 -m venv tts-env
fi

echo "🔄 Activation de l'environnement Python et installation des packages TTS..."
source ./tts-env/bin/activate
pip install --upgrade pip setuptools wheel >/dev/null
pip install -r requirements.txt >/dev/null
deactivate

# --- 5️⃣ Lancer le serveur Node.js en foreground ---
PORT="${PORT:-3000}"
echo "🔗 Lancement du serveur Node.js sur le port $PORT..."
exec node index.js
