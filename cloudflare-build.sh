#!/usr/bin/env bash
set -euo pipefail

ARCHIVE="/tmp/today-mayor-site.tar.gz"
BUILD_DIR="/tmp/today-mayor-site-build"
EXPECTED_SHA256="64a50dc90be5fe71bf9ba9b347188a2ccd8c146f666fbaf2e6a62b4f4227a8f1"

PARTS=(
  cloudflare/chunks/part-00
  cloudflare/chunks/part-01
  cloudflare/chunks/part-02
  cloudflare/chunks/part-03
  cloudflare/chunks/part-04
  cloudflare/chunks/part-05
  cloudflare/chunks/part-06
)

for part in "${PARTS[@]}"; do
  if [[ ! -f "$part" ]]; then
    echo "Cloudflare asset is missing: $part" >&2
    exit 1
  fi
done

rm -rf "$BUILD_DIR" "$ARCHIVE" site
mkdir -p "$BUILD_DIR"

cat "${PARTS[@]}" | tr -d '\r\n' | base64 --decode > "$ARCHIVE"
echo "$EXPECTED_SHA256  $ARCHIVE" | sha256sum --check

tar -xzf "$ARCHIVE" -C "$BUILD_DIR"
cp -a "$BUILD_DIR/site" ./site

test -f site/index.html
test -f site/_headers
test -f site/_redirects

echo "Cloudflare Pages assets are ready in site/"
