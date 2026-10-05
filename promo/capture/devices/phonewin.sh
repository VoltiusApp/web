read D X < /tmp/work/disp; export DISPLAY=$D XAUTHORITY=$X
W=$(for w in $(xdotool search --name Voltius); do g=$(xdotool getwindowgeometry $w | awk '/Geometry/{print $2}'); [ "${g%x*}" -gt 100 ] && echo $w; done | head -1)
xdotool windowsize $W ${1%x*} ${1#*x}; xdotool windowmove $W 0 0
