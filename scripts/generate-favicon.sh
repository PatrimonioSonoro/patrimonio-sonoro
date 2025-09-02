#!/usr/bin/env bash
# Generate public/favicon.ico from public/images/logo_sin_letra.png
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# Allow optional first argument as source PNG path (relative to project root)
if [ "$#" -ge 1 ] && [ -n "$1" ]; then
  SRC="$ROOT_DIR/$1"
else
  SRC="$ROOT_DIR/public/images/logo_sin_letra.png"
fi
OUT="$ROOT_DIR/public/favicon.ico"

if [ ! -f "$SRC" ]; then
  echo "Source PNG not found: $SRC" >&2
  exit 2
fi

if command -v convert >/dev/null 2>&1; then
  echo "Using ImageMagick 'convert' to generate favicon.ico"
  convert "$SRC" -resize 64x64 "$OUT"
  echo "Created $OUT"
  exit 0
fi

if command -v npx >/dev/null 2>&1; then
  # Try to use png-to-ico directly, but if the PNG isn't square we'll use the Node helper
  if npx --no-install png-to-ico --version >/dev/null 2>&1; then
    echo "Using 'npx png-to-ico' to generate favicon.ico"
    npx png-to-ico "$SRC" --output "$OUT" && echo "Created $OUT" && exit 0 || true
  fi
  echo "Falling back to Node helper to make square PNG and then convert"
  node scripts/make-square-and-ico.js && exit 0 || true
fi

echo "No available tool to generate favicon.ico. Install ImageMagick or ensure npx is available." >&2
exit 3
