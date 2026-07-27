#!/usr/bin/env bash
set -euo pipefail
for file in site/index.html site/styles.css site/js/app.js site/js/engine.js site/js/content.js site/js/cloud.js site/manifest.webmanifest site/sw.js site/_routes.json; do
  test -s "$file"
done
node --check site/js/app.js
node --check site/js/engine.js
node --check site/js/content.js
node --check site/js/cloud.js
node --check site/sw.js
echo "Cloudflare Pages assets are ready in site/"
