#!/usr/bin/env bash
# edit.sh — #19: double-click a config file on web-01, edit it in Voltius, Ctrl+S, and the server has it.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
stage
docker exec promo-s-web-01 su deploy -c 'mkdir -p ~/app && printf "server:\n  host: 0.0.0.0\n  port: 8080\n  workers: 4\ndatabase:\n  url: postgres://db-01/acme\n  pool: 20\nlog_level: info\n" > ~/app/config.yml'
run node do.mjs sessions.js >/dev/null
run node do.mjs "const { useEditorStore: e } = await import('/src/stores/editorStore.ts'); for (const t of [...e.getState().tabs]) e.getState().closeTab(t.id); return 1" >/dev/null
# Panes first: with a terminal open, the pickers' typing would land in it.
run node prep_sftp.mjs 'Local Machine' '' web-01 app >/dev/null
run node do.mjs single.js >/dev/null
run node do.mjs "const { useUIStore: u } = await import('/src/stores/uiStore.ts'); u.getState().setSftpPanelOpen(true); return 1" >/dev/null
sleep 2
run ./rec.sh edit.mjs edit | tail -8
"$HERE/pull.sh" edit
