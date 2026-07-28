#!/usr/bin/env bash
set -euo pipefail
concat_parts(){
  local source_dir="$1" target="$2"
  mkdir -p "$(dirname "$target")"
  find "$source_dir" -maxdepth 1 -name '*.part' -type f | sort | xargs cat > "$target"
  test -s "$target" || { echo "Failed to generate $target" >&2; exit 1; }
}
concat_parts src/v07text/app site/js/app.js
concat_parts src/v07text/styles site/styles.css
concat_parts src/v07text/events site/js/events/content.js
concat_parts src/v07text/characters site/js/characters/content.js
concat_parts src/v07text/tanuki site/assets/tanuki-secretary.svg
echo "Generated v0.7 static source files."
