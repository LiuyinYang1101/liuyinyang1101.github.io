#!/usr/bin/env bash
# Render cv/cv.html to assets/cv.pdf (A4) with headless Chrome.
# Usage: bash scripts/build_cv.sh
set -euo pipefail
cd "$(dirname "$0")/.."
chrome=$(command -v google-chrome || command -v chromium || command -v chromium-browser)
"$chrome" --headless=new --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=10000 --print-to-pdf=assets/cv.pdf \
  "file://$PWD/cv/cv.html" 2>/dev/null
pdfinfo assets/cv.pdf 2>/dev/null | grep -E "^(Pages|Page size)" || ls -l assets/cv.pdf
