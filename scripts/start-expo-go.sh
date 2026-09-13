#!/usr/bin/env bash
# Start GenoMatch for Expo Go without the Log in / Proceed anonymously menu,
# and without a stale ~/.expo/codesigning cache (that caused HTTP 500 / ENOENT).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_ID="11f7d939-f2b9-4c0c-a1bf-bd7411c45ec6"
SIGN_DIR="${HOME}/.expo/codesigning/${PROJECT_ID}"

rm -rf "${HOME}/.expo/codesigning"
mkdir -p "$SIGN_DIR"
rm -rf "$ROOT/.expo"

# Expo Go on a phone with no expo.dev login cannot open a project while the
# CLI is signed in as oxbreed. Log out for this session only (run `npx expo login`
# later when you need EAS Build).
npx expo logout >/dev/null 2>&1 || true

export CI=1
export EXPO_NO_TELEMETRY=1

echo "Starting Expo Go (anonymous, tunnel). Scan the QR with the iPhone Camera app."
exec npx expo start --go --clear --tunnel --non-interactive --port 8081
