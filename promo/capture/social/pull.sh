#!/usr/bin/env bash
# pull.sh NAME... — copies takes recorded by rec.sh out of promo-social (or $C) into public/social/ and writes src/social/takes/NAME.json.
set -euo pipefail
PROMO=$(cd "$(dirname "$0")/../.." && pwd)
mkdir -p "$PROMO/public/social" "$PROMO/src/social/takes"
for n in "$@"; do
  for ext in mp4 start cursor marks; do docker cp "${C:-promo-social}:/tmp/work/$n.$ext" "$PROMO/public/social/$n.$ext" >/dev/null; done
  IFS=x read W H < <(docker exec -w /tmp/work "${C:-promo-social}" ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$n.mp4")
  W=$W H=$H node --input-type=module -e '
    import { writeFileSync } from "fs";
    import { takeData } from "'"$PROMO"'/capture/take-data.mjs";
    const [dir, out, n] = process.argv.slice(1);
    writeFileSync(`${out}/${n}.json`, JSON.stringify({ src: `social/${n}.mp4`, w: +process.env.W, h: +process.env.H, ...takeData(dir, n) }));
  ' "$PROMO/public/social" "$PROMO/src/social/takes" "$n"
  echo "$n $(node -e 'const t=require(process.argv[1]); console.log(JSON.stringify(t.marks))' "$PROMO/src/social/takes/$n.json")"
done
