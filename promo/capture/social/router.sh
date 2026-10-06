#!/usr/bin/env bash
# router.sh — #34: a real OpenWrt 23.05 over SSH (busybox, no base64 applet) opens like any host.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
stage
run node do.mjs sessions.js >/dev/null
run node do.mjs hosts-page.js >/dev/null
sleep 2
run ./rec.sh router.mjs router | tail -8
"$HERE/pull.sh" router
