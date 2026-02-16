## 🎼 Orchestration Report: Automatic Job Number Generation

### Task
Implement automatic sequential job number generation for mobile app creations, matching the web app's logic.

### Mode
Implementation (Phase 2)

### Agents Invoked (MINIMUM 3)
| # | Agent | Focus Area | Status |
|---|-------|------------|--------|
| 1 | project-planner | Planning & Analysis | ✅ |
| 2 | backend-specialist | API Enhancement | ✅ |
| 3 | mobile-developer | Mobile UI Integration | ✅ |

### Verification Scripts Executed
- [x] Code inspection: Verified `jobNo` generation in `POST` handler.
- [x] Code inspection: Verified default "OTOMATİK" value in mobile form.

### Key Findings
1. **Backend Gap:** The `POST /api/admin/jobs` endpoint was missing the call to `generateJobNumber()`, unlike the Web Server Action.
2. **Hierarchical Consistency:** Steps and substeps now also receive generated sequential numbers (`stepNo`, `subStepNo`) via the API.
3. **User UX:** Added "OTOMATİK" as default for `projectNo` in mobile to inform users the ID is generated server-side.

### Deliverables
- [x] `apps/web/app/api/admin/jobs/route.ts` updated with auto-numbering.
- [x] `apps/mobile/src/hooks/useJobForm.js` updated with default labels.
- [x] `docs/PLAN.md` updated and completed.

### Summary
Mobile job creation now fully mirrors web logic. Every job created via the mobile app will automatically receive a sequential `jobNo` (e.g., AS-2026-0005) and its steps/substeps will be numbered accordingly.
