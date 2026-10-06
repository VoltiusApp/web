#!/usr/bin/env bash
# mcp.sh — V4 (#35, #36): turn the MCP server on, then Claude Code in a local tab finds api-02's runaway process over MCP.
# Needs ./claude.sh in first; run ./claude.sh out afterwards.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
stage
runaway promo-s-api-02
run node do.mjs sessions.js >/dev/null
run node do.mjs "const { useToggleSettingsStore: t } = await import('/src/stores/toggleSettingsStore.ts'); const { useSessionStore: s } = await import('/src/stores/sessionStore.ts'); const { useUIStore: u } = await import('/src/stores/uiStore.ts');
  t.getState().set('mcp-server', false); u.getState().setRightPanelOpen(false); await s.getState().connectLocal(); u.getState().setActiveNav('terminal');
  await new Promise((r) => setTimeout(r, 2500)); u.getState().openSettings('integrations'); return 1" >/dev/null
sleep 2
run ./rec.sh mcp.mjs mcp | tail -10
"$HERE/pull.sh" mcp
