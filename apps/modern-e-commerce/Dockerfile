# Stage 1: Prune Monorepo for Next.js Web App
FROM node:26-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install --global turbo
COPY . .
RUN turbo prune ecomgithub --docker

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

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter=ecomgithub build

# Stage 3: Lean Production Runner
FROM node:26-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/modern-e-commerce/public ./apps/modern-e-commerce/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/modern-e-commerce/.next ./apps/modern-e-commerce/.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/modern-e-commerce/package.json ./apps/modern-e-commerce/package.json

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start", "--prefix", "apps/modern-e-commerce"]
