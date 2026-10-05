#!/usr/bin/env bash
# Records laptop + phone on one wall clock, writes public/devices/{laptop,phone}.mp4 and src/devices/take.json.
set -euo pipefail
PROMO=$(cd "$(dirname "$0")/../.." && pwd)
run() { docker exec -w /tmp/work "promo-$1" "${@:2}"; }
now() { date +%s.%N | cut -c1-14; }
declare -A M

run laptop bash recstart.sh 1280x800
run phone bash recstart.sh 412x892
sleep 2
M[laptopType]=$(now); run laptop node type.mjs './deploy.sh\n'; M[laptopEnter]=$(now)
sleep 6.5
TAP=$(run phone node tap.mjs '[data-mobile-remote-session]')
until ! docker exec promo-web-01 pgrep -f 'deploy.sh$' >/dev/null; do sleep 0.5; done; M[deployDone]=$(now)
sleep 2.5
M[phoneType]=$(now); run phone node type.mjs './deploy.sh status\n'; M[phoneEnter]=$(now)
sleep 4
run laptop bash recstop.sh laptop
run phone bash recstop.sh phone

mkdir -p "$PROMO/public/devices"
for d in laptop phone; do docker cp "promo-$d:/tmp/work/$d.mp4" "$PROMO/public/devices/$d.mp4"; done
node -e '
const [ls, ps, tap, ...kv] = process.argv.slice(1);
const base = Math.floor(+ls);
const r = (v) => +(v - base).toFixed(3);
const [at, x, y] = JSON.parse(tap);
const marks = Object.fromEntries(kv.map((p) => p.split("=")).map(([k, v]) => [k, r(+v)]));
console.log(JSON.stringify({
  laptop: { src: "devices/laptop.mp4", start: r(+ls), w: 1280, h: 800 },
  phone: { src: "devices/phone.mp4", start: r(+ps), w: 412, h: 892 },
  tap: { at: r(at), x, y },
  marks,
}, null, 2));
' "$(run laptop cat laptop.start)" "$(run phone cat phone.start)" "$TAP" $(for k in "${!M[@]}"; do echo "$k=${M[$k]}"; done) > "$PROMO/src/devices/take.json"
cat "$PROMO/src/devices/take.json"
