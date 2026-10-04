#!/usr/bin/env bash
set -e
cd /tmp/work
node reset.mjs
./rec.sh takeA.mjs A
node prep_sftp.mjs
./rec.sh takeB.mjs B
