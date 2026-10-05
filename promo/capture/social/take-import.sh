#!/usr/bin/env bash
# take-import.sh SOURCE... — empty vault, source data in place, record the import as take import-SOURCE.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
stage
node "$HERE/sources.mjs"
node -e "import('$HERE/stubs.mjs').then(m=>{const fs=require('fs');fs.writeFileSync('/tmp/promo-termius.js',m.termiusStub());fs.writeFileSync('/tmp/promo-moba.js',m.mobaxtermStub);fs.writeFileSync('/tmp/promo-hosts.csv',m.CSV)})"
for f in promo-termius.js promo-moba.js promo-hosts.csv; do docker cp /tmp/$f promo-social:/tmp/work/$f >/dev/null; done
for s in "$@"; do
  run node do.mjs 'location.reload(); return 1' >/dev/null; sleep 3
  run node do.mjs vault.js
  run node do.mjs sessions.js >/dev/null
  run node do.mjs clean.js >/dev/null
  run node do.mjs vault.js
  case $s in
    termius) run node do.mjs promo-termius.js ;;
    mobaxterm) run node do.mjs promo-moba.js ;;
    csv) run sh -c 'read D X < disp; (DISPLAY=$D XAUTHORITY=$X xclip -selection clipboard -i < promo-hosts.csv &) ; sleep 0.5' ;;
  esac
  sleep 1.5
  run ./rec.sh "import.mjs $s" "import-$s" | tail -1
done
"$HERE/pull.sh" $(for s in "$@"; do echo "import-$s"; done)
