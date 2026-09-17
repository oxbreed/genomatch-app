#!/usr/bin/env bash
# Thin wrapper so `npm run start:go` always uses Node (no hanging lsof/npx).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
exec node "$ROOT/scripts/start-expo-go.cjs"
