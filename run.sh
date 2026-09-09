#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================================="
echo "   ChurnGuard — Customer Churn Intelligence Platform"
echo "========================================================="

# 1. Automatic Python Virtualenv Check & Setup
cd "$DIR/backend"
if [ ! -d "venv" ]; then
  echo "[Setup] Virtual environment not detected. Creating backend/venv..."
  python3.11 -m venv venv 2>/dev/null || python3 -m venv venv
  echo "[Setup] Installing backend dependencies from requirements.txt..."
  ./venv/bin/pip install --upgrade pip
  ./venv/bin/pip install -r requirements.txt
fi

# 2. Automatic Frontend Dependencies Check & Setup
cd "$DIR/frontend"
if [ ! -d "node_modules" ]; then
  echo "[Setup] Node modules not detected. Installing frontend dependencies..."
  npm install
fi

# 3. Start Backend in background
echo ""
echo "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000..."
cd "$DIR/backend"
PYTHONPATH=. ./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# Trap termination signals to clean up background processes on exit
cleanup() {
  echo ""
  echo "Shutting down ChurnGuard services..."
  kill $BACKEND_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Give backend a moment to initialize database and models
sleep 2

# 4. Start Frontend Dev Server
echo "[2/2] Launching React + Vite Frontend on http://localhost:5173..."
cd "$DIR/frontend"
npm run dev -- --host 127.0.0.1 --port 5173

wait $BACKEND_PID
