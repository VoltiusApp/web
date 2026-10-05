#!/usr/bin/env bash
# themes.sh — V9: neofetch on web-01, then every built-in theme from the side panel.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
stage
run node do.mjs sessions.js >/dev/null
run node do.mjs single.js
run node panel.mjs
run node pane.mjs 0 'clear; neofetch; ls --color=always -C -w 82 /etc | head -12\n'
sleep 3
run ./rec.sh themes.mjs themes | tail -9
"$HERE/pull.sh" themes
