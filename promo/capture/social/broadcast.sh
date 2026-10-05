#!/usr/bin/env bash
# broadcast.sh — V7: a fresh 12-host fleet, select all, connect, broadcast one apt upgrade to every pane.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
FLEET=(web-01 web-02 web-03 web-04 api-01 api-02 api-03 db-01 db-02 cache-01 worker-01 worker-02)
. "$HERE/lib.sh"
apt_busy() { for h in "${FLEET[@]}"; do docker exec promo-s-$h pgrep -x apt >/dev/null && return 0; done; return 1; }

# apt upgrade only has work to do once per container.
for h in "${FLEET[@]}"; do docker rm -f promo-s-$h >/dev/null; done
WT=${WT:?voltius worktree} BIN=${BIN:?dir with voltius binary} "$HERE/setup.sh" >/dev/null
stage
run node do.mjs sessions.js >/dev/null
run node do.mjs 'const { useUIStore: u } = await import("/src/stores/uiStore.ts"); u.getState().setTerminalFontSize(11); u.getState().setRightPanelOpen(false); u.getState().setActiveNav("hosts"); return 1' >/dev/null
run node -e "import('./wd.mjs').then(async m=>{await m.ensureSession(); await m.setWindow(1920,1200);})"
sleep 2
run node do.mjs vault.js
SIZE=1920x1200 run sh -c 'SIZE=1920x1200 ./rec.sh broadcast.mjs broadcast' > /tmp/promo-rec.log 2>&1 &
TAKE=$!
until run grep -q ' enter$' marks.txt 2>/dev/null; do sleep 0.5; done
sleep 5
while apt_busy; do sleep 1; done
mark done
run touch done.flag
wait $TAKE || true
tail -4 /tmp/promo-rec.log
"$HERE/pull.sh" broadcast
run node -e "import('./wd.mjs').then(async m=>{await m.ensureSession(); await m.setWindow(1280,800);})"
