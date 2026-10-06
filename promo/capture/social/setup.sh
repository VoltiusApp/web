#!/usr/bin/env bash
# Capture container `promo-social` + a 12-host Debian fleet on their own network, then stages the scripts in /tmp/work.
# WT = voltius worktree at the release to show, BIN = dir with that release's debug binary named `voltius`.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/../container.sh"
: "${WT:?voltius worktree}" "${BIN:?dir with voltius binary}"
NET=promo-social-net
APP=promo-social
FLEET=(web-01 web-02 web-03 web-04 api-01 api-02 api-03 db-01 db-02 cache-01 worker-01 worker-02)

docker network inspect $NET >/dev/null 2>&1 || docker network create $NET >/dev/null
docker build -q -t promo-fleet "$HERE/fleet" >/dev/null
for h in "${FLEET[@]}"; do
  docker ps --format '{{.Names}}' | grep -qx "promo-s-$h" && continue
  docker rm -f "promo-s-$h" >/dev/null 2>&1 || true
  docker run -d --name "promo-s-$h" --hostname "$h" --network $NET --network-alias "$h" promo-fleet >/dev/null
done

[ -d "$WT/node_modules" ] || (cd "$WT" && CI=true pnpm install --frozen-lockfile)
capture_container $APP work-laptop 1920x1200 1280x800 $NET "$WT" "$BIN"
docker cp "$HERE/../demo/wd.mjs" $APP:/tmp/work/ >/dev/null
docker cp "$HERE/../demo/mouse.mjs" $APP:/tmp/work/ >/dev/null
for f in rec.sh ui.mjs; do docker cp "$HERE/../demo/$f" $APP:/tmp/work/ >/dev/null; done
for f in boot.mjs do.mjs type.mjs recstart.sh recstop.sh; do docker cp "$HERE/../devices/$f" $APP:/tmp/work/ >/dev/null; done
docker cp "$HERE/." $APP:/tmp/work/ >/dev/null
echo "setup ok: $(docker exec -w / $APP cat /tmp/work/disp)"
