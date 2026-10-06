#!/usr/bin/env bash
# processes.sh — #43: a runaway report-worker on api-02 (a CPU-capped busy loop), found and killed from the Processes panel.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
HOST=promo-s-api-02
. "$HERE/lib.sh"
stage
runaway $HOST
docker exec $HOST pgrep -x report-worker | head -1 | docker exec -i -w /tmp/work promo-social sh -c 'cat > pid.txt'
run node do.mjs sessions.js >/dev/null
run node do.mjs "$(sed 's/web-01/api-02/' "$HERE/single.js")" >/dev/null
run node do.mjs "const { useUIStore: u } = await import('/src/stores/uiStore.ts'); u.getState().setRightPanelOpen(true); return 1" >/dev/null
sleep 3
run ./rec.sh processes.mjs processes | tail -8
"$HERE/pull.sh" processes
