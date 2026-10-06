# A fleet host that can also play docker-01 (CLI pointed at the dind daemon) or pve-01 (`pct` and `pvesh` mapped onto containers of a second one).
FROM docker:27-cli AS cli
FROM promo-fleet
COPY --from=cli /usr/local/bin/docker /opt/homelab/docker-cli
COPY dk pct pvesh /opt/homelab/
RUN chmod +x /opt/homelab/*
