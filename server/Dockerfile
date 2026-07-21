# ─────────────────────────────────────────────────────────────
#  Kartly app image (build context = repo root).
#  Stage 1 builds the React client and compiles the TS server.
#  Stage 2 is the lean runtime that migrates, seeds, and serves.
# ─────────────────────────────────────────────────────────────

# ---------- build ----------
FROM node:22-slim AS build
WORKDIR /app

# prisma needs openssl at generate/runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# install deps first for layer caching (workspace manifests only)
COPY package.json package-lock.json* ./
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm install

# copy sources and build both workspaces
COPY . .
RUN npx prisma generate --schema server/prisma/schema.prisma
RUN npm run build --workspace client
RUN npm run build --workspace server

# ---------- runtime ----------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

# bring over installed deps + build artifacts
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/prisma ./server/prisma
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/openapi.yaml ./openapi.yaml
COPY server/docker-entrypoint.sh ./server/docker-entrypoint.sh
RUN chmod +x ./server/docker-entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["./server/docker-entrypoint.sh"]
