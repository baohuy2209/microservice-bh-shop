## Summary

<!-- Provide a concise explanation of the changes introduced by this PR. -->

## Related Issue / Spec

- Spec: <!-- Link to spec under specs/ or related GitHub issue -->

## Affected Services & Packages

- [ ] `apps/modern-e-commerce`
- [ ] `apps/product-service`
- [ ] `apps/order-service`
- [ ] `apps/payment-service`
- [ ] `apps/auth-service`
- [ ] `apps/email-service`
- [ ] `packages/kafka`
- [ ] `packages/product-db`
- [ ] `packages/order-db`
- [ ] `packages/types`

## Constitution & Architecture Checklist

- [ ] **Domain Isolation**: No cross-service direct database queries introduced.
- [ ] **Event-Driven Patterns**: Cross-domain side-effects use Kafka topic events.
- [ ] **Type Safety**: No untyped `any` used; shared models updated in `@repo/types`.
- [ ] **Tests**: Unit and/or integration tests added for new logic or route changes.
- [ ] **CI Gates**: `pnpm check-types`, `pnpm lint`, and `pnpm test` pass locally.
