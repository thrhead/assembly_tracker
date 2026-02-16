# Detailed Plan: Enterprise Integrations

## Goal
Establish a robust, secure, and scalable integration layer for Assembly Tracker to interact with external systems (ERP, CRM, Billing) and generate professional documentation.

## Phase 1: Infrastructure & Security Hardening
- [ ] **Database Expansion:**
    - Enhance `ApiKey` model with `scopes` (e.g., `jobs:read`, `jobs:write`).
    - Create `IntegrationLog` model to track API usage and Webhook delivery attempts.
- [ ] **Middleware:**
    - Implement an API Auth Middleware that validates hashed keys and checks request scopes.
- [ ] **Admin Dashboard:**
    - Create a unified `Integrations` dashboard that combines API Key and Webhook management with usage metrics.

## Phase 2: Webhooks Event Bus
- [ ] **Event System:**
    - Create a central `EventBus` service to emit internal events (`JOB_COMPLETED`, `COST_CREATED`).
- [ ] **Webhook Deliverer:**
    - Implement a resilient delivery service with retry logic (exponential backoff).
    - Support for custom headers and HMAC signature verification.

## Phase 3: Reporting & PDF Engine
- [ ] **PDF Optimization:**
    - Refine `pdf-generator.ts` to support multi-page complex reports.
    - Add company logo support and customizable templates.
- [ ] **Proforma Invoice Logic:**
    - Automate PDF generation upon job completion.
    - Create an "Exports" section in the Admin panel for bulk report downloads.

## Phase 4: Public API Documentation
- [ ] **API Docs:**
    - Generate Swagger/OpenAPI documentation for the `/api/v1/*` endpoints.
    - Create a "Developer Portal" view for admins to test their keys.

## Verification & Testing
- [ ] **Integration Tests:** Mock external webhook receivers to verify delivery.
- [ ] **Security Audit:** Pentest the API key validation logic.
- [ ] **Cross-Browser Testing:** Ensure PDF downloads work across all platforms.
