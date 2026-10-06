#!/usr/bin/env bash
# snippet.sh — #32: a saved snippet with two variables runs on web-03 from the side panel, asking for both first.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
stage
run node do.mjs snippet-seed.js >/dev/null
run node do.mjs sessions.js >/dev/null
run node do.mjs "const { useSessionStore: s } = await import('/src/stores/sessionStore.ts'); const { useConnectionStore: c } = await import('/src/stores/connectionStore.ts'); const { useUIStore: u } = await import('/src/stores/uiStore.ts');
  s.getState().setActive(await s.getState().connect(c.getState().connections.find((x) => x.name === 'web-03').id)); u.getState().setActiveNav('terminal'); await new Promise((r) => setTimeout(r, 4000));
  if (!document.querySelector('button[title=\"Snippets\"]')) document.querySelector('button[title^=\"Themes & tools\"]').click();
  await new Promise((r) => setTimeout(r, 800)); document.querySelector('button[title=\"Snippets\"]').click(); return 1" >/dev/null
sleep 2
run ./rec.sh snippet.mjs snippet | tail -8
"$HERE/pull.sh" snippet
