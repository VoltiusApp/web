read D X < /tmp/work/disp; export DISPLAY=$D XAUTHORITY=$X
cd /tmp/work
# Two recorders on one raw.nut interleave into garbage.
if [ -f ff.pid ] && kill -0 "$(cat ff.pid)" 2>/dev/null; then echo "recstart: a recorder is already running" >&2; exit 1; fi
rm -f raw.nut
nohup ffmpeg -y -loglevel error -f x11grab -draw_mouse 0 -video_size $1 -framerate 30 -i "$D+0,0" -copyts -c:v libx264 -preset ultrafast -qp 0 -f nut raw.nut > ff.log 2>&1 &
echo $! > ff.pid
