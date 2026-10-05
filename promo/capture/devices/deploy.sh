#!/bin/sh
G='\033[32m'; C='\033[36m'; D='\033[2m'; B='\033[1m'; R='\033[0m'
if [ "$1" = status ]; then
  printf "${G}●${R} ${B}acme-api${R} v2.5.0 ${G}healthy${R}\n${D}  uptime 42s · 4/4 workers · p95 38ms${R}\n"; exit 0
fi
step() { printf "${C}▸${R} %s\n" "$1"; }
ok() { printf "  ${G}✓${R} %s ${D}%s${R}\n" "$1" "$2"; }
printf "${B}deploy${R} acme-api ${D}v2.4.1 → v2.5.0${R}\n\n"; sleep 1
step "pull image ghcr.io/acme/api:2.5.0"
for p in 12 31 47 63 78 91 100; do printf "\r  ${D}layers${R} %3d%%" $p; sleep 0.9; done; printf "\n"; ok "image pulled" "184 MB"; sleep 0.8
step "run migrations"
for m in 0041_add_invoices 0042_index_invoices_user 0043_backfill_currency; do sleep 1.6; ok "$m"; done; sleep 0.6
step "rolling restart"
for w in 1 2 3 4; do sleep 2.2; ok "worker $w/4" "ready in 1.$((w+2))s"; done; sleep 0.6
step "health checks"
for i in 1 2 3; do sleep 1.4; ok "GET /health" "200 · ${i}${i}ms"; done
sleep 0.8; printf "\n${G}${B}✓ deployed v2.5.0${R} ${D}in 31s${R}\n"
