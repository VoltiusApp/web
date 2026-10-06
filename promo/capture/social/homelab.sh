#!/usr/bin/env bash
# Off camera, for V11: docker-01 (real Docker, in dind), pve-01 (`pct` answered by real containers on a second dind), an OpenWrt router over SSH and over serial.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
NET=promo-social-net
OPENWRT=openwrt/rootfs@sha256:f039e07870639d6f6eaf685df286f1130942acfd38cba333be5eaba65a173d74
in_dind() { local d=$1; shift; docker exec "$d" docker "$@"; }
up() { docker ps --format '{{.Names}}' | grep -qx "$1"; }

# Two daemons, so docker-01's container list never shows pve-01's LXCs.
for d in dind dind-pve; do
  up promo-s-$d || { docker rm -f promo-s-$d >/dev/null 2>&1 || true
    docker run -d --privileged --name promo-s-$d --network $NET --network-alias $d -e DOCKER_TLS_CERTDIR= docker:27-dind >/dev/null; }
  until in_dind promo-s-$d info >/dev/null 2>&1; do sleep 1; done
done

in_dind promo-s-dind-pve image inspect promo-fleet >/dev/null 2>&1 || docker save promo-fleet | docker exec -i promo-s-dind-pve docker load >/dev/null
# LXCs on pve-01: vmid, hostname, running?
for ct in 101:pihole:1 102:jellyfin:1 103:gitea:1 104:nextcloud:1 105:test-debian:0; do
  IFS=: read id name run <<<"$ct"
  in_dind promo-s-dind-pve inspect ct-$id >/dev/null 2>&1 || in_dind promo-s-dind-pve run -d --name ct-$id --hostname $name promo-fleet >/dev/null
  [ "$run" = 1 ] || in_dind promo-s-dind-pve stop -t 1 ct-$id >/dev/null
done
# Containers on docker-01.
run_app() { in_dind promo-s-dind inspect "$1" >/dev/null 2>&1 || in_dind promo-s-dind run -d --restart unless-stopped --name "$@" >/dev/null; }
run_app proxy -p 80:80 nginx:alpine
run_app vaultwarden -v vaultwarden:/data vaultwarden/server:latest-alpine
run_app uptime-kuma louislam/uptime-kuma:1
run_app redis redis:7-alpine
run_app postgres -e POSTGRES_PASSWORD=promo postgres:16-alpine

docker build -q -t promo-homelab "$HERE/homelab" >/dev/null
for h in docker-01 pve-01; do
  up promo-s-$h || { docker rm -f promo-s-$h >/dev/null 2>&1 || true
    docker run -d --name promo-s-$h --hostname $h --network $NET --network-alias $h promo-homelab >/dev/null; }
done
docker exec promo-s-docker-01 ln -sf /opt/homelab/dk /usr/local/bin/docker
docker exec promo-s-pve-01 sh -c 'mkdir -p /etc/pve && ln -sf /opt/homelab/pct /usr/local/bin/pct && ln -sf /opt/homelab/pvesh /usr/local/bin/pvesh'

up promo-s-router || { docker rm -f promo-s-router >/dev/null 2>&1 || true
  docker run -d --name promo-s-router --hostname OpenWrt --network $NET --network-alias router $OPENWRT \
    sh -c 'mkdir -p /var/lock /var/run; rm -f /etc/dropbear/dropbear_*; dropbearkey -t ed25519 -f /etc/dropbear/dropbear_ed25519_host_key >/dev/null; printf "openwrt\nopenwrt\n" | passwd root >/dev/null 2>&1; exec dropbear -F -E' >/dev/null; }
# The same router on the end of an emulated serial cable at /dev/ttyUSB0 in the capture container.
docker exec -u root promo-social sh -c 'test -f /root/.ssh/router || { mkdir -p /root/.ssh && ssh-keygen -q -t ed25519 -N "" -f /root/.ssh/router; }'
docker exec -u root promo-social cat /root/.ssh/router.pub | docker exec -i promo-s-router sh -c 'cat > /etc/dropbear/authorized_keys && chmod 600 /etc/dropbear/authorized_keys'
docker cp "$HERE/serial-router.py" promo-social:/tmp/work/ >/dev/null
docker exec promo-social test -e /dev/ttyUSB0 || docker exec -u root -d promo-social python3 /tmp/work/serial-router.py
echo "homelab: $(docker exec promo-s-pve-01 su deploy -c 'pct list' | tail -n +2 | wc -l) LXCs, $(docker exec promo-s-docker-01 su deploy -c 'docker ps -q' | wc -l) containers"
