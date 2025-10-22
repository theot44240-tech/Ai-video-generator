#!/usr/bin/env bash
# ============================================================
# ⚡ AI SHORTS GENERATOR — START SCRIPT (OPTIMIZED)
# Features:
#  - Node/npm checks & auto-install
#  - Optional nodemon dev mode
#  - Python venv + pip install
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
APP_ENTRY="${APP_ENTRY:-server.js}"
NODE_ENV="${NODE_ENV:-production}"
DEV_MODE="${DEV_MODE:-0}"
PORT="${PORT:-${RENDER_PORT:-3000}}"
LOG_DIR="${LOG_DIR:-./logs}"
PY_VENV_DIR="${PY_VENV_DIR:-./tts-env}"
REQUIREMENTS="${REQUIREMENTS:-requirements.txt}"
MAX_RESTARTS="${MAX_RESTARTS:-8}"
RESTART_BACKOFF_BASE_MS="${RESTART_BACKOFF_BASE_MS:-2000}"
MAX_LOG_SIZE="${MAX_LOG_SIZE:-10485760}" # 10MB
REQUIRED_ENVS=("GROQ_API_KEY")

timestamp(){ date +"%Y-%m-%d %H:%M:%S"; }
log(){ printf "%s | %s\n" "$(timestamp)" "$*"; }
ensure_dir(){ [ -d "$1" ] || mkdir -p "$1"; }
command_exists(){ command -v "$1" >/dev/null 2>&1; }

rotate_logs_if_needed(){
  ensure_dir "$LOG_DIR"
  LOG_FILE="$LOG_DIR/server.log"
  [ -f "$LOG_FILE" ] || return
  local size
  size=$(stat -c%s "$LOG_FILE" 2>/dev/null || stat -f%z "$LOG_FILE" 2>/dev/null || echo 0)
  [ "$size" -lt "$MAX_LOG_SIZE" ] && return
  local archive="$LOG_DIR/server-$(date +%Y%m%d-%H%M%S).log.gz"
  log "🔁 Rotating log ($size bytes) -> $archive"
  gzip -c "$LOG_FILE" > "$archive" || true
  : > "$LOG_FILE"
}

# -------------------
# PRECHECKS
# -------------------
log "🌟 Starting AI Shorts Generator"
command_exists node || { log "❌ Node not found"; exit 1; }
command_exists npm || { log "❌ NPM not found"; exit 1; }
log "✅ Node $(node -v), NPM $(npm -v) detected"

# Check envs
missing=()
for v in "${REQUIRED_ENVS[@]}"; do [ -z "${!v:-}" ] && missing+=("$v"); done
[ "${#missing[@]}" -gt 0 ] && log "⚠️ Missing env vars: ${missing[*]}"

# Node deps
if [ -f package-lock.json ]; then
  log "📦 Installing Node deps (npm ci)"
  npm ci --no-audit --no-fund || npm install --no-audit --no-fund
else
  log "📦 Running npm install"
  npm install --no-audit --no-fund
fi

# Python venv
if command_exists python3 || command_exists python; then
  [ -d "$PY_VENV_DIR" ] || (python3 -m venv "$PY_VENV_DIR" || python -m venv "$PY_VENV_DIR")
  source "$PY_VENV_DIR/bin/activate" || true
  [ -f "$REQUIREMENTS" ] && { 
    log "⬆️ Installing Python requirements"
    pip install --upgrade pip setuptools wheel >/dev/null 2>&1 || true
    pip install -r "$REQUIREMENTS" || log "⚠️ pip install failed, continuing"
  }
else
  log "ℹ️ Python not found, skipping venv"
fi

# -------------------
# SERVER LOOP
# -------------------
restart_count=0
graceful_shutdown(){ log "🛑 Shutdown signal received"; exit 0; }
trap graceful_shutdown SIGINT SIGTERM

while true; do
  rotate_logs_if_needed
  export PORT
  log "--- App attempt $((restart_count+1))/$MAX_RESTARTS ---"
  
  if [ "$DEV_MODE" -eq 1 ] && command_exists nodemon; then
    log "🛠️ Starting DEV nodemon $APP_ENTRY"
    exec nodemon --signal SIGINT "$APP_ENTRY"
  else
    log "▶️ Launching Node $APP_ENTRY"
    exec node "$APP_ENTRY"
  fi

  exit_code=$?
  [ "$exit_code" -eq 0 ] && { log "✅ App exited cleanly"; exit 0; }

  restart_count=$((restart_count+1))
  log "❌ App crashed (exit code $exit_code)"
  [ "$restart_count" -ge "$MAX_RESTARTS" ] && { log "🚨 Max restarts reached"; exit $exit_code; }

  backoff_ms=$((RESTART_BACKOFF_BASE_MS * restart_count))
  jitter=$(( (RANDOM % 1000) + 200 ))
  sleep_sec=$(awk "BEGIN {printf \"%.1f\", (${backoff_ms}+${jitter})/1000}")
  log "⏳ Waiting ${sleep_sec}s before restart..."
  sleep "$sleep_sec"
done
