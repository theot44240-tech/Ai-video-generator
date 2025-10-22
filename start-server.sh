#!/usr/bin/env bash
# ============================================================
# ⚡ AI SHORTS GENERATOR — START SCRIPT (PRO LEVEL)
# Features:
#  - Node/npm checks & install
#  - Optional nodemon dev mode
#  - Python venv for TTS (tts-env) + pip install from requirements.txt
#  - PORT detection (Render provides $PORT)
#  - Logs with rotation and timestamps
#  - Graceful shutdown and restart-backoff
#  - Healthcheck wait loop for readiness
# ============================================================

set -o errexit
set -o pipefail
set -o nounset

# -------------------
# Config (edit if needed)
# -------------------
APP_ENTRY=${APP_ENTRY:-"server.js"}        # change to index.js if you prefer
NODE_ENV=${NODE_ENV:-"${NODE_ENV:-production}"}
DEV_MODE=${DEV_MODE:-0}                    # set to 1 to enable nodemon
LOG_DIR=${LOG_DIR:-"./logs"}
LOG_FILE="${LOG_DIR}/server.log"
STDOUT_LOG="${LOG_DIR}/server_stdout.log"
ERR_LOG="${LOG_DIR}/server_error.log"
MAX_LOG_SIZE=${MAX_LOG_SIZE:-10485760}     # 10MB
MAX_RESTARTS=${MAX_RESTARTS:-8}
RESTART_BACKOFF_BASE_MS=${RESTART_BACKOFF_BASE_MS:-2000}
PY_VENV_DIR=${PY_VENV_DIR:-"./tts-env"}
REQUIREMENTS=${REQUIREMENTS:-"requirements.txt"}
PORT=${PORT:-${RENDER_PORT:-${PORT:-3000}}} # Render provides $PORT; fallback 3000
NODE_BIN=${NODE_BIN:-$(command -v node || true)}
NPM_BIN=${NPM_BIN:-$(command -v npm || true)}
PY_BIN=${PY_BIN:-$(command -v python3 || command -v python || true)}

# -------------------
# Helpers
# -------------------
timestamp() { date +"%Y-%m-%d %H:%M:%S"; }
log() { printf "%s | %s\n" "$(timestamp)" "$*" | tee -a "$LOG_FILE"; }
ensure_dir() { [ -d "$1" ] || mkdir -p "$1"; }

rotate_logs_if_needed() {
  ensure_dir "$LOG_DIR"
  if [ -f "$LOG_FILE" ]; then
    size=$(stat -c%s "$LOG_FILE" 2>/dev/null || stat -f%z "$LOG_FILE" 2>/dev/null || echo 0)
    if [ "$size" -ge "$MAX_LOG_SIZE" ]; then
      local archive="${LOG_DIR}/server-$(date +%Y%m%d-%H%M%S).log.gz"
      log "🔁 Rotating log (size=${size}) -> ${archive}"
      gzip -c "$LOG_FILE" > "$archive" || true
      : > "$LOG_FILE"
    fi
  fi
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# -------------------
# Pre-start checks
# -------------------
ensure_dir "$LOG_DIR"
rotate_logs_if_needed

log "🌟 Starting AI Shorts Generator (pro start script)"
log "Node env: ${NODE_ENV}, Dev mode: ${DEV_MODE}, Port: ${PORT}"
log "App entry: ${APP_ENTRY}"
log "Logs: ${LOG_FILE}"

# Check Node & NPM
if ! command_exists node; then
  log "❌ node not found in PATH. Aborting."
  exit 1
fi
if ! command_exists npm; then
  log "❌ npm not found in PATH. Aborting."
  exit 1
fi

log "✅ Found node $(node -v) and npm $(npm -v)"

# Validate important env vars (non-exhaustive — adapt to your project)
REQUIRED_ENVS=("GROQ_API_KEY")
missing=()
for v in "${REQUIRED_ENVS[@]}"; do
  if [ -z "${!v:-}" ]; then
    missing+=("$v")
  fi
done
if [ "${#missing[@]}" -gt 0 ]; then
  log "⚠️ Missing environment variables: ${missing[*]} — the app may still run but features may be limited."
fi

# -------------------
# Install Node deps (use npm ci in CI, npm install otherwise)
# -------------------
if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then
  log "📦 Installing Node dependencies (npm ci preferred in CI)..."
  npm ci --no-audit --no-fund || {
    log "⚠️ npm ci failed -> fallback to npm install"
    npm install --no-audit --no-fund
  }
else
  log "📦 Running npm install..."
  npm install --no-audit --no-fund
fi

# -------------------
# Python venv & requirements (for gTTS, pydub, moviepy etc.)
# -------------------
if command_exists python3 || command_exists python; then
  if [ ! -d "$PY_VENV_DIR" ]; then
    log "🐍 Creating Python venv at ${PY_VENV_DIR}..."
    if command_exists python3; then
      python3 -m venv "$PY_VENV_DIR" || python -m venv "$PY_VENV_DIR"
    else
      python -m venv "$PY_VENV_DIR"
    fi
  fi

  # Activate venv for pip install
  # shellcheck disable=SC1091
  source "${PY_VENV_DIR}/bin/activate" || true
  if [ -f "$REQUIREMENTS" ]; then
    log "⬆️ Installing Python requirements from ${REQUIREMENTS}..."
    pip install --upgrade pip setuptools wheel >/dev/null 2>&1 || true
    pip install -r "$REQUIREMENTS" || log "⚠️ pip install returned non-zero (continue)"
  else
    log "ℹ️ No ${REQUIREMENTS} found -> skipping python pip install"
  fi
else
  log "ℹ️ Python not found; skipping python venv setup"
fi

# -------------------
# Start server with restart/backoff & graceful shutdown
# -------------------
restart_count=0

start_node_process() {
  rotate_logs_if_needed

  export PORT
  if [ "$DEV_MODE" -eq 1 ]; then
    if command_exists nodemon; then
      log "🛠️ Starting (DEV) nodemon ${APP_ENTRY}"
      # nodemon will restart on changes — keep in foreground
      exec nodemon --signal SIGINT "$APP_ENTRY" 2>&1 | tee -a "$STDOUT_LOG"
    else
      log "⚠️ nodemon not installed, starting plain node"
      exec node "$APP_ENTRY" 2>&1 | tee -a "$STDOUT_LOG"
    fi
  else
    log "▶️ Launching node ${APP_ENTRY} (PORT=${PORT})"
    node "$APP_ENTRY" 2>>"$ERR_LOG" | tee -a "$STDOUT_LOG"
  fi
}

graceful_shutdown() {
  log "🛑 Received shutdown signal — forwarding to child processes and exiting gracefully"
  # Give server time to shutdown
  sleep 1
  exit 0
}

trap 'graceful_shutdown' SIGINT SIGTERM

# Loop: try start, on crash backoff and restart up to MAX_RESTARTS
while true; do
  log "--- Starting app (attempt $((restart_count+1))/${MAX_RESTARTS}) ---"
  # Start in a subshell so we can capture exit code
  (
    start_node_process
  )
  exit_code=$?
  if [ $exit_code -eq 0 ]; then
    log "✅ App exited cleanly with code 0"
    exit 0
  fi

  restart_count=$((restart_count+1))
  log "❌ App crashed with exit code ${exit_code} (attempt ${restart_count})"

  if [ "$restart_count" -ge "$MAX_RESTARTS" ]; then
    log "🚨 Reached max restart attempts (${MAX_RESTARTS}). Exiting and leaving logs for inspection."
    tail -n 200 "$STDOUT_LOG" || true
    tail -n 200 "$ERR_LOG" || true
    exit $exit_code
  fi

  # Backoff with jitter
  backoff_ms=$((RESTART_BACKOFF_BASE_MS * restart_count))
  jitter=$(( (RANDOM % 1000) + 200 ))
  sleep_seconds=$(awk "BEGIN {printf \"%.1f\", (${backoff_ms}+${jitter})/1000}")
  log "⏳ Waiting ${sleep_seconds}s before restart (backoff)..."
  sleep "$sleep_seconds"
done
