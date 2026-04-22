#!/usr/bin/env bash
# ============================================================================
# serve.sh — local dev server for caboodle-site
#
# Run this ONCE at the start of a work session. Opens a live-reloading copy
# of the site at http://localhost:8080. Edit any HTML/CSS/JS, hit save,
# browser refreshes automatically. No Netlify deploys needed.
#
# Usage:   ./serve.sh
# Stop:    Ctrl+C
# ============================================================================

set -e

PORT=8080

# Prefer npx live-server if Node is installed — gives auto-reload on save.
# Falls back to Python's http.server (no auto-reload, but zero install).
if command -v npx &> /dev/null; then
  echo "Starting live-server on http://localhost:${PORT}"
  echo "Auto-reloads when you save a file. Ctrl+C to stop."
  echo ""
  npx --yes live-server --port=${PORT} --no-browser --wait=200
elif command -v python3 &> /dev/null; then
  echo "Starting Python http.server on http://localhost:${PORT}"
  echo "No auto-reload — refresh the browser manually after saving."
  echo "(Install Node to get auto-reload: brew install node)"
  echo ""
  python3 -m http.server ${PORT}
else
  echo "No Node.js or Python 3 found."
  echo "Install one:"
  echo "  brew install node       (recommended — enables auto-reload)"
  echo "  brew install python3"
  exit 1
fi
