# Plan: Public API Documentation & Developer Portal

## Goal
Establish professional and interactive API documentation to facilitate external integrations and provide developers with a clear interface for Assembly Tracker services.

## Proposed Changes

### OpenAPI Specification
- Implement `swagger-jsdoc` to extract documentation from JSDoc comments in API routes.
- Define standard schemas for `Job`, `Customer`, `User`, and `Cost` models using Zod-to-OpenAPI.

### Swagger UI Integration
- Set up `swagger-ui-react` on a dedicated route (e.g., `/admin/api-docs`).
- Enable "Try it out" functionality with API Key authentication.

### Developer Portal
- Create a simple dashboard for Admins/Developers to:
    - View and rotate API Keys.
    - Read getting started guides.
    - View API usage quotas and metrics.

## Verification Plan
- **Schema Validation**: Ensure the generated `openapi.json` is valid using external validators.
- **UI Check**: Verify that all endpoints are correctly listed and interactive in the Swagger UI.
