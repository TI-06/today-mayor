#!/usr/bin/env bash
set -euo pipefail

test -f site/index.html
test -f site/styles.css
test -f site/app.js
test -f site/manifest.webmanifest
test -f site/_headers
test -f site/_redirects

if command -v node >/dev/null 2>&1; then
  node --check site/app.js
  node --check site/sw.js
fi

echo "Cloudflare Pages assets are ready in site/"
