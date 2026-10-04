#!/usr/bin/env bash
# Render the Demo composition and encode the README WebP + landing mp4 into out/.
set -euo pipefail
cd "$(dirname "$0")"
npx remotion render src/index.ts Demo out/demo-master.mp4 --crf 16 --concurrency 2
docker cp out/demo-master.mp4 tauri-promo:/tmp/work/demo-master.mp4
docker exec -w /tmp/work tauri-promo sh -c '
  ffmpeg -v error -y -i demo-master.mp4 -vf "fps=15,scale=960:-1:flags=lanczos" -c:v libwebp_anim -lossless 0 -q:v ${WEBP_Q:-85} -compression_level 6 -loop 0 demo.webp
  ffmpeg -v error -y -i demo-master.mp4 -c:v libx264 -preset slow -crf ${MP4_CRF:-21} -pix_fmt yuv420p -movflags +faststart -an demo.mp4'
docker cp tauri-promo:/tmp/work/demo.webp out/demo.webp
docker cp tauri-promo:/tmp/work/demo.mp4 out/demo.mp4
ls -la out/demo.webp out/demo.mp4
