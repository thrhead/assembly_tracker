# Issue Fixes - 2026-01-30

## Completed Tasks

### 1. Web Notification Integration
- **Context:** Duplicate notification bells were appearing on the Admin Dashboard.
- **Action:** Removed the redundant `NotificationsBell` link from `apps/web/app/[locale]/admin/page.tsx` as the `AdminHeader` already contains the `NotificationDropdown`.
- **Status:** Resolved. Code pushed to `main`.

### 2. Admin & Manager Parity (Mobile)
- **Approvals Navigation:** Added a navigation link to the "Approvals" screen from the Manager Dashboard (`apps/mobile/src/screens/manager/ManagerDashboardScreen.js`) to allow managers to access approvals easily.
- **Approval Attachments:** Updated `ApprovalCard.js` (`apps/mobile/src/components/admin/ApprovalCard.js`) to display attachment images for Cost approvals, with a modal for full-screen viewing.
- **Job Editing:** Verified `projectNo` is available in `EditJobScreen.js`.
- **Status:** Resolved. Code pushed to `main`.
- **GitHub Issue:** #20 Closed.

### 3. Alert System Refactoring (Mobile)
- **Action:** Replaced native `Alert.alert()` usages with the custom `useAlert()` hook in the following files for consistent UI/UX:
  - `apps/mobile/src/hooks/useUserManagement.js`
  - `apps/mobile/src/components/admin/UserFormModal.js`
  - `apps/mobile/src/hooks/useApprovals.js`
  - `apps/mobile/src/hooks/useWorkerExpenses.js`
  - `apps/mobile/src/components/common/VoiceRecorder.js`
- **Status:** Completed. Native alerts replaced with themed custom modals. Code pushed to `main`.
- **GitHub Issue:** #15 Closed.

### 4. Work Order Numbering (Issue #19)
- **Goal:** Implement hierarchical numbering: `[ProjectNo]-WO-[Seq]` for Jobs, and `...-SUB-[Seq]` for steps.
- **Action:**
  - Updated `apps/web/lib/utils/job-number.ts`: Added `generateJobNumber(projectNo)` to find max WO sequence for a project. Added `formatTaskNumber` to use `-SUB-` separator.
  - Updated `apps/web/lib/actions/jobs.ts`: Creating a job now uses `projectNo` to generate the custom Job ID.
  - Updated `apps/web/app/api/admin/jobs/bulk-import/route.ts`: Bulk import now reads `Project No` and generates correct Job IDs.
- **Status:** Completed.
- **GitHub Issue:** #19 Closed.

### 5. Multi-Language Support (Issue #16)
- **Goal:** Replace hardcoded strings in `EditJobScreen.js` and other screens with `i18n` keys.
- **Action:**
  - Updated `tr.json` with missing keys for `editJob` and `status` sections.
  - Refactored `apps/mobile/src/screens/admin/EditJobScreen.js` to use `t()` hook for all labels, buttons, and status texts.
- **Status:** Completed for Edit Job screen.
- **GitHub Issue:** #16 Closed.

### 6. Testing (Jest)
- **Action:** Updated `jest.setup.js` and `jest.config.js` to include mocks for `AlertContext`, `ThemeContext`, `Navigation`, and Expo libraries.
- **Status:** Mocks implemented and pushed. `npm test` environment configuration pending (open issue).

### 7. Estimate vs. Actual Analysis (Issue #32)
- **Goal:** Enable variance analysis by comparing planned budget/duration vs. actual costs/time.
- **Action:**
  - **Database:** Added `budget` and `estimatedDuration` to `Job` schema.
  - **Backend:** Updated `jobs.ts` actions and created `/api/admin/reports/variance`.
  - **Web:** Created new Analysis report page `/admin/reports/analysis`.
  - **Mobile:** Updated `EditJobScreen` to allow budget input and `JobInfoCard` to display estimates.
- **Status:** Completed.
- **GitHub Issue:** #32 Closed.

### 8. Centralized Team Reports (Issue #31)
- **Goal:** Create a consolidated report page for all teams to compare performance and financials.
- **Action:**
  - **Data:** Added `getAllTeamsReports` to `apps/web/lib/data/teams.ts` to aggregate team stats.
  - **UI:** Created `apps/web/app/[locale]/admin/reports/teams/page.tsx` with summary cards and comparison table.
  - **Navigation:** Added link to Team Reports in the main Admin Reports dashboard.
- **Status:** Completed.
- **GitHub Issue:** #31 Closed.

### 9. Mobile Job Progress Fixes (Issue #30)
- **Goal:** Resolve issue where jobs could not be started or progressed on mobile.
- **Action:**
  - **Backend Cache:** Added `export const dynamic = 'force-dynamic'` to `worker/jobs` and `worker/jobs/[id]` APIs to prevent stale data caching (Next.js 15).
  - **Access Control:** Added explicit DB-based assignment checks to `/start` and `/toggle` endpoints for security and robustness.
  - **Mobile:** Added fallback for `updatedAt` in `JobDetailScreen.js` to ensure conflict checks don't fail silently.
- **Status:** Completed.
- **GitHub Issue:** #30 Closed.

## Repository Status
- **Remote:** `https://github.com/thrhead/assembly_tracker.git`
- **Branch:** `main`
- **Push Status:** Successfully pushed changes for Issues #15, #20, #19, #16, #32, #31, #30.

## Open Issues / Ongoing Work
- **#14 (Manuel Test):** Remains open per user request.
