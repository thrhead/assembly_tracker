# Plan: Mobile Approval & Filtering Synchronization

## Goal
Synchronize the mobile application's job approval logic and filtering system with the web application to provide a consistent management experience and resolve operational status mismatches.

## Proposed Changes

### Phase 1: Approval Logic (Job, Step, Substep)
- **Main Job Acceptance**: Implement a prominent approval card in `JobDetailScreen.js` for Managers/Admins when a job is in `PENDING_APPROVAL` status.
- **Granular Approvals**: Add "Approve" and "Reject" actions for individual JobSteps and JobSubSteps.
- **Dynamic Rejection**: Create a multi-purpose rejection modal that handles reasons for Jobs, Steps, and SubSteps independently.
- **Status Badges**: Add visual status indicators (ONAY BEKLİYOR, ONAYLANDI, REDDEDİLDİ) to match the web dashboard.

### Phase 2: Enhanced Filtering
- **Status Alignment**: Map mobile filters to actual backend statuses:
    - **Bekleyen**: `PENDING`
    - **Devam Eden**: `IN_PROGRESS`
    - **Onay Bekleyen**: `PENDING_APPROVAL`
    - **Onaylanan**: `COMPLETED` (where acceptanceStatus is ACCEPTED)
- **UI Improvement**: Convert the static filter bar to a horizontally scrollable component to accommodate the 6-tier filtering system.

### Phase 3: Infrastructure & Bug Fixes
- **API Extension**: Update `apps/web/app/api/admin/jobs/route.ts` to include `acceptanceStatus` in the response.
- **Theme Standardization**: Add missing `success` and `warning` semantic color tokens to `theme.js`.
- **Robust Checks**: Implement defensive filtering in `useJobFiltering.js` to handle edge cases and null statuses.

## Verification Plan
- Manual test: Complete a job as a worker -> Verify it appears under "Onay Bekleyen" for admin.
- Manual test: Approve a job as an admin -> Verify it moves to "Onaylanan".
- Visual check: Ensure all 6 filter tabs are accessible via horizontal scroll.
