#!/bin/bash
set -e

cd "$(dirname "$0")"

npm run dev &
DEV_PID=$!

# Wait for the server to be ready
echo "Starting dev server..."
for i in $(seq 1 20); do
  PORT=$(lsof -i :5173 -sTCP:LISTEN -t 2>/dev/null || lsof -i :5174 -sTCP:LISTEN -t 2>/dev/null || true)
  if [ -n "$PORT" ]; then break; fi
  sleep 0.5
done

# Find the actual port Vite chose
URL=$(npx vite --port 5173 2>&1 | grep "Local:" | awk '{print $2}' || echo "http://localhost:5173")

# Simpler: just check which port is open
for PORT in 5173 5174 5175; do
  if lsof -i :$PORT -sTCP:LISTEN -t &>/dev/null; then
    URL="http://localhost:$PORT"
    break
  fi
done

echo "Opening $URL"
open "$URL"

wait $DEV_PID
