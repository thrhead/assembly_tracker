# Orchestration Plan: Automatic Job Number Generation for Mobile

## Task Overview
The mobile app currently creates jobs with "no-code" or missing job numbers. The goal is to implement automatic job number generation (`jobNo`) in the mobile job creation flow, consistent with the web application's logic.

## Analysis
- **Web App Logic:** Uses `generateJobNumber()` from `@/lib/utils/job-number` which finds the last sequence for the current year and increments it.
- **Problem:** The API endpoint `POST /api/admin/jobs` (used by mobile) does not explicitly call `generateJobNumber()` during job creation, whereas the Server Action `createJobAction` in the web app does.
- **Solution:** Move the `jobNo` generation logic into the API route or ensure the API route correctly triggers it.

## Phase 1: Planning
- [x] Analyze codebase for `jobNo` generation logic.
- [x] Identify the mismatch between Web Server Actions and API Routes.
- [ ] Create detailed implementation steps.

## Phase 2: Implementation

### 1. Backend Enhancement (Agent: `backend-specialist`)
- **File:** `apps/web/app/api/admin/jobs/route.ts`
- **Steps:**
    1. Import `generateJobNumber`, `generateStepNumber`, and `generateSubStepNumber` from `@/lib/utils/job-number`.
    2. Update `POST` handler to generate a new `jobNo` if not provided.
    3. Generate `stepNo` for each step and `subStepNo` for each substep during the creation process.
    4. Ensure the transaction handles hierarchical numbering correctly.

### 2. Mobile Integration (Agent: `mobile-developer`)
- **File:** `apps/mobile/src/screens/admin/CreateJobScreen.js`, `apps/mobile/src/hooks/useJobForm.js`
- **Steps:**
    1. Verify if the mobile app needs to display the generated number after creation.
    2. Update UI to reflect that the Job Number is "Automatic" during creation.

### 3. Verification (Agent: `test-engineer`)
- **Steps:**
    1. Create a job via mobile API.
    2. Verify `jobNo` format (e.g., `AS-2026-XXXX`).
    3. Verify hierarchical numbers for steps/substeps.
    4. Verify consistency between web and mobile created jobs.

## Success Criteria
- Jobs created from the mobile app have sequential `jobNo` values.
- Steps and substeps have correct hierarchical numbers.
- No "no-code" or placeholder values in the database for new jobs.
