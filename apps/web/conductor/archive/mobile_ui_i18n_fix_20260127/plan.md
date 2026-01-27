# Plan: Mobile Dashboard i18n & UI Consistency Fix

## Phase 1: Discovery & Auditing
- [x] List all raw i18n keys appearing in the UI (e.g., `navigation.teams`, `worker.expenses`).
- [x] Scan `apps/mobile/src/screens` and `apps/mobile/src/components` for `t()` calls without corresponding keys in `tr.json`.

## Phase 2: Translation Update
- [x] Add missing keys to `apps/mobile/src/locales/tr.json`:
    - `navigation.teams`
    - `worker.expenses`
    - Added `worker` section with multiple keys.
    - Added `navigation.calendar`, `navigation.logout`.
- [x] Synchronize `apps/mobile/src/locales/en.json` with the same keys.

## Phase 3: UI Implementation Fixes
- [ ] Review `AdminDashboardScreen.js` and ensure all card titles use correct translation keys.
- [ ] Review `WorkerDashboardScreen.js` and ensure consistent labeling.
- [ ] Check `DashboardBottomNav.js` for correct menu labels.

## Phase 4: Verification
- [ ] Manual verification of Admin Dashboard.
- [ ] Manual verification of Worker Dashboard.
- [ ] Manual verification of Manager Dashboard.
