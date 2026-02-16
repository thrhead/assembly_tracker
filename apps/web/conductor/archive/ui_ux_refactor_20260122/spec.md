# Specification: UI/UX & Performance Refactor

## Goal
Implement critical UI/UX improvements identified by the `ui-ux-pro-max` audit without altering the core business logic or layout structure.

## Scope
1.  **Web Accessibility:** Fix focus states for keyboard navigation.
2.  **Web Performance:** Optimize image loading and fix z-index layering.
3.  **Mobile Performance:** Modernize touch interactions using `Pressable`.

## Impact Analysis
*   **Visual Changes:** Minimal (only focus rings and smoother animations).
*   **Functional Changes:** None (APIs remain the same).
*   **Performance:** Improved LCP (Largest Contentful Paint) and interaction latency.
