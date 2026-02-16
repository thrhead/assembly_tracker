# Plan: i18n Migration Phase 2 (Full Localization)

## Goal
Complete the migration of all application routes (`/admin`, `/manager`, `/worker`, `/customer`) to the localized `[locale]` structure and implement full content translation.

## Phase 1: Route Migration
- [ ] Task: Move `apps/web/app/admin` -> `apps/web/app/[locale]/admin`
- [ ] Task: Move `apps/web/app/manager` -> `apps/web/app/[locale]/manager`
- [ ] Task: Move `apps/web/app/worker` -> `apps/web/app/[locale]/worker`
- [ ] Task: Move `apps/web/app/customer` -> `apps/web/app/[locale]/customer`
- [ ] Task: Update all `Link` components and `redirect()` calls to support locale prefix.

## Phase 2: Content Extraction & Translation
- [ ] Task: Extract hardcoded strings from Admin components to `messages/*.json`.
- [ ] Task: Extract strings from Worker components.
- [ ] Task: Extract strings from Manager components.
- [ ] Task: Extract strings from Customer components.

## Phase 3: Client Component Localization
- [ ] Task: Integrate `useTranslations` hook in all Client Components.
- [ ] Task: Update `NextIntlClientProvider` to pass relevant namespaces.

## Phase 4: Verification
- [ ] Task: Test all roles in both English and Turkish.
- [ ] Task: Ensure no 404s due to route changes.
