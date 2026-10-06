#!/usr/bin/env bash
# palette.sh — #29: Ctrl+K, a host name, Enter, three times; each opens a live terminal.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
stage
run node do.mjs sessions.js >/dev/null
run node do.mjs "const { useUIStore: u } = await import('/src/stores/uiStore.ts'); u.getState().setRightPanelOpen(false); u.getState().setActiveNav('hosts'); return 1" >/dev/null
sleep 2
run ./rec.sh palette.mjs palette | tail -8
"$HERE/pull.sh" palette
