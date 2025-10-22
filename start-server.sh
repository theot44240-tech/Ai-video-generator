#!/usr/bin/env bash
# ============================================================
# ⚡ AI SHORTS GENERATOR — START SCRIPT (TOP 0.1%)
# Features:
#  - Node/npm checks & auto-install
#  - Python venv + pip install (safe)
#  - PORT detection + readiness probe (Render-proof)
#  - Log rotation + stdout/stderr streaming
#  - Graceful shutdown + exponential backoff restarts
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

# -------------------
# UTILS
# -------------------
timestamp(){ date +"%Y-%m-%d %H:%M:%S"; }
log(){ printf "%s | %s\n" "$(timestamp)" "$*"; }
ensure_dir(){ [ -d "$1" ] || mkdir -p "$1"; }
command_exists(){ command -v "$1" >/dev/null 2>&1; }

rotate_logs_if_needed(){
  ensure_dir "$LOG_DIR"
  local LOG_FILE="$LOG_DIR/server.log"
  [ -f "$LOG_FILE" ] || return
  local size
  size=$(stat -c%s "$LOG_FILE" 2>/dev/null || stat -f%z "$LOG_FILE" 2>/dev/null || echo 0)
  [ "$size" -lt "$MAX_LOG_SIZE" ] && return
  local archive="$LOG_DIR/server-$(date +%Y%m%d-%H%M%S).log.gz"
  log "🔁 Rotating log ($size bytes) -> $archive"
  gzip -c "$LOG_FILE" > "$archive" || true
  : > "$LOG_FILE"
}

wait_for_port(){
  local max_wait=30
  local elapsed=0
  while ! nc -z 127.0.0.1 "$PORT" >/dev/null 2>&1; do
    sleep 1
    elapsed=$((elapsed+1))
    [ "$elapsed" -ge "$max_wait" ] && { log "🚨 Port $PORT not open after $max_wait seconds"; return 1; }
  done
  return 0
}

# -------------------
# PRECHECKS
# -------------------
ensure_dir "$LOG_DIR"
log "🌟 Starting AI Shorts Generator (TOP 0.1%)"

command_exists node || { log "❌ Node not found"; exit 1; }
command_exists npm || { log "❌ NPM not found"; exit 1; }
log "✅ Node $(node -v), NPM $(npm -v) detected"

# Env vars
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
  PYTHON_CMD=$(command -v python3 || command -v python)
  if [ ! -d "$PY_VENV_DIR" ]; then
    log "🐍 Creating Python venv in $PY_VENV_DIR"
    $PYTHON_CMD -m venv "$PY_VENV_DIR" || log "⚠️ Failed to create venv"
  fi
  # shellcheck disable=SC1090
  source "$PY_VENV_DIR/bin/activate" || log "⚠️ Failed to activate venv"
  if [ -f "$REQUIREMENTS" ]; then
    log "⬆️ Installing Python requirements"
    pip install --upgrade pip setuptools wheel >/dev/null 2>&1 || true
    pip install -r "$REQUIREMENTS" || log "⚠️ pip install failed, continuing"
  fi
else
  log "ℹ️ Python not found, skipping venv"
fi

# -------------------
# SERVER LOOP
# -------------------
restart_count=0
graceful_shutdown(){ 
  log "🛑 Shutdown signal received"
  [ -n "${pid:-}" ] && kill "$pid" || true
  exit 0
}
trap graceful_shutdown SIGINT SIGTERM

while true; do
  rotate_logs_if_needed
  export PORT
  log "--- App attempt $((restart_count+1))/$MAX_RESTARTS ---"
  
  if [ "$DEV_MODE" -eq 1 ] && command_exists nodemon; then
    log "🛠️ Starting DEV nodemon $APP_ENTRY"
    nodemon --signal SIGINT "$APP_ENTRY" >>"$LOG_DIR/server.log" 2>&1 &
  else
    log "▶️ Launching Node $APP_ENTRY"
    node "$APP_ENTRY" >>"$LOG_DIR/server.log" 2>&1 &
  fi
  pid=$!

  if ! wait_for_port; then
    log "❌ Server failed to open port $PORT"
    kill "$pid" || true
    exit 1
  fi

  log "✅ Server listening on port $PORT (PID $pid)"
  wait "$pid"
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
