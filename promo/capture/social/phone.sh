#!/usr/bin/env bash
# phone.sh — #28: the mobile app (promo-phone, see capture/devices) opens a fleet host from its synced vault and runs a build.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
P=promo-phone
pr() { docker exec -w /tmp/work $P "$@"; }
pmark() { echo "$(date +%s.%3N) $1" | docker exec -i -w /tmp/work $P sh -c 'cat >> phone.marks'; }
live() { pr node do.mjs "const { useSessionStore: s } = await import('/src/stores/sessionStore.ts'); return s.getState().sessions.filter((x) => x.status === 'connected').length" 2>/dev/null; }
docker network connect promo-social-net $P 2>/dev/null || true
for f in phone-hosts.js phone-tap.mjs sessions.js; do docker cp "$HERE/$f" $P:/tmp/work/ >/dev/null; done
docker exec promo-s-api-02 su deploy -c 'tmux -L voltius kill-server' 2>/dev/null || true
pr node do.mjs phone-hosts.js >/dev/null
pr node do.mjs sessions.js >/dev/null
pr node phone-tap.mjs Hosts
pr sh -c ': > phone.marks; : > phone.cursor'
pr bash recstart.sh 412x892
sleep 2.5
pmark open; pr node phone-tap.mjs api-02
until [ "$(live)" -ge 1 ]; do sleep 0.3; done
pmark shell; sleep 2
pmark build; pr node type.mjs './build.sh\n'
sleep 9
pmark end; sleep 0.5
pr bash recstop.sh phone
C=$P "$HERE/pull.sh" phone
