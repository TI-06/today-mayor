#!/usr/bin/env bash
set -euo pipefail
bash scripts/build-static.sh
required=(
  site/index.html site/styles.css site/js/app.js site/js/content.js site/js/cloud.js
  site/js/game/state.js site/js/game/finance.js site/js/game/week-engine.js site/js/game/policies.js site/js/game/projects.js
  site/js/events/content.js site/js/events/engine.js site/js/characters/ponkichi.js site/js/characters/stories.js
  site/js/city/visual-state.js site/js/city/renderer.js site/js/ui/home-view.js site/js/ui/components.js
  site/assets/tanuki-secretary.svg site/manifest.webmanifest site/sw.js site/_routes.json
)
for file in "${required[@]}"; do test -s "$file" || { echo "Missing required asset: $file" >&2; exit 1; }; done
node scripts/check-js.mjs
echo "Cloudflare Pages assets are ready in site/"
