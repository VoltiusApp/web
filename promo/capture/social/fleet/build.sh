#!/bin/sh
G='\033[32m'; C='\033[36m'; D='\033[2m'; B='\033[1m'; Y='\033[33m'; R='\033[0m'
printf "${B}make${R} release ${D}acme-api · 4 jobs${R}\n"
n=0
for dir in core net storage auth billing api workers cli; do
  for f in config errors pool codec cache router handler metrics tracing retry queue schema; do
    n=$((n + 1))
    printf "${G}  CC${R}  src/%s/%s.o\n" "$dir" "$f"
    sleep 0.5
    [ $((n % 17)) -eq 0 ] && printf "${Y}warning:${R} ${D}src/%s/%s.c:%d: unused variable 'tmp'${R}\n" "$dir" "$f" $((n * 7))
  done
  printf "${C}  AR${R}  build/lib%s.a\n" "$dir"
  sleep 0.6
done
printf "${C}  LD${R}  build/acme-api\n"; sleep 1.5
printf "\n${G}${B}✓ build finished${R} ${D}%d objects${R}\n" "$n"
