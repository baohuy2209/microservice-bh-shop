# BH Shop Microservices Documentation

Welcome to the official technical documentation for **BH Shop Microservices** — a modern, production-grade e-commerce platform built as an event-driven distributed system within a high-performance **Turborepo** monorepo.

---

## 📚 Documentation Index

Explore the detailed architectural and operational guides below:

| Document | Description |
| :--- | :--- |
| **[System Architecture Overview](./system-architecture.md)** | End-to-end system topology, communication protocols, synchronous vs. asynchronous boundaries, client apps, and security architecture. |
| **[Domain & Service Breakdown](./services-breakdown.md)** | Deep dive into each application (`modern-e-commerce`, `product-service`, `order-service`, `payment-service`, `auth-service`, `email-service`) and shared packages (`@repo/types`, `@repo/kafka`, `@repo/*-db`). |
| **[Event-Driven Architecture & Kafka](./event-driven-architecture.md)** | Message broker design, topic catalog, event payload contracts, choreography flows, consumer groups, idempotency, and in-memory test harness. |
| **[Data Management & Polyglot Persistence](./data-management.md)** | PostgreSQL (Prisma) vs. MongoDB (Mongoose) persistence models, schemas, aggregations, transactional boundaries, and eventual consistency. |
| **[Deployment, Docker & DevOps](./deployment-and-devops.md)** | Multi-stage Docker containerization with `turbo prune`, Docker Compose local orchestration, Turborepo caching, and GitHub Actions CI/CD workflows. |

---

## 🏛️ High-Level System Landscape

```mermaid
flowchart TB
    subgraph Clients["Frontend Layer (Next.js 16 + React 19)"]
        Storefront["Customer Storefront<br/>(:3000)"]
        AdminUI["Admin Dashboard<br/>(:3000/admin)"]
    end

    subgraph Gateway["Identity & Auth Provider"]
        Clerk["Clerk Authentication<br/>(JWT / Session Claims / RBAC)"]
    end

    subgraph Microservices["Backend Microservices Layer"]
        ProductSvc["Product Service<br/>(Express + Prisma)<br/>Port :8000"]
        OrderSvc["Order Service<br/>(Fastify + Mongoose)<br/>Port :8001"]
        PaymentSvc["Payment Service<br/>(Hono + Stripe)<br/>Port :8002"]
        AuthSvc["Auth Service<br/>(Express + Clerk SDK)<br/>Port :8004"]
        EmailSvc["Email Service<br/>(Kafka Consumer + Nodemailer)"]
    end

    subgraph EventBus["Event Streaming Backbone"]
        Kafka["Apache Kafka Message Broker<br/>(Topics: product.*, user.*, payment.*, order.*)"]
    end

    subgraph Databases["Polyglot Persistence Layer"]
        Postgres[(PostgreSQL<br/>Products & Categories)]
        MongoDB[(MongoDB<br/>Orders & Analytics)]
    end

    subgraph External["External Cloud Services"]
        Stripe["Stripe Payments Engine<br/>(Checkout / Webhooks)"]
        SMTP["Gmail / SMTP Server<br/>(OAuth2 Email Delivery)"]
    end

    Storefront -->|REST / JWT| ProductSvc
    Storefront -->|REST / JWT| OrderSvc
    Storefront -->|REST / JWT| PaymentSvc
    AdminUI -->|REST / Admin JWT| AuthSvc
    AdminUI -->|REST / Admin JWT| ProductSvc
    AdminUI -->|REST / Admin JWT| OrderSvc

    Storefront -.->|Auth SDK| Clerk
    AdminUI -.->|Auth SDK| Clerk
    Microservices -.->|Verify JWT| Clerk

    ProductSvc --> Postgres
    OrderSvc --> MongoDB
    PaymentSvc --> Stripe
    EmailSvc --> SMTP

    ProductSvc -->|Publish product.*| Kafka
    PaymentSvc -->|Publish payment.*| Kafka
    AuthSvc -->|Publish user.*| Kafka
    OrderSvc -->|Publish order.*| Kafka

    Kafka -->|Consume product.*| PaymentSvc
    Kafka -->|Consume payment.*| OrderSvc
    Kafka -->|Consume order.*, user.*| EmailSvc
```

---

## 🚀 Quick Navigation

- **Running the Monorepo**: See [Getting Started in README.md](../README.md#getting-started--local-development).
- **Docker Compose Setup**: See [Deployment Guide](./deployment-and-devops.md#local-multi-service-orchestration).
- **Kafka Event Specifications**: See [Event Catalog](./event-driven-architecture.md#event-topic-catalog--schema-contracts).
- **Database Schema Reference**: See [Data Management Guide](./data-management.md).
