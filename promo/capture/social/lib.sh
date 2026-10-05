# Sourced by the take scripts. run: a command in the capture container; mark: a timestamped mark for the open take.
run() { docker exec -w /tmp/work promo-social "$@"; }
mark() { run sh -c "echo \"\$(date +%s.%3N) $1\" >> marks.txt"; echo "$(date +%T) $1"; }
stage() { docker cp "$HERE/." promo-social:/tmp/work/ >/dev/null; }
