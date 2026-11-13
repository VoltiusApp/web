# Build from the repository root: docker build -f portal/Dockerfile .
FROM node:22-alpine AS build
RUN npm install -g pnpm@11
WORKDIR /repo
COPY shared ./shared
COPY portal/package.json portal/pnpm-lock.yaml portal/pnpm-workspace.yaml ./portal/
WORKDIR /repo/portal
RUN pnpm install --frozen-lockfile
COPY portal ./
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /repo/portal/.next/standalone ./
COPY --from=build --chown=node:node /repo/portal/.next/static ./portal/.next/static
COPY --from=build --chown=node:node /repo/portal/public ./portal/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/runtime-config >/dev/null || exit 1
CMD ["node", "portal/server.js"]
