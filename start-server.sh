#!/usr/bin/env bash
# ============================================================
# ⚡ AI SHORTS GENERATOR — START SCRIPT (LEVEL 99999999)
# Features:
#  - Node/npm checks & install
#  - Optional nodemon dev mode
#  - Python venv for TTS + pip install
#  - PORT detection (Render compatible)
#  - Log rotation + stdout/stderr streaming
#  - Graceful shutdown + restart backoff
# ============================================================

set -o errexit
set -o pipefail
set -o nounset

# -------------------
# CONFIG
# -------------------
APP_ENTRY=${APP_ENTRY:-"server.js"}
NODE_ENV=${NODE_ENV:-production}
DEV_MODE=${DEV_MODE:-0}               # 1=nodemon dev
PORT=${PORT:-${RENDER_PORT:-3000}}   # Render fallback
LOG_DIR=${LOG_DIR:-"./logs"}
PY_VENV_DIR=${PY_VENV_DIR:-"./tts-env"}
REQUIREMENTS=${REQUIREMENTS:-"requirements.txt"}
MAX_RESTARTS=${MAX_RESTARTS:-8}
RESTART_BACKOFF_BASE_MS=${RESTART_BACKOFF_BASE_MS:-2000}
MAX_LOG_SIZE=${MAX_LOG_SIZE:-10485760} # 10MB

# -------------------
# HELPERS
# -------------------
timestamp() { date +"%Y-%m-%d %H:%M:%S"; }
log() { printf "%s | %s\n" "$(timestamp)" "$*" ; }
ensure_dir() { [ -d "$1" ] || mkdir -p "$1"; }

rotate_logs_if_needed() {
  ensure_dir "$LOG_DIR"
  LOG_FILE="$LOG_DIR/server.log"
  if [ -f "$LOG_FILE" ]; then
    size=$(stat -c%s "$LOG_FILE" 2>/dev/null || stat -f%z "$LOG_FILE" 2>/dev/null || echo 0)
    if [ "$size" -ge "$MAX_LOG_SIZE" ]; then
      archive="$LOG_DIR/server-$(date +%Y%m%d-%H%M%S).log.gz"
      log "🔁 Rotating log (size=${size}) -> ${archive}"
      gzip -c "$LOG_FILE" > "$archive" || true
      : > "$LOG_FILE"
    fi
  fi
}

command_exists() { command -v "$1" >/dev/null 2>&1; }

# -------------------
# PRECHECKS
# -------------------
log "🌟 Starting AI Shorts Generator (LEVEL 99999999)"
log "Node env: $NODE_ENV, Dev mode: $DEV_MODE, Port: $PORT, App entry: $APP_ENTRY"

# Node & NPM
command_exists node || { log "❌ Node not found"; exit 1; }
command_exists npm || { log "❌ NPM not found"; exit 1; }
log "✅ Node $(node -v), NPM $(npm -v) detected"

# Validate required env vars
REQUIRED_ENVS=("GROQ_API_KEY")
missing=()
for v in "${REQUIRED_ENVS[@]}"; do
  [ -z "${!v:-}" ] && missing+=("$v")
done
if [ "${#missing[@]}" -gt 0 ]; then
  log "⚠️ Missing env vars: ${missing[*]} — some features may fail"
fi

# -------------------
# INSTALL NODE DEPS
# -------------------
if [ -f package-lock.json ]; then
  log "📦 Installing Node deps (npm ci)"
  npm ci --no-audit --no-fund || npm install --no-audit --no-fund
else
  log "📦 Running npm install"
  npm install --no-audit --no-fund
fi

# -------------------
# PYTHON VENV + REQUIREMENTS
# -------------------
if command_exists python3 || command_exists python; then
  [ -d "$PY_VENV_DIR" ] || (python3 -m venv "$PY_VENV_DIR" || python -m venv "$PY_VENV_DIR")
  source "$PY_VENV_DIR/bin/activate" || true
  if [ -f "$REQUIREMENTS" ]; then
    log "⬆️ Installing Python requirements"
    pip install --upgrade pip setuptools wheel >/dev/null 2>&1 || true
    pip install -r "$REQUIREMENTS" || log "⚠️ pip install failed, continuing"
  fi
else
  log "ℹ️ Python not found, skipping venv setup"
fi

# -------------------
# START SERVER FUNCTION
# -------------------
restart_count=0
start_node() {
  rotate_logs_if_needed
  export PORT
  if [ "$DEV_MODE" -eq 1 ] && command_exists nodemon; then
    log "🛠️ Starting (DEV) nodemon $APP_ENTRY"
    exec nodemon --signal SIGINT "$APP_ENTRY"
  else
    log "▶️ Launching Node $APP_ENTRY"
    exec node "$APP_ENTRY"
  fi
}

graceful_shutdown() {
  log "🛑 Shutdown signal received — exiting gracefully"
  sleep 1
  exit 0
}

trap 'graceful_shutdown' SIGINT SIGTERM

# -------------------
# MAIN LOOP: RESTART + BACKOFF
# -------------------
while true; do
  log "--- Starting app attempt $((restart_count+1))/$MAX_RESTARTS ---"
  start_node
  exit_code=$?
  if [ $exit_code -eq 0 ]; then
    log "✅ App exited cleanly"
    exit 0
  fi

  restart_count=$((restart_count+1))
  log "❌ App crashed with exit code $exit_code"

  if [ "$restart_count" -ge "$MAX_RESTARTS" ]; then
    log "🚨 Max restart attempts reached, exiting"
    exit $exit_code
  fi

  backoff_ms=$((RESTART_BACKOFF_BASE_MS * restart_count))
  jitter=$(( (RANDOM % 1000) + 200 ))
  sleep_sec=$(awk "BEGIN {printf \"%.1f\", (${backoff_ms}+${jitter})/1000}")
  log "⏳ Waiting ${sleep_sec}s before restart..."
  sleep "$sleep_sec"
done
