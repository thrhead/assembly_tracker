# Detailed Plan: System Audit & Quality Assurance

## Goal
Perform a multi-perspective audit of Assembly Tracker to ensure high code quality, peak performance, and reliable web interactions.

## Phase 1: Clean Code Audit (Parallel)
- [ ] **Frontend Audit:**
    - Examine `apps/web/components` and `apps/web/app` for DRY, SRP, and Atomic Design principles.
    - Check for hardcoded colors or styles that should be in the theme.
- [ ] **Backend Audit:**
    - Review `apps/web/app/api` and `apps/web/lib` for efficient Prisma usage and proper error handling.
    - Verify middleware logic and security helpers.

## Phase 2: Performance Profiling
- [ ] **Lighthouse Audit:**
    - Run `lighthouse_audit.py` on main admin and customer routes.
- [ ] **Bundle Analysis:**
    - Check for large dependencies or duplicate imports in `apps/web`.
- [ ] **Mobile Performance:**
    - Run `mobile_audit.py` to check for rendering bottlenecks in React Native.

## Phase 3: Web App Testing (Playwright)
- [ ] **E2E Flow Validation:**
    - Run `playwright_runner.py` on the login and dashboard pages.
- [ ] **Accessibility Check:**
    - Verify ARIA labels and semantic HTML using the `accessibility_checker.py`.

## Phase 4: Final Verification & Synthesis
- [ ] Run `security_scan.py` to ensure no new vulnerabilities were introduced.
- [ ] Run `lint_runner.py` for both web and mobile.
- [ ] Synthesize all findings into an Orchestration Report.
