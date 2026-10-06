#!/usr/bin/env bash
# reconnect.sh — #25: web-02 drops off mid-build; Voltius reconnects and reattaches the same tmux session, build still going.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
HOST=promo-s-web-02
. "$HERE/lib.sh"
status() { run node do.mjs "const { useSessionStore: s } = await import('/src/stores/sessionStore.ts'); return s.getState().sessions[0]?.status" 2>/dev/null; }
stage
docker unpause $HOST >/dev/null 2>&1 || true
docker exec $HOST su deploy -c 'tmux -L voltius kill-server' 2>/dev/null || true
run node do.mjs sessions.js >/dev/null
run node do.mjs "$(sed 's/web-01/web-02/' "$HERE/single.js")" >/dev/null
sleep 2
run ./rec.sh reconnect.mjs reconnect > /tmp/promo-rec.log 2>&1 &
TAKE=$!
sleep 11
# A paused container is a dead link: nothing answers, the name still resolves.
mark cut; docker pause $HOST >/dev/null
until [ "$(status)" != connected ]; do sleep 0.5; done
mark lost; sleep 6
mark back; docker unpause $HOST >/dev/null
until [ "$(status)" = connected ]; do sleep 0.5; done
mark live
run touch back.flag
wait $TAKE || true
tail -3 /tmp/promo-rec.log
"$HERE/pull.sh" reconnect
