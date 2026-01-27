# Spec: Public API Documentation & Developer Portal

## Requirements
- Comprehensive documentation for all `/api/v1/*` endpoints.
- Support for OpenAPI 3.0+ specification.
- Interactive UI to test API calls directly from the browser.
- Secure access to documentation (restricted to authorized users).

## Technical Constraints
- Must stay in sync with the actual code automatically (using JSDoc or Zod).
- Must not expose internal-only or deprecated endpoints.

## Success Criteria
- [ ] Swagger UI is accessible and fully populated.
- [ ] API Key authentication works within the "Try it out" interface.
- [ ] All major models (Job, Cost, etc.) have clearly defined schemas.
