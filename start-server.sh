#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

echo "🌟 [AI Shorts Generator] Démarrage ultra-stable..."

# -------------------------
# Vérification dossiers
# -------------------------
for dir in "./output" "./uploads"; do
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    echo "📌 Création du dossier $dir"
  else
    echo "📌 Dossier $dir prêt"
  fi
done

# -------------------------
# Node.js deps
# -------------------------
echo "📦 Installation des dépendances Node.js..."
npm install
if ! command -v nodemon &> /dev/null; then
  echo "⚡ nodemon non trouvé, installation globale..."
  npm install -g nodemon
fi

# -------------------------
# Python env
# -------------------------
PY_ENV="./tts-env"
if [ ! -d "$PY_ENV" ]; then
  echo "🐍 Création de l'environnement Python TTS..."
  python3 -m venv "$PY_ENV"
fi

echo "🔄 Activation de l'environnement Python..."
source "$PY_ENV/bin/activate"

echo "📦 Mise à jour pip, setuptools et wheel..."
python3 -m pip install --upgrade pip setuptools wheel

echo "📦 Installation des dépendances Python..."
pip install -r requirements.txt

# -------------------------
# Gestion du port Render
# -------------------------
PORT="${PORT:-3000}"
echo "🔗 Serveur configuré pour le port $PORT"

# -------------------------
# Lancement serveur
# -------------------------
echo "🔄 Lancement serveur Node.js + TTS..."
if command -v nodemon &> /dev/null; then
  nodemon index.js
else
  node index.js
fi
