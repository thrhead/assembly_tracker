# Plan: Resilient Webhook & Retry Mechanism

## Goal
Implement a robust webhook delivery system that ensures reliable integration with external systems using exponential backoff and comprehensive logging.

## Proposed Changes

### Event System Implementation
- Create a central `EventBus` service in `lib/event-bus.ts`.
- Define standard events: `JOB_COMPLETED`, `COST_CREATED`, `SIGNATURE_ADDED`.
- Refactor existing services to emit events through the `EventBus`.

### Delivery Service (Worker)
- Implement `WebhookDeliverer` with retry logic.
- Use **Exponential Backoff** strategy (e.g., 1m, 5m, 15m, 1h, 6h).
- Implement HMAC signature verification for security.
- Add support for custom HTTP headers.

### Persistence & Monitoring
- Add `WebhookLog` model to Prisma schema.
- Create an Admin UI to monitor delivery status and manually trigger retries.

## Verification Plan
- **Integration Tests**: Mock an external receiver to verify retries on 5xx errors.
- **Log Audit**: Ensure all attempts are recorded with status codes and payloads.
