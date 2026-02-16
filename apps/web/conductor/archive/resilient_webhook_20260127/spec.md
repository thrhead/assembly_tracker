# Spec: Resilient Webhook & Retry Mechanism

## Requirements
- Webhooks must be delivered asynchronously.
- Failed deliveries must be retried up to 5 times using exponential backoff.
- Each delivery attempt must be logged in the database.
- Payloads must be signed using a secret key (HMAC-SHA256).

## Technical Constraints
- Must not block the main request thread.
- Minimum retry interval: 1 minute.
- Maximum retry interval: 24 hours.

## Success Criteria
- [ ] `EventBus` captures and dispatches all specified events.
- [ ] Webhook deliveries are successfully retried after simulated failures.
- [ ] Admin panel shows a history of webhook deliveries.
