# Domain & Service Breakdown

This document provides an exhaustive breakdown of each application and workspace package in the **BH Shop Microservices** ecosystem, including responsibilities, technology stacks, internal architectures, API contracts, and integration dependencies.

---

## Overview of Workspace Packages & Applications

```
apps/
├── modern-e-commerce/   # Full-stack Next.js 16 storefront and admin management portal
├── product-service/     # Express.js service for catalog, categories, and PostgreSQL/Prisma
├── order-service/       # Fastify service for order processing, MongoDB/Mongoose, and analytics
├── payment-service/     # Hono service for Stripe Checkout Sessions, webhooks, and catalog sync
├── auth-service/        # Express.js service for Clerk administrative user management
└── email-service/       # Event-driven background worker for transactional email notifications

packages/
├── types/               # Shared TypeScript schemas, data interfaces, and auth contracts
├── kafka/               # Shared KafkaJS client, producer/consumer abstractions, and test harness
├── product-db/          # PostgreSQL database layer, Prisma client, and migrations
├── order-db/            # MongoDB database layer, Mongoose models, and connection lifecycle
├── eslint-config/       # Unified ESLint rules for Node.js and Next.js projects
└── typescript-config/   # Shared base and Next.js tsconfig configurations
```

---

## 1. Frontend Application: `modern-e-commerce`

- **Location**: `apps/modern-e-commerce`
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS v4, Radix UI primitives, Lucide React icons, Class Variance Authority (`cva`)
- **State & Data**: Zustand (Cart Store with persistence), TanStack React Query, TanStack Table
- **Forms & Validation**: React Hook Form, Zod schema validation
- **Visualization**: Recharts (Sales and order distribution analytics)
- **Port**: `3000`

### Key Functional Areas
1. **Customer Storefront (`/`, `/products`, `/products/[id]`, `/cart`)**:
   - Dynamic product listing with instant search, category filtering, price sorting, and variant selection (color/size).
   - Zustand-powered cart store with optimistic UI updates and local storage persistence.
   - Dynamic product detail pages rendering multi-color image carousels.
2. **Checkout & Payment Flow (`/return`)**:
   - Integrates `@stripe/stripe-js` and `@stripe/react-stripe-js` to render embedded payment forms.
   - Handles post-payment redirects and session verification via `payment-service`.
3. **Customer Orders (`/orders`)**:
   - Authenticated view of the logged-in customer's order history fetched from `order-service:8001/user-orders`.
4. **Admin Dashboard (`/admin/(dashboard)/*`)**:
   - **Dashboard Home (`/admin`)**: Metric cards, interactive monthly revenue charts (Recharts), and latest transactions table.
   - **Product Management (`/admin/products`)**: Add and manage products with multi-color image mappings, category associations, and prices.
   - **Category Management (`/admin/categories`)**: Create and list category slugs.
   - **User Management (`/admin/users`, `/admin/users/[id]`)**: Full Clerk user listing, role assignment, and user creation forms.
   - **Order Oversight (`/admin/orders`)**: Global view of all orders placed across the platform.
5. **Route Protection (`src/proxy.ts`)**:
   - Evaluates Clerk session claims (`sessionClaims.metadata.role`) to guard `/admin/*` routes and redirect unauthorized users to `/admin/unauthorized`.

---

## 2. Catalog Service: `product-service`

- **Location**: `apps/product-service`
- **Framework**: Express.js, TypeScript
- **Database**: PostgreSQL via `@repo/product-db` (Prisma ORM)
- **Messaging**: Kafka Producer & Consumer (`@repo/kafka`)
- **Authentication**: `@clerk/express` middleware
- **Port**: `8000`

### Architecture & Endpoints
The product service acts as the source of truth for all merchandise, prices, color variants, image assets, and hierarchical categories.

| HTTP Method | Route | Auth Guard | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Service health check |
| `GET` | `/products` | Public | List products (Supports `?category=`, `?search=`, `?sort=asc\|desc\|oldest`, `?limit=`) |
| `GET` | `/products/:id` | Public | Fetch single product by UUID |
| `POST` | `/products` | `shouldBeAdmin` | Create product (Emits `product.created` Kafka event) |
| `PUT` | `/products/:id` | `shouldBeAdmin` | Update product details |
| `DELETE` | `/products/:id` | `shouldBeAdmin` | Delete product (Emits `product.deleted` Kafka event) |
| `GET` | `/categories` | Public | List all product categories |
| `GET` | `/categories/:id` | Public | Get category by UUID or slug |
| `POST` | `/categories` | `shouldBeAdmin` | Create a new category slug and title |

### Event Publishing
- **`product.created`**: Publishes `{ id, name, price }` for Stripe catalog synchronization in `payment-service`.
- **`product.deleted`**: Publishes `{ id }` to archive the Stripe product counterpart.

---

## 3. Order Processing Service: `order-service`

- **Location**: `apps/order-service`
- **Framework**: Fastify, TypeScript
- **Database**: MongoDB via `@repo/order-db` (Mongoose ODM)
- **Messaging**: Kafka Consumer & Producer (`@repo/kafka`)
- **Authentication**: `@clerk/fastify` plugin
- **Port**: `8001`

### Architecture & Endpoints
The order service handles asynchronous order persistence, customer order lookups, and administrative sales aggregations over time.

| HTTP Method | Route | Auth Guard | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Service health check |
| `GET` | `/user-orders` | `shouldBeUser` | Fetch all orders belonging to authenticated `req.userId` |
| `GET` | `/orders` | `shouldBeAdmin` | List global orders with pagination (`?limit=`) |
| `GET` | `/order-chart` | `shouldBeAdmin` | 6-month historical monthly order & revenue aggregation |

### Event Subscriptions & Publishing
- **Subscribes to `payment.successful`**: Triggered when a customer completes payment in Stripe. The handler reads the payment event payload, persists a new document in MongoDB (`Order` model), and emits an `order.created` event.
- **Publishes `order.created`**: Broadcasts `{ email, amount, status }` for customer email confirmation.

---

## 4. Payment Gateway Service: `payment-service`

- **Location**: `apps/payment-service`
- **Framework**: Hono with `@hono/node-server`, TypeScript
- **Payment Provider**: Stripe API SDK (`stripe`)
- **Messaging**: Kafka Producer & Consumer (`@repo/kafka`)
- **Authentication**: `@clerk/hono` middleware
- **Port**: `8002`

### Architecture & Endpoints
The payment service encapsulates all financial transactions, Stripe Checkout session provisioning, webhook signature validation, and catalog synchronization.

| HTTP Method | Route | Auth Guard | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/session/create-checkout-session` | `shouldBeUser` | Resolves cart product prices from Stripe, creates an embedded Checkout session, returns `clientSecret` |
| `GET` | `/session/:session_id` | Public | Retrieves Stripe session status and payment status (`complete`, `paid`) |
| `POST` | `/webhooks/stripe` | Webhook Sig | Ingests Stripe webhook events (`checkout.session.completed`) |
| `GET` | `/webhooks` | Public | Webhook endpoint health check |

### Event Processing
- **Subscribes to `product.created`**: Calls `stripe.products.create({ id, name, default_price_data: { unit_amount, currency: "usd" } })` to maintain zero-latency pricing in Stripe.
- **Subscribes to `product.deleted`**: Deactivates or removes the corresponding product in Stripe.
- **Publishes `payment.successful`**: Fired upon receiving and verifying a valid `checkout.session.completed` webhook.

---

## 5. Identity & Access Service: `auth-service`

- **Location**: `apps/auth-service`
- **Framework**: Express.js, TypeScript
- **Identity Provider**: Clerk Backend SDK (`@clerk/clerk-sdk-node` / `createClerkClient`)
- **Logging**: Morgan HTTP logger
- **Messaging**: Kafka Producer (`@repo/kafka`)
- **Authentication**: `@clerk/express` middleware (`shouldBeAdmin`)
- **Port**: `8004`

### Architecture & Endpoints
The auth service provides administrative control over user accounts and permissions, interacting directly with Clerk's cloud identity platform.

| HTTP Method | Route | Auth Guard | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Service health check |
| `GET` | `/users` | `shouldBeAdmin` | List all registered users via Clerk Backend API |
| `GET` | `/users/:id` | `shouldBeAdmin` | Retrieve detailed profile for a specific user ID |
| `POST` | `/users` | `shouldBeAdmin` | Create a new user (Emits `user.created` Kafka event) |
| `DELETE` | `/users/:id` | `shouldBeAdmin` | Delete user account in Clerk |

### Event Publishing
- **`user.created`**: Publishes `{ username, email }` so that `email-service` can deliver a personalized welcome email.

---

## 6. Notification Worker: `email-service`

- **Location**: `apps/email-service`
- **Framework**: Node.js Background Daemon, TypeScript
- **Email Delivery Engine**: Nodemailer (OAuth2 Google / SMTP transport)
- **Messaging**: Kafka Consumer (`@repo/kafka`, Group: `email-service`)
- **Port**: N/A (Event consumer daemon)

### Event Subscriptions
- **`user.created`**: Ingests welcome event and delivers account activation / welcome email to the recipient.
- **`order.created`**: Ingests order details (`email`, `amount`, `status`) and sends a transactional receipt.

---

## 7. Shared Workspace Packages (`packages/*`)

### 7.1 `@repo/types`
- Centralized TypeScript interfaces and Zod schemas shared across frontend and backend services.
- Defines core entities: `ProductType`, `CategoryType`, `OrderType`, `OrderChartType`, `CartItemType`, `StripeProductType`, `CustomJwtSessionClaims`, and test authentication helpers.

### 7.2 `@repo/kafka`
- Reusable Kafka abstraction wrapping `kafkajs`.
- Exports:
  - `createKafkaClient(serviceName)`: Instantiates Kafka client configured with broker addresses.
  - `createProducer(kafka)`: Managed producer with connect, send, and disconnect methods.
  - `createConsumer(kafka, groupId)`: Managed multi-topic consumer with automated JSON deserialization.
  - `InMemoryKafkaHarness`: High-speed in-memory message broker emulator for Vitest integration tests without external Kafka infrastructure.

### 7.3 `@repo/product-db`
- PostgreSQL database client package powered by **Prisma ORM**.
- Contains `schema.prisma` defining `Product` and `Category` models with relational integrity.
- Exports singleton `prisma` client instance and TypeScript models.

### 7.4 `@repo/order-db`
- MongoDB database client package powered by **Mongoose**.
- Contains `OrderSchema` with automatic timestamps (`createdAt`, `updatedAt`), embedded products array, and `OrderStatus` enum.
- Exports `Order` model and `connectOrderDB()` connection pool manager.

### 7.5 `@repo/eslint-config` & `@repo/typescript-config`
- Standardized linting rules and compiler configurations (`base.json`, `nextjs.json`, `react-library.json`) ensuring strict type checking and uniform code quality across all workspaces.
