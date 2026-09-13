#!/usr/bin/env bash
# Start Metro for Expo Go and always print a scannable LAN QR.
# Run in Terminal.app / iTerm (same Wi-Fi as the iPhone).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export CI=0
export EXPO_NO_TELEMETRY=1
export EXPO_NO_GIT_STATUS=1
export EXPO_OFFLINE=1
export COLUMNS="${COLUMNS:-120}"
export LINES="${LINES:-50}"
unset EXPO_NO_QR_CODE || true
unset EXPO_TOKEN || true

if [ -t 1 ] && command -v stty >/dev/null 2>&1; then
  stty cols 120 rows 50 2>/dev/null || true
fi

lan_ip() {
  if [ -n "${REACT_NATIVE_PACKAGER_HOSTNAME:-}" ]; then
    printf '%s\n' "$REACT_NATIVE_PACKAGER_HOSTNAME"
    return 0
  fi
  if command -v ipconfig >/dev/null 2>&1; then
    local iface
    iface="$(route -n get default 2>/dev/null | awk '/interface:/{print $2}' || true)"
    if [ -n "${iface}" ]; then
      ipconfig getifaddr "$iface" 2>/dev/null && return 0
    fi
    ipconfig getifaddr en0 2>/dev/null && return 0
    ipconfig getifaddr en1 2>/dev/null && return 0
  fi
  if command -v hostname >/dev/null 2>&1; then
    hostname -I 2>/dev/null | awk '{print $1}'
  fi
}

LAN="$(lan_ip || true)"
if [ -z "${LAN}" ]; then
  echo "Could not find a LAN IP. Join the same Wi-Fi as your iPhone, then retry."
  exit 1
fi

export REACT_NATIVE_PACKAGER_HOSTNAME="$LAN"
export EXPO_DEVTOOLS_LISTEN_ADDRESS="${EXPO_DEVTOOLS_LISTEN_ADDRESS:-0.0.0.0}"

if command -v lsof >/dev/null 2>&1; then
  lsof -ti tcp:8081 | xargs kill -9 2>/dev/null || true
fi

echo ""
echo "GenoMatch → Expo Go (LAN ${LAN})"
echo "1) Scan the QR with the iPhone Camera app (Expo Go has no scanner on iOS)."
echo "2) Or Expo Go → Enter URL → exp://${LAN}:8081"
echo ""

node "$ROOT/scripts/print-expo-qr.cjs" "$LAN"

if command -v open >/dev/null 2>&1; then
  open "$ROOT/expo-qr.png" 2>/dev/null || true
fi

echo ""
echo "Starting Metro. Do not use --tunnel (ngrok is broken in this CLI)."
echo ""

run_expo() {
  npx expo start --go --offline --port 8081 --clear
}

if [ -t 0 ] && [ -t 1 ]; then
  run_expo
  exit $?
fi

if command -v script >/dev/null 2>&1; then
  if script -V >/dev/null 2>&1; then
    script -qfec "npx expo start --go --offline --port 8081 --clear" /dev/null
    exit $?
  fi
  script -q /dev/null npx expo start --go --offline --port 8081 --clear
  exit $?
fi

run_expo
