# Spec: Security Hardening: XSS & Input Sanitization

## Requirements
- All user-provided HTML must be sanitized before being stored or rendered.
- `Content-Security-Policy` must block unauthorized external scripts and inline styles.
- Zero usage of unvalidated `dangerouslySetInnerHTML`.

## Technical Constraints
- Sanitization must be performant and work in both Node.js (Edge) and Browser environments.
- CSP must not break existing integrations (e.g., Cloudinary, Leaflet maps).

## Success Criteria
- [ ] No high-risk XSS vulnerabilities found by automated scanners.
- [ ] CSP is active and blocking unauthorized requests.
- [ ] All dynamic content rendering is verified as safe.
