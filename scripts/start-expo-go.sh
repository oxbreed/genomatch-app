#!/usr/bin/env bash
# Start GenoMatch for Expo Go. Answers the Log in / Proceed anonymously menu
# automatically and resets a broken ~/.expo/codesigning cache.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Phone Expo Go cannot open the project while CLI is signed in as oxbreed.
npx expo logout >/dev/null 2>&1 || true

echo "Starting Expo Go. Wait for the QR, then scan it with the iPhone Camera app."
exec node "$ROOT/scripts/start-expo-go.cjs"
