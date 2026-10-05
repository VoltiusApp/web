cd /tmp/work; kill -INT $(cat ff.pid); while kill -0 $(cat ff.pid) 2>/dev/null; do sleep 0.2; done
ffprobe -v error -show_entries packet=pts_time -of csv=p=0 raw.nut | head -1 > $1.start
ffmpeg -y -loglevel error -i raw.nut -c:v libx264 -crf 14 -preset medium -g 15 -pix_fmt yuv420p -an $1.mp4
echo "$1 start=$(cat $1.start) dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $1.mp4)"
