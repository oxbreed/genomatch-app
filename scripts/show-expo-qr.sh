#!/usr/bin/env bash
# Print + save QR for the running Expo dev server (works when Cursor hides the terminal QR).
set -euo pipefail
cd "$(dirname "$0")/.."

if ! curl -sf http://localhost:8081/status >/dev/null; then
  echo "Metro is not running. Start it first:"
  echo "  npm run start:go"
  exit 1
fi

URL=$(curl -s http://localhost:8081 | python3 -c "
import sys, json, re
d = json.load(sys.stdin)
host = re.search(r'https?://([^/]+)', d['launchAsset']['url']).group(1)
print('exp://' + host)
")

echo ""
echo "Expo Go URL: $URL"
echo ""
echo "In Expo Go: Camera, or Enter URL, then paste the line above."
echo "Same Wi-Fi as this Mac. Do not use --tunnel (ngrok is broken in this Expo CLI)."
echo ""

curl -sf "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${URL}" -o expo-qr.png
open expo-qr.png 2>/dev/null || echo "QR saved to: $(pwd)/expo-qr.png"
