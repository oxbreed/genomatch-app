#!/usr/bin/env bash
# Local macOS quick scan (downloads ZAP + JRE). CI uses Docker in genomatch-landing:
#   ../genomatch-landing/.github/workflows/security-zap.yml
#   cd ../genomatch-landing && npm run zap:baseline
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS_DIR="$ROOT/.tools"
ZAP_VERSION="2.17.0"
JRE_DIR="$TOOLS_DIR/jre17"
ZAP_DIR="$TOOLS_DIR/ZAP_${ZAP_VERSION}"
ZAP_ARCHIVE="$TOOLS_DIR/ZAP_${ZAP_VERSION}_Crossplatform.zip"
ZAP_URL="https://github.com/zaproxy/zaproxy/releases/download/v${ZAP_VERSION}/ZAP_${ZAP_VERSION}_Crossplatform.zip"
JRE_URL="https://api.adoptium.net/v3/binary/latest/17/ga/mac/x64/jre/hotspot/normal/eclipse"
TARGET="${1:-https://www.genomatch.app}"
REPORT_DIR="$ROOT/security-reports"
STAMP="$(date +%Y%m%d-%H%M%S)"
REPORT_HTML="$REPORT_DIR/zap-baseline-${STAMP}.html"

mkdir -p "$TOOLS_DIR" "$REPORT_DIR"

if [[ ! -x "$ZAP_DIR/zap.sh" ]]; then
  echo "Downloading OWASP ZAP ${ZAP_VERSION}..."
  curl -fsSL "$ZAP_URL" -o "$ZAP_ARCHIVE"
  unzip -q -o "$ZAP_ARCHIVE" -d "$TOOLS_DIR"
fi

if [[ -x "$JRE_DIR/Contents/Home/bin/java" ]]; then
  JAVA_HOME="$JRE_DIR/Contents/Home"
elif [[ -x "$JRE_DIR/bin/java" ]]; then
  JAVA_HOME="$JRE_DIR"
else
  echo "Downloading Temurin JRE 17 for macOS (ZAP requires Java 17+)..."
  JRE_ARCHIVE="$TOOLS_DIR/jre17.tar.gz"
  curl -fsSL "$JRE_URL" -o "$JRE_ARCHIVE"
  rm -rf "$JRE_DIR"
  mkdir -p "$JRE_DIR"
  tar -xzf "$JRE_ARCHIVE" -C "$JRE_DIR"
  JAVA_HOME="$JRE_DIR/Contents/Home"
fi

export JAVA_HOME
export PATH="$JAVA_HOME/bin:$PATH"

echo "Running ZAP quick baseline against ${TARGET}"
echo "Reports -> ${REPORT_HTML}"

"$ZAP_DIR/zap.sh" -cmd \
  -quickurl "$TARGET" \
  -quickout "$REPORT_HTML" \
  -quickprogress

# Optional machine-readable copy when ZAP also supports JSON output via report API.
if [[ -f "$REPORT_HTML" ]]; then
  echo "HTML report: $REPORT_HTML"
fi

echo "Done."
