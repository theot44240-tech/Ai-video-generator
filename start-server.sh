#!/usr/bin/env bash
# ======================================================
# 🚀 AI Shorts Generator — Start Script
# Version : production top 0.1%
# Compatible : Render / Node.js / Linux / Docker
# Auteur : theot44240-tech
# ======================================================

echo "============================================"
echo "   🚀 Starting AI Shorts Generator Server"
echo "============================================"

# --- 1️⃣ Safety : exit on error ---
set -e

# --- 2️⃣ Load environment variables (.env optional) ---
if [ -f ".env" ]; then
  echo "📦 Loading environment variables from .env..."
  export $(grep -v '^#' .env | xargs)
else
  echo "⚠️  No .env file found, using system environment variables."
fi

# --- 3️⃣ Verify Node.js version ---
REQUIRED_NODE_MAJOR=18
CURRENT_NODE_MAJOR=$(node -v | grep -o '[0-9]\+' | head -1)

if [ "$CURRENT_NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
  echo "❌ Node.js version too low. Requires v18+ (current: $(node -v))"
  exit 1
else
  echo "✅ Node.js version OK: $(node -v)"
fi

# --- 4️⃣ Install dependencies if missing ---
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install --production
else
  echo "✅ Dependencies already installed."
fi

# --- 5️⃣ Define default port ---
export PORT=${PORT:-3000}
echo "🌐 Server will run on port: $PORT"

# --- 6️⃣ Run server with logging ---
LOG_DIR="./logs"
mkdir -p "$LOG_DIR"

LOG_FILE="$LOG_DIR/server-$(date '+%Y-%m-%d_%H-%M-%S').log"

echo "📝 Logging output to: $LOG_FILE"
echo "--------------------------------------------"

# Start the Node.js server
node index.js >> "$LOG_FILE" 2>&1 &

SERVER_PID=$!

# --- 7️⃣ Health check ---
sleep 3
if ps -p $SERVER_PID > /dev/null; then
  echo "✅ AI Shorts Generator is running successfully (PID: $SERVER_PID)"
  echo "🌍 Access it at: http://localhost:$PORT/"
else
  echo "❌ Server failed to start. Check logs at $LOG_FILE"
  exit 1
fi

# --- 8️⃣ Keep process alive (Render/Docker safe) ---
wait $SERVER_PID
