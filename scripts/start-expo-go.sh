#!/usr/bin/env bash
# One command to open GenoMatch in Expo Go on a physical iPhone.
# - Frees ports 8081/8082 (leftover Metro)
# - Clears broken ~/.expo/codesigning (HTTP 500)
# - Logs out of Expo CLI (phone does not need an oxbreed account)
# - Uses LAN, never ngrok
# - Auto-selects "Proceed anonymously" via expect
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_ID="11f7d939-f2b9-4c0c-a1bf-bd7411c45ec6"

for port in 8081 8082; do
  if pids="$(lsof -ti tcp:${port} 2>/dev/null || true)"; then
    if [[ -n "${pids}" ]]; then
      kill -9 ${pids} 2>/dev/null || true
    fi
  fi
done
sleep 1

rm -rf "${HOME}/.expo/codesigning"
mkdir -p "${HOME}/.expo/codesigning/${PROJECT_ID}"
rm -rf "${ROOT}/.expo"

npx expo logout >/dev/null 2>&1 || true

echo "Starting Expo Go on Wi-Fi. Wait for the QR, then scan it with the iPhone Camera app."
echo "Keep this window open. Phone and Mac must be on the same Wi-Fi."

if command -v expect >/dev/null 2>&1; then
  exec expect "${ROOT}/scripts/start-expo-go.expect" "${ROOT}"
fi

exec npx expo start --go --clear --port 8081 --lan
