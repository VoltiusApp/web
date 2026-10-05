#!/usr/bin/env bash
# Off camera: empty vault, then the 12-host fleet ("deploy" identity; folders unless FLAT=1) through the real Termius import UI.
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
. "$HERE/lib.sh"
stage
FLAT=${FLAT:-} node -e "import('$HERE/stubs.mjs').then(m=>require('fs').writeFileSync('/tmp/promo-termius.js',m.termiusStub({ folders: !process.env.FLAT })))"
docker cp /tmp/promo-termius.js promo-social:/tmp/work/promo-termius.js >/dev/null
run node do.mjs 'location.reload(); return 1' >/dev/null; sleep 3
run node do.mjs vault.js >/dev/null
run node do.mjs sessions.js >/dev/null
run node do.mjs clean.js >/dev/null
run node do.mjs vault.js
run node do.mjs promo-termius.js >/dev/null
run node import.mjs termius ${FLAT:+flat} >/dev/null
run node do.mjs 'const { useConnectionStore } = await import("/src/stores/connectionStore.ts"); return useConnectionStore.getState().connections.length + " hosts"'
