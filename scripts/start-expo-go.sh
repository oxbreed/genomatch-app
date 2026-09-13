#!/usr/bin/env bash
# Start Metro for Expo Go. Run this IN Terminal.app / iTerm (not piped, not CI).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export CI=0
export EXPO_NO_TELEMETRY=1
export EXPO_NO_GIT_STATUS=1
unset EXPO_TOKEN || true

for p in 8081 8082; do
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti tcp:"$p" | xargs kill -9 2>/dev/null || true
  fi
done

rm -rf "${HOME}/.expo/codesigning" "${ROOT}/.expo"

npx expo logout >/dev/null 2>&1 || true

LAN=""
if command -v ipconfig >/dev/null 2>&1; then
  LAN="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
elif command -v hostname >/dev/null 2>&1; then
  LAN="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
fi

echo ""
echo "GenoMatch — Expo Go (same Wi-Fi as this Mac)"
echo "1) Open Expo Go → Camera, or Enter URL"
if [ -n "${LAN}" ]; then
  echo "   exp://${LAN}:8081"
fi
echo "2) Metro QR appears below this line (need a real terminal, width ≥ 80)."
echo ""

exec npx expo start --go --lan --port 8081 --clear
