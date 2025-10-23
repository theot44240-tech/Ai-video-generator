#!/usr/bin/env bash
# ============================================
# 🚀 start-server.sh — AI Shorts Generator PRO
# ============================================

echo "=============================================="
echo "🌟 Booting AI Shorts Generator (TOP 0.1%)"
echo "=============================================="

export NODE_ENV=production
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1

echo "🔧 Node version: $(node -v)"
echo "🐍 Python version: $(python3 -V)"
echo "📦 NPM version: $(npm -v)"

# ---- Python venv ----
if [ ! -d "./tts-env" ]; then
  echo "📁 Creating Python venv..."
  python3 -m venv tts-env
fi

source tts-env/bin/activate

# ---- Python deps ----
if [ -f "requirements.txt" ]; then
  echo "⬆️ Installing Python deps..."
  pip install --upgrade pip > /dev/null 2>&1
  pip install -r requirements.txt --no-cache-dir > /dev/null 2>&1 || {
    echo "⚠️ Some Python packages failed to install (continuing anyway)."
  }
else
  echo "⚠️ No requirements.txt found, skipping Python deps."
fi

# ---- Start Node ----
echo "🚀 Starting Node backend..."
node server.js
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "⚡ Crash detected (code: $EXIT_CODE). Restarting in 5s..."
  sleep 5
  exec bash ./start-server.sh
fi
