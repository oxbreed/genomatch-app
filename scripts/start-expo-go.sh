#!/usr/bin/env bash
# Open GenoMatch in Expo Go: LAN only, no ngrok, no login menu.
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PROJECT_ID="11f7d939-f2b9-4c0c-a1bf-bd7411c45ec6"

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"

echo "==> GenoMatch Expo Go"
echo "    folder: $ROOT"
if [[ -n "${LAN_IP}" ]]; then
  echo
  echo "    If no QR appears, open Expo Go → Enter URL and type:"
  echo "        exp://${LAN_IP}:8081"
  echo
fi

for port in 8081 8082; do
  pids="$(lsof -ti tcp:${port} 2>/dev/null || true)"
  if [[ -n "${pids}" ]]; then
    echo "    stopping process on port ${port}: ${pids}"
    kill -9 ${pids} 2>/dev/null || true
  fi
done
sleep 1

rm -rf "${HOME}/.expo/codesigning"
mkdir -p "${HOME}/.expo/codesigning/${PROJECT_ID}"
rm -rf "${ROOT}/.expo"

npx expo logout >/dev/null 2>&1 || true

echo "    starting Metro on Wi-Fi (this can take a minute)..."
echo "    same Wi-Fi on iPhone and Mac. Camera app scans the QR."
echo

exec python3 "${ROOT}/scripts/start-expo-go.py"
