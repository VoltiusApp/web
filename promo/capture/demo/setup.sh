#!/usr/bin/env bash
# Idempotent: brings the fake fleet, its files and the capture container's work dir to the state the takes expect.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
APP=tauri-promo
NET=voltius-headless_voltius-test
FLEET=(web-01 web-02 db-primary cache-01)
# Extra host names from the Termius stub, spread over the four real containers.
declare -A ALIASES=([web-01]="api-gateway k8s-node-1 grafana" [web-02]="k8s-node-2 ci-runner" [db-primary]="db-replica analytics" [cache-01]="pihole nas-01")

docker inspect "$APP" >/dev/null 2>&1 || { echo "missing container $APP — see README.md 'Capture container'"; exit 1; }

for h in "${FLEET[@]}"; do
  c=promo-$h
  if ! docker inspect "$c" >/dev/null 2>&1; then
    docker run -d --name "$c" --hostname "$h" --network "$NET" --network-alias "$h" \
      -e PUID=1000 -e PGID=1000 -e USER_NAME=deploy -e USER_PASSWORD=deploy -e PASSWORD_ACCESS=true -e SUDO_ACCESS=true \
      lscr.io/linuxserver/openssh-server:latest >/dev/null
    for _ in $(seq 30); do docker exec "$c" getent passwd deploy >/dev/null 2>&1 && break; sleep 1; done
  fi
  docker start "$c" >/dev/null
  docker exec "$c" sh -c 'mkdir -p /home/deploy/app && usermod -d /home/deploy deploy 2>/dev/null; chown -R deploy:users /home/deploy'
done

docker cp "$HERE/fleet/docker" promo-web-01:/usr/local/bin/docker
docker exec promo-web-01 sh -c '
  chmod 755 /usr/local/bin/docker
  d=/home/deploy/releases; mkdir -p $d && cd $d
  [ -s release-v2.4.0.tar.gz ] || head -c 170000000 /dev/urandom > release-v2.4.0.tar.gz
  [ -s release-v2.4.1.tar.gz ] || head -c 175000000 /dev/urandom > release-v2.4.1.tar.gz
  ln -sfn release-v2.4.1.tar.gz current.tar.gz
  rm -f release-v2.5.0.tar.gz
  chown -R deploy:users $d'

docker exec "$APP" sh -c '
  p=/home/builder/Projects/acme-api; mkdir -p $p/src $p/deploy && cd $p
  [ -s README.md ] || echo "# acme-api" > README.md
  [ -s package.json ] || printf "{\n  \"name\": \"acme-api\"\n}\n" > package.json
  [ -s assets.zip ] || head -c 300000 /dev/urandom > assets.zip
  [ -s src/index.ts ] || echo "export {};" > src/index.ts
  [ -s deploy/nginx.conf ] || echo "server {}" > deploy/nginx.conf
  [ "$(stat -c %s release-v2.5.0.tar.gz 2>/dev/null)" = 64000000 ] || head -c 64000000 /dev/urandom > release-v2.5.0.tar.gz'

lines=""
for h in "${FLEET[@]}"; do
  ip=$(docker inspect -f "{{(index .NetworkSettings.Networks \"$NET\").IPAddress}}" "promo-$h")
  lines+="$ip ${ALIASES[$h]} # promo"$'\n'
done
docker exec -u root -i "$APP" sh -c 'grep -v "# promo$" /etc/hosts > /tmp/hosts.new; cat >> /tmp/hosts.new; cat /tmp/hosts.new > /etc/hosts' <<<"$lines"

docker exec "$APP" mkdir -p /tmp/work
docker cp "$HERE/." "$APP:/tmp/work/"
docker exec "$APP" sh -c 'pid=$(pgrep -f voltius-bin | head -1); [ -n "$pid" ] || { echo "app not running in container"; exit 1; }
  e=$(tr "\0" "\n" </proc/$pid/environ); echo "$(echo "$e" | sed -n "s/^DISPLAY=//p") $(echo "$e" | sed -n "s/^XAUTHORITY=//p")" > /tmp/work/disp'
echo "setup ok: $(docker exec "$APP" cat /tmp/work/disp)"
