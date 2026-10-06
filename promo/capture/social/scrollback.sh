#!/usr/bin/env bash
# scrollback.sh — #26: a persistent (tmux) session on web-01 that scrolls, selects and searches like plain SSH.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
stage
docker exec promo-s-web-01 su deploy -c 'tmux -L voltius kill-server' 2>/dev/null || true
run node do.mjs sessions.js >/dev/null
run node do.mjs single.js >/dev/null
sleep 2
run ./rec.sh scrollback.mjs scrollback | tail -8
"$HERE/pull.sh" scrollback
