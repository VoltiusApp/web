#!/usr/bin/env bash
# serial.sh — #41: the OpenWrt router on /dev/ttyUSB0 (homelab.sh), opened from the Serial button; DTR, RTS and break in the status bar.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
stage
run node do.mjs sessions.js >/dev/null
run node do.mjs hosts-page.js >/dev/null
sleep 2
run ./rec.sh serial.mjs serial | tail -8
"$HERE/pull.sh" serial
