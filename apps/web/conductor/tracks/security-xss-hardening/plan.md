# Plan: Security Hardening: XSS & Input Sanitization

## Goal
Protect the application and its users from Cross-Site Scripting (XSS) attacks by implementing a multi-layered defense strategy including input sanitization, safe rendering, and strict security headers.

## Proposed Changes

### Input Sanitization
- Integrate `isomorphic-dompurify` for server-side and client-side sanitization.
- Implement a global `sanitizeHtml` utility.
- Apply sanitization to all form inputs that allow rich text or HTML.

### Frontend Audit
- Review all occurrences of `dangerouslySetInnerHTML` in the React codebase.
- Replace insecure rendering with sanitized equivalents or standard React components.

### Security Headers
- Configure a strict `Content-Security-Policy` (CSP) in `next.config.js` or middleware.
- Ensure `X-Content-Type-Options: nosniff` and `X-Frame-Options: DENY` are set.

### Database Operations
- Audit raw SQL queries (`$queryRawUnsafe`) to ensure no injection vulnerabilities exist.

## Verification Plan
- **Security Scan**: Run `python .agent/skills/vulnerability-scanner/scripts/security_scan.py`.
- **Manual Testing**: Attempt to inject `<script>` tags through various forms (Job notes, user profiles).
