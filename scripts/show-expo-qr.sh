#!/usr/bin/env bash
# Re-print the Expo Go QR (Metro must already be running, or pass the LAN IP).
set -euo pipefail
cd "$(dirname "$0")/.."

LAN="${REACT_NATIVE_PACKAGER_HOSTNAME:-}"
if [ -z "${LAN}" ] && command -v ipconfig >/dev/null 2>&1; then
  iface="$(route -n get default 2>/dev/null | awk '/interface:/{print $2}' || true)"
  if [ -n "${iface}" ]; then
    LAN="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
  fi
  LAN="${LAN:-$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)}"
fi

node scripts/print-expo-qr.cjs ${LAN:+"$LAN"}
open expo-qr.png 2>/dev/null || true
