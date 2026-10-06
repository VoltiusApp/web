#!/usr/bin/env bash
# hosttohost.sh — V6: drag a release folder from web-01 to web-02; it streams across as tar, nothing lands on the laptop.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
Q='const { useTransferQueueStore: q } = await import("/src/stores/transferQueueStore.ts");'
stage
# ~600 MB in ~1,900 files: long enough to watch, short enough not to drag.
docker exec promo-s-web-01 su deploy -c 'd=~/releases/site-v2.6.0; [ -d $d ] && exit 0; mkdir -p $d && cd $d
  for s in assets/img assets/js assets/css media/video media/audio docs vendor; do mkdir -p $s; done
  for i in $(seq 1 1500); do head -c $((20000 + RANDOM * 4)) /dev/urandom > assets/img/img-$i.webp; done
  for i in $(seq 1 300); do head -c $((4000 + RANDOM)) /dev/urandom > assets/js/chunk-$i.js; done
  for i in $(seq 1 60); do head -c 5000000 /dev/urandom > media/video/clip-$i.mp4; done
  for i in $(seq 1 40); do head -c 2000000 /dev/urandom > media/audio/track-$i.ogg; done'
docker exec promo-s-web-02 su deploy -c 'rm -rf ~/releases ~/site-v2.6.0 ~/.site-v2.6.0* ~/.*.voltius-part'
docker exec promo-s-web-02 su deploy -c 'mkdir -p ~/releases'
run node do.mjs "$Q q.getState().cancelAll(); q.getState().clearCompleted(); return 1" >/dev/null
run node prep_sftp.mjs web-01 releases web-02 releases >/dev/null
run ./rec.sh hosttohost.mjs hosttohost | tail -8
"$HERE/pull.sh" hosttohost
