# Plan: System Stabilization & Debt Cleanup (v1)

## Goal
Resolve critical syntax errors, fix monorepo linting configurations, and optimize mobile list performance based on the System Audit report.

## Phase 1: Critical Syntax Fixes (Web)
- [x] **Task: Fix `apps/web/app/api/admin/jobs/[id]/route.ts`**
    - Resolve syntax errors (TS1136, TS1109) introduced during previous edits.
- [x] **Task: Fix `apps/web/components/admin/gantt-chart.tsx`**
    - Cleanup extra characters at the end of the file (TS1128).

## Phase 2: Lint & Monorepo Infrastructure
- [x] **Task: Resolve ESLint Module Conflict**
    - Fix `eslint-config-next/core-web-vitals` not found error in monorepo environment.
- [x] **Task: Standardize `package-lock.json`**
    - Ensure all workspaces are correctly represented in the lock file.

## Phase 3: Mobile Performance Optimization
- [x] **Task: Clean up `key={index}` usage**
    - Refactor `apps/mobile/src/components/admin/DashboardStatsGrid.js` to use unique IDs.
    - Refactor `apps/mobile/src/components/EventList.js` (or equivalent) to use unique IDs.
- [x] **Task: Improve Touch Targets**
    - Update small icons and buttons identified in `mobile_audit.py` to minimum 44x44 size.

## Phase 4: Final Security & Cleanup
- [x] **Task: Sanitize remaining test scripts**
    - Complete environment variable migration for all files in `apps/web/scripts/`.
- [x] **Task: Run final `security_scan.py`**
    - Target overall status: PASSED.
