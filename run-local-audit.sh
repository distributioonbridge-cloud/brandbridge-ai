#!/usr/bin/env bash
# ==============================================================================
# DistributionBridge Local E2E Audit & Integration Test Runner
# Spins up Backend (Port 8787) & Frontend (Port 3000), runs E2E tests, and cleans up.
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "========================================================================"
echo "🚀 Starting DistributionBridge Local Audit Test Suite"
echo "========================================================================"

# Cleanup function to kill background dev servers on exit
cleanup() {
  echo ""
  echo "🧹 Shutting down background test servers..."
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  echo "✅ Cleanup complete."
}
trap cleanup EXIT INT TERM

# 1. Start Cloudflare Worker Backend
echo "📡 Starting Backend Worker on port 8787..."
cd "$BACKEND_DIR"
npm run dev -- --port 8787 > /dev/null 2>&1 &
BACKEND_PID=$!

# 2. Start Next.js Frontend
echo "💻 Starting Next.js Frontend on port 3000..."
cd "$FRONTEND_DIR"
npm run dev -- -p 3000 > /dev/null 2>&1 &
FRONTEND_PID=$!

# 3. Wait for servers to become ready
echo "⏳ Waiting for servers to initialize..."

MAX_RETRIES=30
RETRY=0
until curl -s "http://127.0.0.1:8787/health" > /dev/null 2>&1; do
  RETRY=$((RETRY+1))
  if [ $RETRY -ge $MAX_RETRIES ]; then
    echo "❌ Timeout waiting for Backend on http://127.0.0.1:8787"
    exit 1
  fi
  sleep 1
done
echo "✅ Backend Worker is healthy on http://127.0.0.1:8787"

RETRY=0
until curl -s "http://localhost:3000/" > /dev/null 2>&1; do
  RETRY=$((RETRY+1))
  if [ $RETRY -ge $MAX_RETRIES ]; then
    echo "❌ Timeout waiting for Frontend on http://localhost:3000"
    exit 1
  fi
  sleep 1
done
echo "✅ Next.js Frontend is healthy on http://localhost:3000"

# 4. Execute E2E Test Runner
echo ""
echo "🔬 Executing Local Audit Spec (frontend/local-audit.spec.js)..."
cd "$FRONTEND_DIR"
node local-audit.spec.js

echo ""
echo "🎉 ALL E2E AUDIT TEST BLOCKS PASSED SUCCESSFULLY!"
