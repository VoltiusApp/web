# Sourced by the take scripts. run: a command in the capture container; mark: a timestamped mark for the open take.
run() { docker exec -w /tmp/work promo-social "$@"; }
mark() { run sh -c "echo \"\$(date +%s.%3N) $1\" >> marks.txt"; echo "$(date +%T) $1"; }
stage() { docker cp "${HERE:?stage needs HERE, the take dir}/." promo-social:/tmp/work/ >/dev/null; }
# runaway HOST: a CPU-capped busy loop named report-worker (a copy of bash), the "runaway process" of #43 and V4.
runaway() {
  docker update --cpus 0.3 "$1" >/dev/null
  docker exec "$1" sh -c "test -x /usr/local/bin/report-worker || cp /bin/bash /usr/local/bin/report-worker"
  docker exec "$1" pgrep -x report-worker >/dev/null || docker exec -d -u deploy "$1" /usr/local/bin/report-worker -c 'while :; do :; done'
  sleep 1
}
