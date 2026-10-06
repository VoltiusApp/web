#!/usr/bin/env bash
# claude.sh in|out — puts this machine's Claude Code (binary + login) into promo-social for the V4 takes, or removes the login again.
# The login never leaves this box and never lands in the repo: it is copied from ~/.claude at run time.
set -euo pipefail
B=/home/builder
case "${1:-}" in
  in)
    docker cp -L "$HOME/.local/bin/claude" promo-social:$B/claude-bin >/dev/null
    docker exec -u root promo-social sh -c "install -D -o builder -g builder -m 755 $B/claude-bin /usr/local/bin/claude && rm $B/claude-bin && mkdir -p $B/.claude && chown builder:builder $B/.claude"
    docker cp "$HOME/.claude/.credentials.json" promo-social:$B/.claude/.credentials.json >/dev/null
    docker exec -u root promo-social sh -c "chown builder:builder $B/.claude/.credentials.json && chmod 600 $B/.claude/.credentials.json"
    docker exec -i promo-social sh -c "cat > $B/.claude.json" <<JSON
{"hasCompletedOnboarding": true, "theme": "dark", "autoUpdates": false,
 "projects": {"$B": {"hasTrustDialogAccepted": true, "allowedTools": []}},
 "mcpServers": {"voltius": {"type": "stdio", "command": "/promobin/voltius", "args": ["mcp"]}}}
JSON
    docker exec promo-social claude --version ;;
  out)
    docker exec promo-social rm -f $B/.claude/.credentials.json
    docker exec promo-social sh -c "test ! -e $B/.claude/.credentials.json" && echo "login removed" ;;
  *) echo "usage: $0 in|out" >&2; exit 2 ;;
esac
