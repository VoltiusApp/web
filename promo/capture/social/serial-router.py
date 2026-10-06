# A router on the end of a serial cable: /dev/ttyUSB0 is one pty, the OpenWrt container's login shell runs on another, bytes are copied between.
# Run as root inside promo-social (writes /dev; homelab.sh gives root a key the router accepts). SIGTERM unplugs.
import os, pty, select, signal, sys, tty

LINK = "/dev/ttyUSB0"
cable_master, cable_slave = pty.openpty()
tty.setraw(cable_slave)
os.chmod(os.ttyname(cable_slave), 0o666)
if os.path.lexists(LINK):
    os.unlink(LINK)
os.symlink(os.ttyname(cable_slave), LINK)

def unplug(*_):
    if os.path.islink(LINK):
        os.unlink(LINK)
    sys.exit(0)

signal.signal(signal.SIGTERM, unplug)

while True:
    pid, console = pty.fork()
    if pid == 0:
        os.environ["TERM"] = "xterm-256color"
        os.execvp("ssh", ["ssh", "-tt", "-q", "-i", "/root/.ssh/router", "-o", "StrictHostKeyChecking=no", "-o", "UserKnownHostsFile=/dev/null", "root@router"])
    while True:
        r, _, _ = select.select([cable_master, console], [], [])
        try:
            if cable_master in r:
                os.write(console, os.read(cable_master, 4096))
            if console in r:
                os.write(cable_master, os.read(console, 4096))
        except OSError:
            break
    os.waitpid(pid, 0)
