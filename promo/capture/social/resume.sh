#!/usr/bin/env bash
# resume.sh [rec] — V13: drag a 4 GB folder to web-01, cut the link mid-copy, bring it back, let it finish.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
HOST=promo-s-web-01
. "$HERE/lib.sh"
remote_bytes() { local n; n=$(docker exec $HOST sh -c 'du -sb /home/deploy/backup-2026-10 2>/dev/null | cut -f1'); echo "${n:-0}"; }
page_has() { run node do.mjs "return document.body.innerText.includes(arguments[0])" "$1" 2>/dev/null | grep -q true; }

stage
docker exec $HOST sh -c 'rm -rf /home/deploy/backup-2026-10 /home/deploy/.backup-2026-10* /home/deploy/.*.voltius-part'
docker unpause $HOST >/dev/null 2>&1 || true
run node do.mjs 'const { useTransferQueueStore: q } = await import("/src/stores/transferQueueStore.ts"); q.getState().cancelAll(); q.getState().clearCompleted(); return q.getState().transfers.length' >/dev/null
run node prep_resume.mjs >/dev/null
if [ "${1:-}" = rec ]; then run ./rec.sh resume.mjs resume > /tmp/promo-rec.log 2>&1 & else run node resume.mjs & fi
TAKE=$!
until [ "$(remote_bytes)" -gt 1700000000 ]; do sleep 0.5; done
# A paused container drops nothing and answers nothing: the same blackhole a dead Wi-Fi link is, while its name still resolves.
mark cut; docker pause $HOST >/dev/null
until page_has 'Waiting for connection'; do sleep 0.5; done
mark waiting; sleep 4
mark back; docker unpause $HOST >/dev/null
until page_has 'Resumed at'; do sleep 0.5; done
mark resumed
until run node do.mjs 'return !document.querySelector("button[title=\"Cancel transfer\"]")' | grep -q true; do sleep 0.5; done
mark done
run touch done.flag
wait $TAKE || true
[ "${1:-}" = rec ] && tail -3 /tmp/promo-rec.log || true
