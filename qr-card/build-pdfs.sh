#!/usr/bin/env bash
# Build all three Berta QR card PDF variants from qr-code-print.html.
# The HTML reads ?theme=… from the URL and switches the colour scheme;
# this script just calls Chrome headless once per variant.

set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="file://${DIR}/qr-code-print.html"

build() {
  local theme="$1" outfile="$2"
  local url="${SRC}"
  [[ "$theme" != "default" ]] && url="${SRC}?theme=${theme}"
  "${CHROME}" \
    --headless=new --disable-gpu --no-pdf-header-footer \
    --virtual-time-budget=8000 --run-all-compositor-stages-before-draw \
    --print-to-pdf="${DIR}/${outfile}" \
    "${url}" 2>/dev/null
  printf "  %-32s  %s\n" "${outfile}" "$(stat -f%z "${DIR}/${outfile}") bytes"
}

echo "Building PDFs in ${DIR}:"
build default    qr-card.pdf
build cream-card qr-card-cream-card.pdf
build cream-bg   qr-card-cream-bg.pdf
echo "Done."
