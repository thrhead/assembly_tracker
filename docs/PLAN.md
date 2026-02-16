# Orchestration Plan: Resolving GitHub Issues #35, #23, #22

## Overview
This plan addresses 3 critical issues reported in the `thrhead/assembly_tracker` repository. The goal is to resolve the mobile job creation bug, improve job visibility (Job ID), and enhance search filtering capabilities across both web and mobile platforms.

## Phase 1: Planning
- [x] Analyze Issues
- [x] Create this Plan
- [x] User Approval

## Phase 2: Implementation

### 1. Fix Mobile Job Creation (Issue #35)
**Status:** ✅ Completed
**Problem:** `POST /api/admin/jobs` returns 500 Internal Server Error when called from mobile app.
**Agent:** `backend-specialist`
**Dependencies:** `apps/web/app/api/admin/jobs/route.ts`
**Steps:**
1. [x] Investigate api route logic for `jobs`.
2. [x] Identify potential payload structure mismatches between mobile app and web API.
3. [x] Add proper error handling and validation to prevent 500 errors.
4. [x] Verify fix with mock request.

### 2. Job ID Display (Issue #23)
**Problem:** Job ID is not displayed in the mobile application list/detail views.
**Agent:** `mobile-developer`
**Dependencies:** `apps/mobile` (Job List/Detail Components)
**Steps:**
1.  Verify API returns `jobNo` (or `id`) in the job object.
2.  Update Mobile UI (`JobCard` or `JobDetailScreen`) to display `Job ID: #123`.
3.  Ensure consistent styling.

### 3. Enhanced Filtering (Issue #22)
**Problem:** Search functionality only covers Client/Company names. Users cannot search by Job ID or Project No.
**Agent:** `backend-specialist` & `frontend-specialist` (if UI needs update)
**Dependencies:** `apps/web/app/api/admin/jobs/route.ts` (Search Logic), Mobile Search UI.
**Steps:**
1.  Update backend search query (Prisma `where` clause) to include:
    -   `jobNo` (contains/equals query)
    -   `projectNo` (contains/equals query)
2.  Verify search works efficiently.
3.  Test on both Web and Mobile search bars.

## Verification
**Agent:** `test-engineer`
1.  Run backend tests for API endpoints.
2.  Verify mobile app builds correctly.
3.  Perform manual verification steps (if automated tests are difficult for UI).