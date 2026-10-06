#!/usr/bin/env bash
# pair.sh — V12 (#45): promo-laptop (demo@voltius.app, the host) shares web-01 with sam@voltius.app in promo-social.
# Sam watches, can't type, asks for control, gets it, types; the host takes it back. Both screens record on one wall clock.
# Both instances are signed in to the isolated promo-sync-server (capture/devices/setup.sh; sam registered there by hand).
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
L=promo-laptop; S=promo-social
on() { local c=$1; shift; docker exec -w /tmp/work "$c" node act.mjs "$@"; }
js() { docker exec -w /tmp/work "$1" node do.mjs "$2" >/dev/null; }
for c in $L $S; do for f in act.mjs; do docker cp "$HERE/$f" $c:/tmp/work/ >/dev/null; done; done
docker cp "$HERE/../demo/mouse.mjs" $L:/tmp/work/ >/dev/null

# Off camera: host not sharing, popovers closed; guest on the Vaults home, side panel shut.
js $L "const b = (t) => [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === t); b('Sharing')?.click(); await new Promise((r) => setTimeout(r, 800)); b('Stop sharing')?.click(); await new Promise((r) => setTimeout(r, 800));
  if (document.querySelector('input[placeholder^=\"Search by @handle\"]')) b('Share')?.click(); return 1"
js $S "[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Leave')?.click(); const { useUIStore: u } = await import('/src/stores/uiStore.ts'); u.getState().setRightPanelOpen(false); document.querySelector('button')?.click(); return 1"
# No Escape on the host here: its terminal has focus, and bash keeps a lone ESC as Meta for the next key (M-. yanked ./deploy.sh).
on $S esc
sleep 2
for c in $L $S; do docker exec -w /tmp/work $c sh -c ': > cursor.txt; : > marks.txt'; done
# A failed step must not leave both recorders running.
trap 'for c in $L $S; do docker exec -w /tmp/work $c sh -c "kill -INT \$(cat ff.pid) 2>/dev/null; rm -f raw.nut"; done' ERR
docker exec -w /tmp/work $L bash recstart.sh 1280x800
docker exec -w /tmp/work $S bash recstart.sh 1280x800
sleep 2.5

on $L mark share; on $L text Share; on $L idle 600
on $L css 'input[placeholder^="Search by @handle"]'; on $L type 'sam@voltius.app'; on $L wait '@noble'; on $L idle 1500
on $L mark invite; on $L starts '@noble'; on $L idle 900; on $L esc
on $S wait Join; on $S idle 1200
on $S mark join; on $S last Join; on $S idle 2500
on $S mark blocked; on $S term; on $S type 'ls'; on $S idle 1500
on $S mark request; on $S text 'Request Control'; on $S idle 5500
on $L mark grant; on $L text Grant; on $L idle 1200
on $S mark typed; on $S term; on $S type './deploy.sh status\n'; on $S idle 3000
on $L mark revoke; on $L text Revoke; on $L idle 2500
on $S mark end; sleep 0.5

trap - ERR
docker exec -w /tmp/work $L bash recstop.sh pair-host
docker exec -w /tmp/work $S bash recstop.sh pair-guest
for p in "$L pair-host" "$S pair-guest"; do set -- $p
  docker exec -w /tmp/work $1 sh -c "cp cursor.txt $2.cursor; cp marks.txt $2.marks"
  C=$1 "$HERE/pull.sh" $2
done
