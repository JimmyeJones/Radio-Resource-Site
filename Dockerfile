FROM node:20-slim AS builder
WORKDIR /app

# Build deps for better-sqlite3's native addon
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Pin pnpm to a version compatible with Node 20 (pnpm 11+ requires Node 22).
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .
# Build the Next app and compile the worker (tsc + tsc-alias to resolve @/ paths).
RUN pnpm build && pnpm build:worker

# Strip devDependencies so the runtime node_modules is prod-only. This keeps the
# pnpm symlink layout (node_modules/.pnpm/...) intact, so copying the whole
# directory below preserves every transitive dependency for both processes.
RUN pnpm prune --prod

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_PATH=/data/app.db
ENV MEDIA_DIR=/media
ENV PORT=3000

RUN apt-get update && apt-get install -y --no-install-recommends \
    yt-dlp ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# One complete prod node_modules (with the .pnpm store) serves both the web
# server (next start) and the worker (node dist/worker/index.js).
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

RUN mkdir -p /data /media

EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
