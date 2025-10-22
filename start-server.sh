#!/usr/bin/env bash
# ============================================================
# ⚡ AI SHORTS GENERATOR — START SCRIPT (LEVEL 99999999999)
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
MAX_RESTARTS="${MAX_RESTARTS:-10}"
RESTART_BACKOFF_BASE_MS="${RESTART_BACKOFF_BASE_MS:-1500}"
MAX_LOG_SIZE="${MAX_LOG_SIZE:-10485760}"  # 10MB
MAX_ARCHIVES="${MAX_ARCHIVES:-10}"
REQUIRED_ENVS=("GROQ_API_KEY")

# -------------------
# UTILS
# -------------------
timestamp(){ date +"%Y-%m-%d %H:%M:%S"; }
log(){ printf "%s | %s\n" "$(timestamp)" "$*"; }
ensure_dir(){ [ -d "$1" ] || mkdir -p "$1"; }
command_exists(){ command -v "$1" >/dev/null 2>&1; }

rotate_logs(){
    ensure_dir "$LOG_DIR"
    local log_file="$LOG_DIR/server.log"
    [ -f "$log_file" ] || return
    local size
    size=$(stat -c%s "$log_file" 2>/dev/null || stat -f%z "$log_file" 2>/dev/null || echo 0)
    if [ "$size" -ge "$MAX_LOG_SIZE" ]; then
        local archive="$LOG_DIR/server-$(date +%Y%m%d-%H%M%S).log.gz"
        log "🔁 Rotating log ($size bytes) -> $archive"
        gzip -c "$log_file" > "$archive" || true
        : > "$log_file"

        # keep only last $MAX_ARCHIVES
        ls -1t "$LOG_DIR"/server-*.log.gz 2>/dev/null | tail -n +$((MAX_ARCHIVES+1)) | xargs -r rm -f
    fi
}

check_envs(){
    local missing=()
    for v in "${REQUIRED_ENVS[@]}"; do
        [ -z "${!v:-}" ] && missing+=("$v")
    done
    if [ "${#missing[@]}" -gt 0 ]; then
        log "⚠️ Missing env vars: ${missing[*]}"
    fi
}

install_node_deps(){
    if [ -f package-lock.json ]; then
        log "📦 Installing Node deps (npm ci)"
        npm ci --no-audit --no-fund || npm install --no-audit --no-fund
    else
        log "📦 Running npm install"
        npm install --no-audit --no-fund
    fi
}

setup_python(){
    local py_cmd=""
    if command_exists python3; then py_cmd="python3"
    elif command_exists python; then py_cmd="python"
    else
        log "ℹ️ Python not found, skipping venv"
        return
    fi

    [ -d "$PY_VENV_DIR" ] || ($py_cmd -m venv "$PY_VENV_DIR")
    source "$PY_VENV_DIR/bin/activate" || true

    if [ -f "$REQUIREMENTS" ]; then
        log "⬆️ Installing Python requirements"
        pip install --upgrade pip setuptools wheel >/dev/null 2>&1 || true
        pip install -r "$REQUIREMENTS" || log "⚠️ pip install failed, continuing"
    fi
}

find_free_port(){
    if command_exists lsof; then
        while lsof -i:"$PORT" >/dev/null 2>&1; do
            log "⚠️ Port $PORT busy, incrementing"
            PORT=$((PORT+1))
        done
    fi
    export PORT
    log "🔌 Using PORT $PORT"
}

graceful_shutdown(){ log "🛑 Shutdown signal received"; exit 0; }
trap graceful_shutdown SIGINT SIGTERM

# -------------------
# PRECHECKS
# -------------------
log "🌟 Starting AI Shorts Generator"
command_exists node || { log "❌ Node not found"; exit 1; }
command_exists npm || { log "❌ NPM not found"; exit 1; }
log "✅ Node $(node -v), NPM $(npm -v) detected"

check_envs
install_node_deps
setup_python
find_free_port

# -------------------
# SERVER LOOP
# -------------------
restart_count=0
while true; do
    rotate_logs
    log "--- App attempt $((restart_count+1))/$MAX_RESTARTS ---"

    if [ "$DEV_MODE" -eq 1 ] && command_exists nodemon; then
        log "🛠️ Starting DEV nodemon $APP_ENTRY"
        nodemon --signal SIGINT "$APP_ENTRY"
    else
        log "▶️ Launching Node $APP_ENTRY"
        node "$APP_ENTRY"
    fi

    exit_code=$?
    [ "$exit_code" -eq 0 ] && { log "✅ App exited cleanly"; exit 0; }

    restart_count=$((restart_count+1))
    log "❌ App crashed (exit code $exit_code)"

    if [ "$restart_count" -ge "$MAX_RESTARTS" ]; then
        log "🚨 Max restarts reached, exiting"
        exit $exit_code
    fi

    # exponential backoff + jitter
    backoff_ms=$((RESTART_BACKOFF_BASE_MS * 2**restart_count))
    jitter=$(( (RANDOM % 2000) + 200 ))
    sleep_sec=$(awk "BEGIN {printf \"%.1f\", (${backoff_ms}+${jitter})/1000}")
    log "⏳ Waiting ${sleep_sec}s before restart..."
    sleep "$sleep_sec"
done
