#!/usr/bin/env bash
set -euo pipefail

ARCHIVE="/tmp/today-mayor.tar.gz"
BUILD_DIR="/tmp/today-mayor-build"

mapfile -d '' PARTS < <(
  find bootstrap -maxdepth 1 -type f -name 'part-*.b64' -print0 | sort -z
)

if (( ${#PARTS[@]} < 9 )); then
  echo "Cloudflare assets are incomplete: ${#PARTS[@]} parts found" >&2
  exit 1
fi

cat "${PARTS[@]}" | tr -d '\r\n' | base64 --decode > "$ARCHIVE"

rm -rf "$BUILD_DIR" dist
mkdir -p "$BUILD_DIR"
tar -xzf "$ARCHIVE" -C "$BUILD_DIR"

if [[ ! -f "$BUILD_DIR/dist/index.html" ]]; then
  echo "dist/index.html was not found in the asset archive" >&2
  exit 1
fi

cp -a "$BUILD_DIR/dist" ./dist

test -f dist/index.html
test -f dist/src/main.js
test -f dist/assets/secretary-normal.svg

echo "Cloudflare Pages assets are ready in dist/"
