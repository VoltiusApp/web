#!/usr/bin/env bash
set -e
SCENE=$1; OUT=$2; FPS=${FPS:-30}
read D X < /tmp/work/disp
export DISPLAY=$D XAUTHORITY=$X
: > /tmp/work/timeline.txt
ffmpeg -y -loglevel error -f x11grab -draw_mouse 0 -video_size 1440x900 -framerate $FPS -i "$D+0,0" -c:v libx264 -preset ultrafast -qp 0 -pix_fmt yuv444p /tmp/work/raw.mp4 &
FF=$!
sleep 1.0
node /tmp/work/$SCENE
sleep 0.5
kill -INT $FF; wait $FF || true
ffmpeg -y -loglevel error -ss 0.6 -i /tmp/work/raw.mp4 -c:v libx264 -crf 14 -preset medium -pix_fmt yuv420p -an /tmp/work/$OUT
cp /tmp/work/timeline.txt /tmp/work/$OUT.timeline
echo wrote $OUT; cat /tmp/work/timeline.txt
