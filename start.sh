#!/bin/bash
# ========================================================
# GREENLIGHT — ONE-CLICK RUNNER
# Starts both the Backend Simulation Server & Frontend App
# ========================================================

# Always navigate to the script's directory (project root)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "========================================================="
echo "🚦 GREENLIGHT: INTELLIGENT TRAFFIC SIGNAL CONTROL SYSTEM"
echo "📂 Project Directory: $SCRIPT_DIR"
echo "========================================================="

# 1. Check Virtual Environment
if [ ! -f "./venv/bin/python3" ]; then
    echo "❌ Error: Virtual environment './venv' not found in $SCRIPT_DIR."
    echo "💡 Creating virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt
fi

# 2. Check Node Modules
if [ ! -d "./greenlight_app/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd greenlight_app && npm install && cd ..
fi

# Cleanup on Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Shutting down Greenlight servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

echo "🚀 [1/2] Starting Python Backend Server (Port 5005)..."
PYTHONUNBUFFERED=1 ./venv/bin/python3 server.py &
BACKEND_PID=$!

sleep 1

echo "🌐 [2/2] Starting React Frontend Dashboard (Port 3000)..."
cd greenlight_app
npm run dev -- --host --port 3000 &
FRONTEND_PID=$!
cd ..

sleep 2
echo "========================================================="
echo "✅ Greenlight is running!"
echo "📡 Backend API:      http://localhost:5005"
echo "🖥️ Frontend App:     http://localhost:3000"
echo "========================================================="
echo "Opening browser in 2 seconds... (Press Ctrl+C to stop both)"

sleep 2
open http://localhost:3000 2>/dev/null || true

# Wait for background processes
wait
