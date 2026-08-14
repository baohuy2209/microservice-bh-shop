# Deployment, Docker & DevOps Guide

This document outlines the containerization, orchestration, Turborepo caching, and Continuous Integration & Continuous Deployment (CI/CD) pipelines powering the **BH Shop Microservices** platform.

---

## 1. Multi-Stage Docker Containerization (`turbo prune`)

Every microservice in `apps/*` utilizes a lean, multi-stage Docker build optimized with Turborepo's `turbo prune` command. This ensures only relevant workspace dependencies are copied into the container context, minimizing image size (<250MB runtime footprint) and maximizing build caching.

### 1.1 Multi-Stage Build Architecture

```mermaid
flowchart TD
    subgraph Stage1["Stage 1: Pruner (turbo prune <service> --docker)"]
        S1_Full["Full Monorepo Source"] --> S1_Prune["Turborepo extracts minimal dependency subgraph"]
        S1_Prune --> S1_Out["/app/out/json/ (package.json + lockfile)<br/>/app/out/full/ (isolated source code)"]
    end

    subgraph Stage2["Stage 2: Builder"]
        S2_Install["Install exact dependencies via pnpm --frozen-lockfile"]
        S2_Gen["Generate Prisma Client (pnpm db:generate)"]
        S2_Compile["Compile / Type-Check Service (pnpm --filter=<service> check-types)"]
        S1_Out --> S2_Install --> S2_Gen --> S2_Compile
    end

    subgraph Stage3["Stage 3: Lean Production Runner"]
        S3_User["Create non-root system user (nodejs:1001)"]
        S3_Copy["Copy compiled artifacts from Builder"]
        S3_Run["Execute Service (EXPOSE PORT & start)"]
        S2_Compile --> S3_Copy --> S3_User --> S3_Run
    end
```

### 1.2 Example Dockerfile Architecture
```dockerfile
# Stage 1: Prune
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install --global turbo
COPY . .
RUN turbo prune product-service --docker

# Stage 2: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install --global pnpm@10.23.0
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm db:generate
RUN pnpm --filter=product-service check-types

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs
COPY --from=builder --chown=nodejs:nodejs /app .
USER nodejs
EXPOSE 8000
ENV PORT=8000 NODE_ENV=production
CMD ["pnpm", "--filter=product-service", "dev"]
```

---

## 2. Local Multi-Service Orchestration

To run all backing infrastructure (PostgreSQL, MongoDB, Kafka, ZooKeeper) locally alongside the application services, a standard `docker-compose.yml` configuration can be utilized:

```yaml
version: "3.8"

services:
  # PostgreSQL (Product & Category Catalog)
  postgres:
    image: postgres:16-alpine
    container_name: bh-shop-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password123
      POSTGRES_DB: product_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  # MongoDB (Orders & Aggregations)
  mongodb:
    image: mongo:7-jammy
    container_name: bh-shop-mongodb
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodata:/data/db

  # ZooKeeper (Kafka Coordination)
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    container_name: bh-shop-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  # Apache Kafka Broker
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    container_name: bh-shop-kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
      - "9094:9094"
      - "9095:9095"
      - "9096:9096"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,PLAINTEXT_HOST://localhost:9094
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

volumes:
  pgdata:
  mongodata:
```

---

## 3. Turborepo Pipeline & Caching (`turbo.json`)

The monorepo's pipeline graph is defined in `turbo.json`, orchestrating task dependencies, environment tracking, and cache outputs:

- **`build`**: Compiles applications and shared packages (`.next/**`, `dist/**`).
- **`test`**: Runs parallel Vitest suites on affected workspaces.
- **`check-types`**: Runs strict TypeScript compiler validation (`tsc --noEmit`).
- **`lint`**: Runs ESLint across all services.
- **`db:generate` / `db:migrate`**: Generates and synchronizes Prisma clients.

### Global Cache Invalidation
Turborepo tracks changes in global environment variables (`DATABASE_URL`, `MONGO_URL`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) to ensure caches are automatically invalidated when configuration changes.

---

## 4. Continuous Integration Pipeline (`.github/workflows/ci.yml`)

The CI workflow triggers on every push and pull request targeting `main` or `staging`:

```mermaid
flowchart LR
    A["Checkout Codebase (fetch-depth: 0)"] --> B["Setup pnpm & Node.js 20"]
    B --> C["Install Dependencies (--frozen-lockfile)"]
    C --> D["Generate Prisma Client (pnpm db:generate)"]
    D --> E["Run ESLint (--filter=...[origin/main])"]
    D --> F["Run TypeScript Check (--filter=...[origin/main])"]
    D --> G["Run Vitest Suites (--filter=...[origin/main])"]
```

### Key CI Features:
1. **Smart Changed-Package Filtering**: Pull request validation executes only on modified services and their direct dependents using `--filter=...[origin/${{ github.base_ref }}]`.
2. **Deterministic Builds**: Enforces `--frozen-lockfile` and exact Node.js 20.x runtime.
3. **Automated Quality Gates**: Requires 100% passing tests, zero type errors, and zero lint warnings before a PR can be merged.

---

## 5. Automated Container Publishing Pipeline (`.github/workflows/docker-build.yml`)

The container build workflow triggers on pushes to `main` and `staging` modifying `apps/**` or `packages/**`:

- **Build Matrix Strategy**: Builds images concurrently across all 6 applications:
  - `product-service`
  - `order-service`
  - `payment-service`
  - `auth-service`
  - `email-service`
  - `modern-e-commerce`
- **GitHub Container Registry (GHCR)**: Automatically tags and pushes images to `ghcr.io/<owner>/<service-name>`.
- **Layer Caching**: Uses GitHub Actions cache backend (`type=gha,mode=max`) for fast incremental image builds.

---

## 6. Environment Variables Reference

| Variable | Scope / Used By | Purpose | Example Value |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `product-service`, `@repo/product-db` | PostgreSQL connection string | `postgresql://postgres:password123@localhost:5432/product_db` |
| `MONGO_URL` | `order-service`, `@repo/order-db` | MongoDB connection string | `mongodb://localhost:27017/order_db` |
| `CLERK_SECRET_KEY` | All services & frontend | Clerk backend authentication secret | `sk_test_...` |
| `CLERK_PUBLISHABLE_KEY` | `apps/modern-e-commerce` | Clerk frontend publishable key | `pk_test_...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `apps/modern-e-commerce` | Public Clerk client key | `pk_test_...` |
| `STRIPE_SECRET_KEY` | `apps/payment-service` | Stripe private API secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `apps/payment-service` | Stripe webhook signing secret | `whsec_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`| `apps/modern-e-commerce` | Stripe client publishable key | `pk_test_...` |
| `NEXT_PUBLIC_PRODUCT_SERVICE_URL` | `apps/modern-e-commerce` | Product microservice HTTP base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_ORDER_SERVICE_URL` | `apps/modern-e-commerce` | Order microservice HTTP base URL | `http://localhost:8001` |
| `NEXT_PUBLIC_PAYMENT_SERVICE_URL` | `apps/modern-e-commerce` | Payment microservice HTTP base URL | `http://localhost:8002` |
| `NEXT_PUBLIC_AUTH_SERVICE_URL` | `apps/modern-e-commerce` | Auth microservice HTTP base URL | `http://localhost:8004` |
| `EMAIL_USER` | `apps/email-service` | Sender email address for SMTP | `admin@bhshop.com` |
| `GOOGLE_CLIENT_ID` | `apps/email-service` | Google OAuth2 client ID | `...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | `apps/email-service` | Google OAuth2 client secret | `GOCSPX-...` |
| `GOOGLE_REFRESH_TOKEN` | `apps/email-service` | Google OAuth2 refresh token | `1//...` |
