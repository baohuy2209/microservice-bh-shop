# Contributing to BH Shop Microservices

Thank you for contributing to the BH Shop distributed microservices platform! This guide outlines our Git workflow, commit conventions, testing expectations, and architectural governance rules.

---

## 1. Monorepo Architecture & Governance

This project is governed by the **BH Shop Microservices Constitution** located at [`.specify/memory/constitution.md`](.specify/memory/constitution.md). All pull requests MUST comply with the following non-negotiable principles:
- **Domain Isolation**: Direct cross-service database access is strictly prohibited. Use REST APIs for synchronous requests and Kafka events for side-effects.
- **Type Safety**: End-to-end TypeScript strictness without `any`. Centralize all shared models, event contracts, and DTOs in `@repo/types`.
- **Idempotency**: All Kafka message consumers must handle at-least-once delivery safely.

---

## 2. Git Branching Strategy (Monorepo GitHub Flow)

### 2.1 Branch Types & Naming Conventions
- **`main`**: Production release branch. Direct pushes are strictly blocked.
- **`staging`**: Pre-production integration branch.
- **Feature Branches**:
  - `feat/<scope>-<short-description>` (e.g., `feat/product-pagination`, `feat/order-analytics-export`)
  - `fix/<scope>-<short-description>` (e.g., `fix/payment-webhook-timeout`)
  - `refactor/<scope>` (e.g., `refactor/kafka-consumer-error-handling`)
  - `chore/<task>` (e.g., `chore/bump-turbo-2.8`)
  - `docs/<subject>` (e.g., `docs/amend-constitution-v1.1`)

---

## 3. Commit Message Standards

We enforce [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Allowed Types**:
- `feat`: New feature or user capability
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or refactoring tests
- `docs`: Documentation changes
- `ci`: CI/CD configuration and pipeline updates
- `chore`: Dependency updates or build tooling changes

---

## 4. Local Development & Testing Workflow

```bash
# 1. Install all dependencies
pnpm install

# 2. Generate Prisma database clients
pnpm db:generate

# 3. Run all tests locally with TurboRepo caching
pnpm test

# 4. Run type checks across all workspaces
pnpm check-types

# 5. Run linting across all workspaces
pnpm lint
```

---

## 5. Pull Request & Review Process

1. Open a Pull Request targeting `main` or `staging`.
2. Fill out the PR template completely (`.github/pull_request_template.md`).
3. Ensure all CI checks (ESLint, TypeScript Check, Automated Tests) pass.
4. Obtain approval from at least one CODEOWNER before merging.
5. All PRs are merged via **Squash & Merge**.
