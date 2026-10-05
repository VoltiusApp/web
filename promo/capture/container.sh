# Sourced by the setup scripts. capture_container NAME HOSTNAME SCREEN WIN NET WT BIN
# A tauri-mcp container running the voltius worktree WT (vite) with the debug binary in BIN, tauri-driver on 4444.
capture_container() {
  local name=$1 host=$2 screen=$3 win=$4 net=$5 wt=$6 bin=$7
  docker ps --format '{{.Names}}' | grep -qx "$name" && return 0
  docker rm -f "$name" >/dev/null 2>&1 || true
  docker run -d --name "$name" --hostname "$host" --network "$net" --security-opt seccomp=unconfined \
    -e WEBKIT_DISABLE_COMPOSITING_MODE=1 -e VOLTIUS_KEYCHAIN_NS="$name" -e WD_APP=/promobin/voltius -e WD_WIN="$win" \
    -v "$wt":/app -v "$bin":/promobin:ro tauri-mcp \
    bash -c "cd /app && (node node_modules/vite/bin/vite.js > /tmp/vite.log 2>&1 &) && keyctl session - xvfb-run --auto-servernum -s '-screen 0 ${screen}x24' sleep infinity" >/dev/null
  until docker exec -w / "$name" sh -c 'ls -d /tmp/xvfb-run.* && grep -q "ready in" /tmp/vite.log' >/dev/null 2>&1; do sleep 1; done
  local x; x=$(docker exec -w / "$name" sh -c 'ls -d /tmp/xvfb-run.*')/Xauthority
  docker exec -w / "$name" sh -c "mkdir -p /tmp/work && echo ':99 $x' > /tmp/work/disp"
  docker exec -d -w / "$name" sh -c "DISPLAY=:99 XAUTHORITY=$x tauri-driver --port 4444 --native-port 4446 > /tmp/driver.log 2>&1"
}
