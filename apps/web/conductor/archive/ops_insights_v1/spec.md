# Specification: Operations & Insights Enhancement V1

## Goal
Improve field team efficiency through UI/UX enhancements and provide managers with better data visibility through advanced filtering and reporting.

## Core Features
1.  **Mobile Experience (Worker Focused):**
    *   **Voice Notes:** Ability to record and upload voice notes for job steps and expenses.
    *   **Dark Mode:** Theme-aware dark mode support for the mobile app.
    *   **Quick Action UI:** Enhanced navigation and action buttons for field workers.
2.  **Web Insights (Admin/Manager Focused):**
    *   **Advanced Filtering:** Multi-criteria filtering for jobs (Date range, Team, Status, Priority).
    *   **Interactive Dashboard:** New visual widgets for completion rates and team performance.
    *   **Enhanced Export:** Export filtered data to Excel/PDF.

## Tech Stack
*   **Mobile:** React Native, Expo, `expo-av` for audio recording.
*   **Web:** Next.js, TanStack Table (for filtering), Recharts (for dashboard).
*   **Backend:** Prisma, PostgreSQL.
