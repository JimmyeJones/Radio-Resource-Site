FROM node:20-slim AS builder
WORKDIR /app
RUN corepack enable

# Build deps for better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .
RUN pnpm build && pnpm build:worker

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_PATH=/data/app.db
ENV MEDIA_DIR=/media
ENV PORT=3000

RUN apt-get update && apt-get install -y --no-install-recommends \
    yt-dlp ffmpeg ca-certificates python3 \
  && rm -rf /var/lib/apt/lists/*

# Next standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Worker output (compiled CommonJS) + its node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=builder /app/node_modules/jsdom ./node_modules/jsdom
COPY --from=builder /app/node_modules/@mozilla/readability ./node_modules/@mozilla/readability
COPY --from=builder /app/node_modules/dompurify ./node_modules/dompurify
COPY --from=builder /app/node_modules/satellite.js ./node_modules/satellite.js
COPY --from=builder /app/node_modules/node-cron ./node_modules/node-cron
COPY --from=builder /app/node_modules/zod ./node_modules/zod

RUN mkdir -p /data /media

EXPOSE 3000
CMD ["node", "server.js"]
