# 🛍️ BH Shop — Distributed Microservices Platform

[![CI Pipeline](https://github.com/baohuy2209/microservice-bh-shop/actions/workflows/ci.yml/badge.svg)](https://github.com/baohuy2209/microservice-bh-shop/actions/workflows/ci.yml)
[![Docker Build & Publish](https://github.com/baohuy2209/microservice-bh-shop/actions/workflows/docker-build.yml/badge.svg)](https://github.com/baohuy2209/microservice-bh-shop/actions/workflows/docker-build.yml)
[![Turborepo](https://img.shields.io/badge/Turborepo-v2.8-EF4444?logo=turborepo&logoColor=white)](https://turborepo.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-Event%20Driven-231F20?logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Clerk Auth](https://img.shields.io/badge/Clerk-Authentication-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?logo=stripe&logoColor=white)](https://stripe.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Automated%20Tests-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**BH Shop** is an enterprise-grade, event-driven e-commerce platform built as a high-performance distributed microservices monorepo. It combines a modern Next.js 16 customer storefront and admin dashboard with specialized backend microservices written in **Express.js**, **Fastify**, and **Hono**, coordinated via **Apache Kafka** event streaming and backed by a **polyglot persistence** architecture (**PostgreSQL + MongoDB**).

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [System Architecture Diagram](#-system-architecture-diagram)
- [Monorepo Structure](#-monorepo-structure)
- [Services & Port Matrix](#-services--port-matrix)
- [Core Features](#-core-features)
- [Technology Stack](#-technology-stack)
- [Getting Started & Local Development](#-getting-started--local-development)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Running Backing Services with Docker](#running-backing-services-with-docker)
  - [Installing Dependencies & Generating Database Clients](#installing-dependencies--generating-database-clients)
  - [Launching Applications via Turborepo](#launching-applications-via-turborepo)
- [Event-Driven Workflows & Kafka](#-event-driven-workflows--kafka)
- [Testing & Quality Gates](#-testing--quality-gates)
- [Continuous Integration & Containerization](#-continuous-integration--containerization)
- [Detailed Documentation](#-detailed-documentation)
- [License](#-license)

---

## 🏛️ Architectural Overview

BH Shop is engineered around modern distributed systems principles:

1. **Domain-Isolated Microservices**: Dedicated backend microservices for product catalog management, order fulfillment, payment processing, identity management, and transactional notifications.
2. **Polyglot Persistence**: Relational data with strict integrity constraints (products and categories) is stored in **PostgreSQL** via **Prisma ORM**, while high-volume document-oriented transactions and point-in-time order snapshots are stored in **MongoDB** via **Mongoose**.
3. **Event-Driven Choreography**: Microservices publish and subscribe to **Apache Kafka** topics to coordinate asynchronous business workflows (e.g., Stripe catalog sync, payment confirmation, order generation, and email receipts) without synchronous runtime coupling.
4. **Unified Identity & Role-Based Access Control**: Centralized user authentication and session claims managed through **Clerk**, enforced across Next.js route proxies and service-level middlewares (`shouldBeUser`, `shouldBeAdmin`).
5. **High-Velocity Monorepo Workflow**: Managed by **Turborepo** with dependency isolation, task pipeline orchestration, and aggressive build and test caching.

---

## 🗺️ System Architecture Diagram

```mermaid
flowchart TB
    subgraph Clients["Frontend Layer (Next.js 16 App Router)"]
        Storefront["🛍️ Customer Storefront<br/>(:3000)<br/>• Catalog Browsing<br/>• Zustand Cart<br/>• Stripe Embedded Checkout"]
        AdminDashboard["📊 Admin Dashboard<br/>(:3000/admin)<br/>• User & Category Management<br/>• Product Inventory<br/>• Recharts Analytics"]
    end

    subgraph Auth["Identity & Access Management"]
        Clerk["🔐 Clerk Identity Service<br/>(JWT / Session Claims / RBAC)"]
    end

    subgraph Services["Distributed Backend Microservices"]
        ProductService["📦 Product Service (:8000)<br/>• Express.js + Prisma ORM<br/>• Publishes: product.created, product.deleted"]
        OrderService["📋 Order Service (:8001)<br/>• Fastify + Mongoose ODM<br/>• Subscribes: payment.successful<br/>• Publishes: order.created"]
        PaymentService["💳 Payment Service (:8002)<br/>• Hono + Node Server<br/>• Subscribes: product.created, product.deleted<br/>• Publishes: payment.successful"]
        AuthService["👤 Auth Service (:8004)<br/>• Express.js + Clerk Backend SDK<br/>• Publishes: user.created"]
        EmailService["📧 Email Service (Worker)<br/>• KafkaJS Consumer + Nodemailer<br/>• Subscribes: user.created, order.created"]
    end

    subgraph Broker["Event Streaming Backbone"]
        Kafka["⚡ Apache Kafka Cluster<br/>(Topics: product.*, user.*, payment.*, order.*)"]
    end

    subgraph Storage["Databases & External Providers"]
        Postgres[(🐘 PostgreSQL 16<br/>Products & Categories)]
        Mongo[(🍃 MongoDB 7<br/>Orders & Analytics)]
        Stripe["💳 Stripe Payments API"]
        SMTP["✉️ Google OAuth2 / SMTP"]
    end

    Storefront -->|REST / JWT| ProductService
    Storefront -->|REST / JWT| OrderService
    Storefront -->|REST / JWT| PaymentService
    AdminDashboard -->|REST / Admin JWT| AuthService
    AdminDashboard -->|REST / Admin JWT| ProductService
    AdminDashboard -->|REST / Admin JWT| OrderService

    Storefront -.->|Auth Verification| Clerk
    AdminDashboard -.->|Auth Verification| Clerk
    Services -.->|Validate JWT| Clerk

    ProductService --> Postgres
    OrderService --> Mongo
    PaymentService --> Stripe
    EmailService --> SMTP

    ProductService -->|Publish| Kafka
    PaymentService -->|Publish| Kafka
    AuthService -->|Publish| Kafka
    OrderService -->|Publish| Kafka

    Kafka -->|Consume| PaymentService
    Kafka -->|Consume| OrderService
    Kafka -->|Consume| EmailService
```

---

## 📂 Monorepo Structure

```
microservice-bh-shop/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Monorepo CI: Lint, type-check, and Vitest test suites
│       └── docker-build.yml       # Multi-service Docker containerization matrix
├── apps/
│   ├── modern-e-commerce/         # Next.js 16 frontend (Customer Storefront + Admin Portal)
│   ├── product-service/           # Express.js catalog microservice (PostgreSQL + Prisma)
│   ├── order-service/             # Fastify order processing microservice (MongoDB + Mongoose)
│   ├── payment-service/           # Hono Stripe payment gateway & webhook ingestion service
│   ├── auth-service/              # Express.js administrative user management service (Clerk)
│   └── email-service/             # Kafka consumer daemon for transactional emails (Nodemailer)
├── packages/
│   ├── types/                     # Shared TypeScript interfaces, schemas, and test helpers
│   ├── kafka/                     # Shared KafkaJS producer/consumer clients & test harness
│   ├── product-db/                # PostgreSQL Prisma client, schema, and migrations
│   ├── order-db/                  # MongoDB Mongoose schemas, models, and connection lifecycle
│   ├── eslint-config/             # Shared ESLint configurations
│   └── typescript-config/         # Shared TypeScript compiler options (base, nextjs, react)
├── docs/                          # Detailed architectural & operational documentation
├── turbo.json                     # Turborepo task pipeline definitions & caching rules
├── pnpm-workspace.yaml            # Monorepo workspace declarations
├── vitest.workspace.ts            # Vitest multi-project test runner workspace
└── package.json                   # Root dependencies and global scripts
```

---

## 🔌 Services & Port Matrix

| Service | Technology Stack | Port | Primary Responsibilities |
| :--- | :--- | :---: | :--- |
| **`modern-e-commerce`** | Next.js 16, React 19, Tailwind v4, Zustand | `3000` | Customer storefront, Zustand shopping cart, embedded Stripe checkout, and administrative dashboard. |
| **`product-service`** | Express.js, TypeScript, PostgreSQL, Prisma | `8000` | Product catalog CRUD, multi-color image mappings, category hierarchy, and Stripe sync event publishing. |
| **`order-service`** | Fastify, TypeScript, MongoDB, Mongoose | `8001` | Order creation upon payment capture, user order history, and 6-month sales aggregation analytics. |
| **`payment-service`** | Hono, Node Server, Stripe SDK, Kafka | `8002` | Stripe Checkout session creation, Stripe webhook verification, and Stripe product catalog management. |
| **`auth-service`** | Express.js, TypeScript, Clerk Backend SDK | `8004` | Administrative user provisioning, profile management, and welcome event emissions. |
| **`email-service`** | Node.js Daemon, KafkaJS, Nodemailer | *Daemon* | Subscribes to `user.created` and `order.created` topics to deliver transactional emails. |

---

## ✨ Core Features

- **🛒 Modern Customer Storefront**: Instant product search, multi-attribute filtering (category, price, color, size), interactive product galleries, and optimistic cart management with Zustand.
- **💳 Embedded Stripe Checkout**: Seamless card payment flow using Stripe Embedded UI Elements and secure webhook signature verification (`checkout.session.completed`).
- **⚡ Asynchronous Event-Driven Pipeline**: Reliable cross-service message choreography over Apache Kafka with dedicated consumer groups.
- **📊 Interactive Admin Portal**: Protected management console featuring Recharts analytics, product inventory control, category provisioning, and Clerk user oversight.
- **🛡️ Enterprise Role-Based Access Control (RBAC)**: Dual-layer authorization checks across Next.js route matchers (`proxy.ts`) and backend middleware guards (`shouldBeUser`, `shouldBeAdmin`).
- **📦 Multi-Stage Containerization**: Minimal Docker container footprint (<250MB) generated via Turborepo dependency pruning (`turbo prune`).

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Zustand](https://zustand.docs.pmnd.rs/), [TanStack Query](https://tanstack.com/query), [Recharts](https://recharts.org/), [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Backend Services** | [Express.js](https://expressjs.com/), [Fastify](https://fastify.dev/), [Hono](https://hono.dev/), [Node.js 20+](https://nodejs.org/), [TypeScript 5.9](https://www.typescriptlang.org/) |
| **Messaging & Streaming** | [Apache Kafka](https://kafka.apache.org/), [KafkaJS](https://kafka.js.org/), [ZooKeeper](https://zookeeper.apache.org/) |
| **Databases & ORMs** | [PostgreSQL 16](https://www.postgresql.org/), [Prisma ORM](https://www.prisma.io/), [MongoDB 7](https://www.mongodb.com/), [Mongoose ODM](https://mongoosejs.com/) |
| **Authentication & Payments** | [Clerk Authentication](https://clerk.com/), [Stripe API & Webhooks](https://stripe.com/) |
| **Email Delivery** | [Nodemailer](https://nodemailer.com/) (OAuth2 Google / SMTP) |
| **Monorepo & Build Tooling** | [Turborepo](https://turborepo.org/), [pnpm](https://pnpm.io/) |
| **Testing & Quality** | [Vitest](https://vitest.dev/), [Supertest](https://github.com/ladjs/supertest), [ESLint](https://eslint.org/), [Prettier](https://prettier.io/) |
| **DevOps & Containers** | [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/), [GitHub Actions](https://github.com/features/actions) |

---

## 🚀 Getting Started & Local Development

### Prerequisites
Ensure the following tools are installed on your machine:
- **Node.js**: `v20.x` or higher
- **pnpm**: `v10.23.0` or higher (`npm install -g pnpm`)
- **Docker Desktop**: With Docker Compose support
- **Git**

---

### Environment Setup

Create `.env` configuration files for the applications and database packages using the templates below:

#### 1. Root & Shared Services Environment
Create `.env` in `packages/product-db`:
```ini
DATABASE_URL="postgresql://postgres:password123@localhost:5432/product_db"
```

Create `.env` in `packages/order-db`:
```ini
MONGO_URL="mongodb://localhost:27017/order_db"
```

#### 2. Service-Specific Keys
Set your authentication, payment, and mail credentials across the corresponding services:
```ini
# Clerk Keys (Auth Service, Product Service, Order Service, Payment Service, Frontend)
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."

# Stripe Keys (Payment Service & Frontend)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Microservice URLs (Frontend: apps/modern-e-commerce/.env.local)
NEXT_PUBLIC_PRODUCT_SERVICE_URL="http://localhost:8000"
NEXT_PUBLIC_ORDER_SERVICE_URL="http://localhost:8001"
NEXT_PUBLIC_PAYMENT_SERVICE_URL="http://localhost:8002"
NEXT_PUBLIC_AUTH_SERVICE_URL="http://localhost:8004"

# Email Configuration (apps/email-service/.env)
EMAIL_USER="admin@bhshop.com"
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-..."
GOOGLE_REFRESH_TOKEN="1//..."
```

---

### Running Backing Services with Docker

Start PostgreSQL, MongoDB, ZooKeeper, and Apache Kafka using Docker Compose:

```bash
# Spin up database and Kafka containers in the background
docker compose up -d postgres mongodb zookeeper kafka
```

---

### Installing Dependencies & Generating Database Clients

```bash
# 1. Install all monorepo dependencies
pnpm install

# 2. Generate Prisma Client for PostgreSQL
pnpm db:generate

# 3. (Optional) Run Prisma migrations to initialize PostgreSQL tables
pnpm db:migrate
```

---

### Launching Applications via Turborepo

Run all frontend applications and backend microservices concurrently with hot-reloading:

```bash
# Start all apps and services
pnpm dev
```

To run an individual service or application:
```bash
# Start only the frontend storefront
pnpm --filter=ecomgithub dev

# Start only the product microservice
pnpm --filter=product-service dev

# Start only the order microservice
pnpm --filter=order-service dev
```

---

## ⚡ Event-Driven Workflows & Kafka

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Admin User
    participant Prod as Product Service (:8000)
    participant Kafka as Apache Kafka
    participant Pay as Payment Service (:8002)
    participant Stripe as Stripe API
    participant Ord as Order Service (:8001)
    participant Mongo as MongoDB
    participant Email as Email Service
    participant Client as Customer

    Note over Admin,Stripe: 1. Catalog Synchronization Flow
    Admin->>Prod: Creates Product (POST /products)
    Prod->>Kafka: Emits 'product.created'
    Kafka->>Pay: Consumes 'product.created'
    Pay->>Stripe: Registers Product & Price in Stripe

    Note over Client,Email: 2. Checkout & Order Fulfillment Flow
    Client->>Stripe: Submits Payment on Embedded Checkout
    Stripe->>Pay: Sends Webhook (checkout.session.completed)
    Pay->>Kafka: Emits 'payment.successful'
    Kafka->>Ord: Consumes 'payment.successful'
    Ord->>Mongo: Persists Order Document
    Ord->>Kafka: Emits 'order.created'
    Kafka->>Email: Consumes 'order.created'
    Email->>Client: Transmits Order Confirmation Receipt
```

| Event Topic | Producer | Consumer | Payload Highlights |
| :--- | :--- | :--- | :--- |
| **`product.created`** | `product-service` | `payment-service` | `{ id, name, price }` |
| **`product.deleted`** | `product-service` | `payment-service` | `{ id }` |
| **`user.created`** | `auth-service` | `email-service` | `{ username, email }` |
| **`payment.successful`** | `payment-service` | `order-service` | `{ userId, email, amount, status, products: [...] }` |
| **`order.created`** | `order-service` | `email-service` | `{ email, amount, status }` |

---

## 🧪 Testing & Quality Gates

The project uses **Vitest** for isolated unit tests, route integration tests, and asynchronous Kafka pipeline verification:

```bash
# Execute all test suites across the monorepo
pnpm test

# Run tests for a specific microservice
pnpm --filter=@repo/kafka test
pnpm --filter=order-service test
pnpm --filter=payment-service test
pnpm --filter=product-service test
pnpm --filter=auth-service test
pnpm --filter=email-service test
pnpm --filter=ecomgithub test

# Run TypeScript type verification across all packages
pnpm check-types

# Run ESLint across all packages
pnpm lint
```

---

## 🚢 Continuous Integration & Containerization

### GitHub Actions CI Workflow (`.github/workflows/ci.yml`)
- Triggers on every push or pull request to `main` and `staging`.
- Restores pnpm dependency cache and generates Prisma clients.
- Runs `turbo run lint check-types test` dynamically filtering only modified packages using `--filter=...[origin/main]`.

### Automated Container Publishing (`.github/workflows/docker-build.yml`)
- Employs Docker Buildx and `turbo prune` multi-stage Dockerfiles.
- Concurrently builds and tags production containers for all 6 microservices.
- Publishes OCI-compliant images directly to GitHub Container Registry (`ghcr.io`).

---

## 📚 Detailed Documentation

For in-depth architectural guides, schema specifications, and deployment runbooks, visit the [`docs/`](./docs) directory:

- 📖 **[System Architecture Overview](./docs/system-architecture.md)**
- 📦 **[Domain & Service Breakdown](./docs/services-breakdown.md)**
- ⚡ **[Event-Driven Architecture & Kafka](./docs/event-driven-architecture.md)**
- 🗄️ **[Data Management & Polyglot Persistence](./docs/data-management.md)**
- 🐳 **[Deployment, Docker & DevOps Guide](./docs/deployment-and-devops.md)**

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
