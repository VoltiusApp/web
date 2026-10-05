#!/usr/bin/env bash
# kill.sh — V3: a split workspace with a build running, kill -9 the app, relaunch, everything comes back.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
stage
for h in web-01 api-01 db-01; do docker exec promo-s-$h su deploy -c 'tmux -L voltius kill-server' 2>/dev/null || true; done
run node do.mjs sessions.js >/dev/null
run node do.mjs workspace.js
run node pane.mjs 1 'top -d 1\n'
run node pane.mjs 2 'vmstat 2\n'
run node pane.mjs 0 'clear; ./build.sh\n'
sleep 6
run ./rec.sh kill.mjs kill | tail -8
"$HERE/pull.sh" kill
