# Specification: Mobile Dashboard i18n & UI Consistency Fix

## Problem Statement
The mobile application dashboards (Admin, Manager, Worker) currently display raw i18n keys (e.g., `navigation.teams`, `worker.expenses`) instead of translated strings in Turkish. This leads to a poor user experience and unprofessional UI.

## Scope
- **Translation Completeness**: Audit all dashboard screens and components for missing or raw i18n keys.
- **Turkish Locale Fix**: Update `apps/mobile/src/locales/tr.json` with missing keys.
- **English Locale Fix**: Sync `apps/mobile/src/locales/en.json` to ensure consistency.
- **UI Audit**: Verify menu labels, navigation titles, and dashboard cards across all user roles.

## Affected Components
- `AdminDashboardScreen.js`
- `WorkerDashboardScreen.js`
- `ManagerDashboardScreen.js`
- `DashboardBottomNav.js`
- `JobDetailScreen.js`
- `ExpenseManagementScreen.js`

## Quality Gates
- No raw i18n keys visible in any dashboard.
- All dashboard menus and buttons translated correctly in Turkish and English.
- Navigation header titles match the translation keys.
