#!/usr/bin/env bash
# Re-record the README/landing demo from scratch, then rebuild the Remotion data. See README.md.
set -euo pipefail
cd "$(dirname "$0")"
./capture/demo/setup.sh
docker exec tauri-promo /tmp/work/run_all.sh
for f in A B; do for e in mp4 start cursor marks; do docker cp "tauri-promo:/tmp/work/$f.$e" "public/demo/$f.$e"; done; done
node capture/demo/build-data.mjs
echo "next: node stills.mjs Demo <frames...> to check, then ./encode-demo.sh"
