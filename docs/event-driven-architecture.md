# Event-Driven Architecture & Apache Kafka

This document describes the asynchronous event-driven streaming architecture of **BH Shop**, explaining how **Apache Kafka** decouples microservices, standardizes message schemas, coordinates cross-service transactions, and guarantees event delivery.

---

## 1. Architectural Role of Apache Kafka

In a microservices ecosystem, direct synchronous HTTP calls between internal services introduce tight coupling, cascading latency, and single points of failure. BH Shop uses **Apache Kafka** as an event streaming backbone:

- **Decoupled Producers & Consumers**: Services emit domain events without knowledge of downstream consumers.
- **Durable Event Storage**: Messages are persisted across partitions, allowing consumers to process events at their own pace or replay past streams.
- **Scalable Consumer Groups**: Multiple instances of a service can share workload partitions under a unified `groupId`.

```mermaid
flowchart LR
    subgraph Producers["Event Producers"]
        P_Prod["product-service"]
        P_Auth["auth-service"]
        P_Pay["payment-service"]
        P_Ord["order-service"]
    end

    subgraph Broker["Apache Kafka Streaming Backbone"]
        T1["Topic: product.created"]
        T2["Topic: product.deleted"]
        T3["Topic: user.created"]
        T4["Topic: payment.successful"]
        T5["Topic: order.created"]
    end

    subgraph Consumers["Event Consumers"]
        C_Pay["payment-service<br/>(Group: payment-service)"]
        C_Ord["order-service<br/>(Group: order-service)"]
        C_Email["email-service<br/>(Group: email-service)"]
    end

    P_Prod -->|Publish| T1
    P_Prod -->|Publish| T2
    P_Auth -->|Publish| T3
    P_Pay -->|Publish| T4
    P_Ord -->|Publish| T5

    T1 -->|Consume| C_Pay
    T2 -->|Consume| C_Pay
    T3 -->|Consume| C_Email
    T4 -->|Consume| C_Ord
    T5 -->|Consume| C_Email
```

---

## 2. Event Topic Catalog & Schema Contracts

All Kafka messages use JSON-serialized payloads adhering to the types defined in `@repo/types`:

### 2.1 Topic: `product.created`
- **Producer**: `product-service` (when admin creates a new product)
- **Consumer**: `payment-service`
- **Purpose**: Creates corresponding product and price entities in Stripe's product catalog.
- **Payload Schema**:
  ```json
  {
    "id": "e4b2d184-7c2a-4efb-8d19-45e3d7cb5a81",
    "name": "Wireless Noise-Cancelling Headphones",
    "price": 299.99
  }
  ```

### 2.2 Topic: `product.deleted`
- **Producer**: `product-service` (when admin deletes a product)
- **Consumer**: `payment-service`
- **Purpose**: Deactivates or removes the corresponding product in Stripe.
- **Payload Schema**:
  ```json
  {
    "id": "e4b2d184-7c2a-4efb-8d19-45e3d7cb5a81"
  }
  ```

### 2.3 Topic: `user.created`
- **Producer**: `auth-service` (when admin provisions a new user)
- **Consumer**: `email-service`
- **Purpose**: Sends a personalized onboarding welcome email.
- **Payload Schema**:
  ```json
  {
    "username": "alex_doe",
    "email": "alex.doe@example.com"
  }
  ```

### 2.4 Topic: `payment.successful`
- **Producer**: `payment-service` (upon receiving verified Stripe webhook `checkout.session.completed`)
- **Consumer**: `order-service`
- **Purpose**: Persists customer order document in MongoDB and initiates fulfillment.
- **Payload Schema**:
  ```json
  {
    "userId": "user_2tX8y9Qz...",
    "email": "buyer@example.com",
    "amount": 29999,
    "status": "success",
    "products": [
      {
        "name": "Wireless Noise-Cancelling Headphones",
        "quantity": 1,
        "price": 29999
      }
    ]
  }
  ```

### 2.5 Topic: `order.created`
- **Producer**: `order-service` (after successfully saving order in MongoDB)
- **Consumer**: `email-service`
- **Purpose**: Sends an order confirmation and itemized receipt to the buyer.
- **Payload Schema**:
  ```json
  {
    "email": "buyer@example.com",
    "amount": 29999,
    "status": "success"
  }
  ```

---

## 3. End-to-End Choreography Sequences

### 3.1 Checkout, Payment Capture & Order Fulfillment

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer Browser
    participant Store as Next.js Storefront (:3000)
    participant PaySvc as Payment Service (:8002)
    participant Stripe as Stripe API
    participant Kafka as Apache Kafka
    participant OrdSvc as Order Service (:8001)
    participant Mongo as MongoDB
    participant EmailSvc as Email Service Worker
    participant SMTP as SMTP / Gmail

    Customer->>Store: Clicks Checkout with Cart Items
    Store->>PaySvc: POST /session/create-checkout-session (Cart Items + JWT)
    PaySvc->>Stripe: stripe.checkout.sessions.create()
    Stripe-->>PaySvc: Returns Checkout Session client_secret
    PaySvc-->>Store: { clientSecret }
    Store->>Customer: Renders Stripe Embedded Checkout

    Customer->>Stripe: Enters Card details & Submits Payment
    Stripe-->>Customer: Payment Authorized & Captured

    Stripe->>PaySvc: POST /webhooks/stripe (checkout.session.completed)
    PaySvc->>PaySvc: Verifies stripe-signature header
    PaySvc->>Kafka: Publish to 'payment.successful'

    Kafka->>OrdSvc: Consume 'payment.successful'
    OrdSvc->>Mongo: Persists Order Document (new Order(payload).save())
    OrdSvc->>Kafka: Publish to 'order.created'

    Kafka->>EmailSvc: Consume 'order.created'
    EmailSvc->>SMTP: sendMail(receipt details to customer email)

    Customer->>Store: Redirected to /return?session_id=...
    Store->>PaySvc: GET /session/:session_id
    PaySvc-->>Store: { status: 'complete', paymentStatus: 'paid' }
    Store->>Customer: Renders Order Confirmation UI
```

### 3.2 Product Creation & Stripe Catalog Synchronization

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin User
    participant AdminUI as Next.js Admin (/admin/products)
    participant ProdSvc as Product Service (:8000)
    participant PG as PostgreSQL (Prisma)
    participant Kafka as Apache Kafka
    participant PaySvc as Payment Service (:8002)
    participant Stripe as Stripe API

    Admin->>AdminUI: Submits new product form (Title, Price, Colors, Images)
    AdminUI->>ProdSvc: POST /products (Admin JWT)
    ProdSvc->>PG: prisma.product.create()
    PG-->>ProdSvc: Product Saved (UUID)
    ProdSvc->>Kafka: Publish to 'product.created' { id, name, price }
    ProdSvc-->>AdminUI: 201 Created

    Kafka->>PaySvc: Consume 'product.created'
    PaySvc->>Stripe: stripe.products.create({ id, name, default_price_data })
    Stripe-->>PaySvc: Stripe Product & Default Price Created
```

---

## 4. Reliability, Consumer Groups & Testing

### 4.1 Consumer Group Isolation
Each microservice is registered with a dedicated Kafka consumer group:
- `payment-service`: Independent offset tracking for `product.*` events.
- `order-service`: Independent offset tracking for `payment.successful`.
- `email-service`: Independent offset tracking for `order.created` and `user.created`.

### 4.2 In-Memory Kafka Test Harness (`InMemoryKafkaHarness`)
To enable fast, deterministic unit and integration tests in CI/CD without spinning up physical Kafka brokers, the shared `@repo/kafka` package includes `InMemoryKafkaHarness`:

```typescript
import { InMemoryKafkaHarness } from "@repo/kafka/test-harness";

const harness = new InMemoryKafkaHarness();

// Register asynchronous subscriber
harness.subscribe("payment.successful", async ({ value }) => {
  // process test event
});

// Produce message
await harness.send("payment.successful", { value: mockPaymentData });

// Assert recorded events
const events = harness.getAllEvents();
expect(events[0]?.topic).toBe("payment.successful");
```
