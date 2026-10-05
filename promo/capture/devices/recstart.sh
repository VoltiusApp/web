read D X < /tmp/work/disp; export DISPLAY=$D XAUTHORITY=$X
cd /tmp/work; rm -f raw.nut
nohup ffmpeg -y -loglevel error -f x11grab -draw_mouse 0 -video_size $1 -framerate 30 -i "$D+0,0" -copyts -c:v libx264 -preset ultrafast -qp 0 -f nut raw.nut > ff.log 2>&1 &
echo $! > ff.pid
