read D X < /tmp/work/disp; export DISPLAY=$D XAUTHORITY=$X
ffmpeg -loglevel error -y -f x11grab -video_size ${2:-1280x800} -i "$D+0,0" -frames:v 1 /tmp/work/$1.png
