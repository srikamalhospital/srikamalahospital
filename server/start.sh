#!/bin/sh
set -e
cd "$(dirname "$0")"
if [ ! -f node_modules/express/package.json ]; then
  echo "Installing server dependencies..."
  npm install --omit=dev --no-audit --no-fund
fi
exec node server.js
