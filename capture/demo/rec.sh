#!/usr/bin/env bash
set -e
SCENE=$1; OUT=$2
cd /tmp/work
read D X < disp
export DISPLAY=$D XAUTHORITY=$X
: > cursor.txt; : > marks.txt
# -copyts keeps x11grab's wall-clock pts so cursor.txt/marks.txt epochs line up with frames.
ffmpeg -y -loglevel error -f x11grab -draw_mouse 0 -video_size 1280x800 -framerate 30 -i "$D+0,0" -copyts -c:v libx264 -preset ultrafast -qp 0 -f nut raw.nut &
FF=$!
trap 'kill -INT $FF 2>/dev/null || true' EXIT
sleep 1.0
node $SCENE
sleep 0.5
kill -INT $FF; wait $FF || true
ffprobe -v error -show_entries packet=pts_time -of csv=p=0 raw.nut | head -1 > $OUT.start
ffmpeg -y -loglevel error -i raw.nut -c:v libx264 -crf 12 -preset medium -pix_fmt yuv420p -an $OUT.mp4
cp cursor.txt $OUT.cursor; cp marks.txt $OUT.marks
echo "wrote $OUT start=$(cat $OUT.start) dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT.mp4)"; cat $OUT.marks
