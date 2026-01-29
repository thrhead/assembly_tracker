# Plan: Centralized Logging System (Web & Mobile)

Implementation of a sovereign, offline-first, and cost-free logging system for the Assembly Tracker project.

## 📋 Objectives
- Track technical errors and debug info (Web & Mobile).
- Maintain audit logs for critical business actions.
- Support offline logging with batch synchronization.
- Zero-cost (Self-hosted on existing DB).
- Admin UI for log monitoring.

## 🏗️ Architecture
1.  **Storage Engine**: 
    - **Web**: IndexedDB (Dexie.js).
    - **Mobile**: SQLite or AsyncStorage (batching).
    - **Backend**: PostgreSQL (Prisma) `SystemLog` table.
2.  **Sync Mechanism**:
    - Batch sync every 50 logs or periodically.
    - Automatic retry on connection restoration.
3.  **Log Retention**:
    - Technical logs pruned after 90 days.
    - Audit logs kept indefinitely.

---

## 📅 Roadmap

### Phase 1: Infrastructure (Web/Backend)
- [x] **DB Schema**: Add `SystemLog` model to `prisma/schema.prisma`.
- [x] **Migration**: Apply schema changes.
- [x] **API Endpoint**: Create `POST /api/logs/batch` for receiving logs.
- [x] **Retention Worker**: Add a simple logic to delete old technical logs.

### Phase 2: Mobile Integration (Expo)
- [x] **Logger Service**: Create `src/services/LoggerService.js`.
- [x] **Global Error Handler**: Wrap app to catch unhandled JS errors.
- [x] **Sync Integration**: Hook into `SyncManager` to upload logs.

### Phase 3: Web Integration (Next.js)
- [x] **Web Logger**: Create `src/lib/logger.ts` using IndexedDB.
- [x] **Middleware/Wrapper**: Capture client-side errors.
- [x] **Server Side Logging**: Extend backend logs to save to `SystemLog`.

### Phase 4: Admin Dashboard
- [x] **Log Viewer**: Create `/admin/logs` page.
- [x] **Filtering**: Filter by platform, level, user, and date range.
- [x] **Audit Trail**: Specialized view for business audits.

---

## 🧪 Verification Plan
### Automated Tests
- [ ] Unit tests for `LoggerService` (adding, batching).
- [ ] API tests for `/api/logs/batch`.

### Manual Verification
- [ ] Disable internet on mobile, generate logs, restore internet, verify backend.
- [ ] Trigger an intentional error in Web and verify it appears in Admin UI.
- [ ] Check if audit logs correctly record "Sensitive" actions (e.g., Job Deletion).
