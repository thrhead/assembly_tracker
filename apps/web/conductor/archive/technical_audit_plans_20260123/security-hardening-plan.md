# Detailed Plan: Security Hardening & Compliance

## Goal
Achieve a "CLEAN" status from `security_scan.py` and ensure zero hardcoded secrets in the codebase.

## Phase 1: Secrets & Sensitive Data Cleanup
- [ ] **Test Scripts Audit:**
    - Refactor `apps/web/scripts/` files to remove hardcoded passwords.
    - Implement a `.env.test` pattern or use environment variables for CI/CD.
- [ ] **Source Code Sanitization:**
    - Remove hardcoded default password from `apps/web/components/forms/login-form.tsx`.
    - Secure `lib/crypto-service.test.ts` mock tokens.
- [ ] **Git History Check:**
    - Ensure sensitive data isn't just hidden but removed from history if necessary (using BFS/Filter-repo if required by policy).

## Phase 2: Dependency Security
- [ ] **Lock File Generation:**
    - Fix monorepo integrity by ensuring `package-lock.json` is generated and tracked correctly.
- [ ] **Critical Vulnerability Patching:**
    - Run `npm audit fix` and manually update packages with critical CVEs (e.g., `next`, `jose`, `bcryptjs`).

## Phase 3: Code Injection & XSS Prevention
- [ ] **Coverage Report Handling:**
    - Exclude `coverage/` directory from security scans as it contains third-party generated HTML/JS.
- [ ] **Injection Audit:**
    - Review any usage of `dangerouslySetInnerHTML` in the frontend.
    - Ensure all dynamic SQL queries use Prisma's `$queryRawUnsafe` safely or prefer standard methods.

## Phase 4: Production Readiness (Infrastructure)
- [ ] **Security Headers:**
    - Implement `Content-Security-Policy` (CSP) and ensure HSTS is active.
- [ ] **Rate Limiting:**
    - Add rate limiting to `/api/auth/*` and the new `/api/admin/api-keys` endpoints.

## Verification
- [ ] Run `python .agent/skills/vulnerability-scanner/scripts/security_scan.py apps/web`
- [ ] Run `python .agent/skills/vulnerability-scanner/scripts/dependency_analyzer.py apps/web`
