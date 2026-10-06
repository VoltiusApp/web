#!/usr/bin/env bash
# homelab-take.sh — #40: pve-01's LXCs and docker-01's containers in the side panel, a shell in one click each.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
stage
run node do.mjs homelab-vault.js >/dev/null
run node do.mjs sessions.js >/dev/null
run node do.mjs "const { useSessionStore: s } = await import('/src/stores/sessionStore.ts'); const { useConnectionStore: c } = await import('/src/stores/connectionStore.ts'); const id = (n) => c.getState().connections.find((x) => x.name === n).id;
  const { useUIStore: u } = await import('/src/stores/uiStore.ts');
  await s.getState().connect(id('docker-01')); s.getState().setActive(await s.getState().connect(id('pve-01'))); u.getState().setActiveNav('terminal'); await new Promise((r) => setTimeout(r, 5000));
  if (!document.querySelector('button[title=\"Proxmox\"]')) document.querySelector('button[title^=\"Themes & tools\"]').click();
  await new Promise((r) => setTimeout(r, 800)); document.querySelector('button[title=\"Proxmox\"]').click(); return 1" >/dev/null
sleep 3
run ./rec.sh homelab.mjs homelab | tail -8
"$HERE/pull.sh" homelab
