# Stage 1: Prune Monorepo for Payment Service
FROM node:26-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install --global turbo
COPY . .
RUN turbo prune payment-service --docker

# Stage 2: Install Dependencies & Build
FROM node:26-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install --global pnpm@10.23.0

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm --filter=payment-service build || true

# Stage 3: Lean Production Runner
FROM node:26-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app .

USER nodejs
EXPOSE 8002
ENV PORT=8002
ENV NODE_ENV=production

CMD ["pnpm", "--filter=payment-service", "dev"]
