#!/usr/bin/env bash
# ===============================================================
# 🔥 AI Shorts Generator — Start Script (Top 0.01% version)
# Author: Théo
# Description: Boot script with ultra-reliable build & start flow
# ===============================================================

set -euo pipefail
IFS=$'\n\t'

# --- Colors for clarity ---
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m"

log() {
  echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

error_exit() {
  echo -e "${RED}[ERROR]${NC} $1"
  exit 1
}

# --- 1️⃣ Environment setup ---
log "🔧 Checking environment variables..."
export NODE_ENV=production
export PYTHONUNBUFFERED=1
export PATH="$PATH:/usr/local/bin"

if [ ! -f ".env" ]; then
  warn ".env file not found — using Render environment variables only"
else
  log "✅ .env file found — loading environment"
  set -a
  source .env
  set +a
fi

# --- 2️⃣ Node version check ---
log "🔍 Node.js version: $(node -v)"
log "🔍 NPM version: $(npm -v)"

# --- 3️⃣ Python setup ---
log "🐍 Setting up Python environment..."
python3 -m venv .venv || warn "Could not create venv, using system Python"
source .venv/bin/activate 2>/dev/null || warn "No venv detected — fallback to system Python"

log "⬆️ Upgrading pip & installing dependencies..."
python3 -m pip install --upgrade pip setuptools wheel > /dev/null 2>&1 || warn "pip upgrade failed"
if [ -f "requirements.txt" ]; then
  python3 -m pip install -r requirements.txt --no-cache-dir > /dev/null 2>&1 || warn "Some Python deps failed, continuing..."
else
  warn "No requirements.txt found, skipping Python deps"
fi

# --- 4️⃣ Node.js dependencies ---
log "📦 Installing Node dependencies..."
npm ci --omit=dev --no-audit --no-fund || npm install --omit=dev --no-audit --no-fund || error_exit "Failed to install Node modules"

# --- 5️⃣ Build verification ---
if [ -f "build.js" ]; then
  log "🛠 Running custom build script..."
  node build.js || warn "Build script failed, skipping..."
else
  log "⚙️ No build script found — skipping build"
fi

# --- 6️⃣ AI Shorts Generator startup ---
log "🚀 Starting AI Shorts Generator..."
if [ -f "index.js" ]; then
  node index.js
else
  error_exit "❌ index.js not found. Cannot start server."
fi

# --- 7️⃣ Auto-restart protection ---
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  warn "Server exited with code $EXIT_CODE — restarting in 3 seconds..."
  sleep 3
  exec "$0"
fi
