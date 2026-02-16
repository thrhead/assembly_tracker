# Plan: Mobile Parity & Metadata Modernization (v1)

## Goal
Achieve full parity between Web and Mobile for operational metadata (GPS, Timestamps) and document sharing (Proforma), while enhancing mobile UI with real-time insights (Time Estimation).

## Phase 1: Document Sharing & Export [COMPLETED]
- [x] Task: Implement Proforma Data API on Web.
- [x] Task: Add "Proforma Export" (Share) capability to Mobile Job Detail.
- [x] Task: Synchronize PDF generation logic (Web) with text-share logic (Mobile).

## Phase 2: Operational Metadata (GPS & Timestamps) [COMPLETED]
- [x] Task: Extend Prisma schema to include GPS for `JobStep`.
- [x] Task: Implement background GPS capture on Mobile during step completion.
- [x] Task: Visualize step-level GPS data in Web Admin Timeline.
- [x] Task: Add GPS & Timestamp synchronization for Customer Signatures across platforms.

## Phase 3: Real-time Insights (Estimation) [COMPLETED]
- [x] Task: Implement "Estimated Completion Time" logic based on progress and elapsed time.
- [x] Task: Add Progress Bar and Estimation display to Web Job Details.
- [x] Task: Port Estimation & Progress UI to Mobile Job Info card.

## Phase 4: System Integration & Webhooks [COMPLETED]
- [x] Task: Integrate `job.started`, `job.completed`, and `job.rejected` events into Webhook service.
- [x] Task: Ensure mobile-triggered actions correctly fire these webhooks.

## Phase 5: Advanced Module Parity [IN PROGRESS]
- [/] Task: Port "Advanced Planning" (Gantt/Rota) features to Mobile.
- [ ] Task: Migration of "Comprehensive Reports" with charts to Mobile.
- [ ] Task: Port "Team Management" details to Mobile.

## Phase 6: Validation & Performance
- [ ] Task: Verification of GPS accuracy across various devices.
- [ ] Task: Performance audit for real-time calculation in Large Jobs.
- [ ] Task: Final UX review for dark/light theme consistency.
