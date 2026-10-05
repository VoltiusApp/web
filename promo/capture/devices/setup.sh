#!/usr/bin/env bash
# Laptop + phone (mobile shell forced via localStorage) on one account of an isolated sync server.
# WT = voltius worktree (platform.patch gets applied), BIN = dir with a voltius debug binary named `voltius`.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
: "${WT:?voltius worktree}" "${BIN:?dir with voltius binary}"
NET=voltius-headless_voltius-test
ACCOUNT="http://promo-sync-server:8080 demo@voltius.app promo-demo-2026"

git -C "$WT" apply --check "$HERE/platform.patch" 2>/dev/null && git -C "$WT" apply "$HERE/platform.patch"
[ -d "$WT/node_modules" ] || (cd "$WT" && CI=true pnpm install --frozen-lockfile)

if ! docker ps --format '{{.Names}}' | grep -qx promo-sync-server; then
  docker run -d --name promo-sync-db --network $NET -e POSTGRES_USER=voltius -e POSTGRES_PASSWORD=promopass -e POSTGRES_DB=voltius postgres:16-alpine >/dev/null
  until docker exec promo-sync-db pg_isready -U voltius >/dev/null 2>&1; do sleep 1; done
  docker run -d --name promo-sync-server --network $NET -e DATABASE_URL=postgres://voltius:promopass@promo-sync-db:5432/voltius \
    -e JWT_SECRET="$(openssl rand -hex 32)" -e PORT=8080 -e SYNC_RATE_LIMIT=100000 -e AUTH_RATE_LIMIT=100000 -e REGISTER_RATE_LIMIT=100000 \
    ghcr.io/voltiusapp/voltius-server:sha-d6dab56 >/dev/null
fi

docker cp "$HERE/deploy.sh" promo-web-01:/home/deploy/deploy.sh
docker exec promo-web-01 sh -c 'chown deploy:users /home/deploy/deploy.sh && chmod +x /home/deploy/deploy.sh && su deploy -c "tmux -L voltius kill-server" 2>/dev/null || true'
WEB01=$(docker inspect promo-web-01 --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')

device() { # name hostname screen win
  if ! docker ps --format '{{.Names}}' | grep -qx "promo-$1"; then
    docker rm -f "promo-$1" >/dev/null 2>&1 || true
    docker run -d --name "promo-$1" --hostname "$2" --network $NET --security-opt seccomp=unconfined \
      -e WEBKIT_DISABLE_COMPOSITING_MODE=1 -e VOLTIUS_KEYCHAIN_NS="promo$1" -e WD_APP=/promobin/voltius -e WD_WIN="$4" \
      -v "$WT":/app -v "$BIN":/promobin:ro tauri-mcp \
      bash -c "cd /app && (node node_modules/vite/bin/vite.js > /tmp/vite.log 2>&1 &) && keyctl session - xvfb-run --auto-servernum -s '-screen 0 ${3}x24' sleep infinity" >/dev/null
    docker exec -u root -w / "promo-$1" sh -c "echo '$WEB01 web-01.acme.io' >> /etc/hosts"
    until docker exec -w / "promo-$1" sh -c 'ls -d /tmp/xvfb-run.* && grep -q "ready in" /tmp/vite.log' >/dev/null 2>&1; do sleep 1; done
    local X; X=$(docker exec -w / "promo-$1" sh -c 'ls -d /tmp/xvfb-run.*')/Xauthority
    docker exec -w / "promo-$1" sh -c "mkdir -p /tmp/work && echo ':99 $X' > /tmp/work/disp"
    docker exec -d -w / "promo-$1" sh -c "DISPLAY=:99 XAUTHORITY=$X tauri-driver --port 4444 --native-port 4446 > /tmp/driver.log 2>&1"
  fi
  docker cp "$HERE/../demo/wd.mjs" "promo-$1":/tmp/work/ >/dev/null
  docker cp "$HERE/." "promo-$1":/tmp/work/ >/dev/null
}
run() { docker exec -w /tmp/work "promo-$1" "${@:2}"; }

device laptop work-laptop 1920x1200 1280x800
run laptop node boot.mjs
run laptop node do.mjs account.js "$ACCOUNT"
run laptop node do.mjs host.js
run laptop node type.mjs 'clear\n'

# After the laptop: two vites optimizing the shared node_modules/.vite at once corrupt it.
device phone phone 1000x2000 412x892
run phone node boot.mjs
run phone bash phonewin.sh 412x892
run phone node do.mjs 'localStorage.setItem("promo:platform","android"); location.reload(); return 1'
sleep 8
run phone node do.mjs account.js "$ACCOUNT --signin"
run phone node do.mjs phone-home.js work-laptop
