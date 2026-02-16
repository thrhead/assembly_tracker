# Plan: Fix PWA Routing 404 on Refresh

## Problem
The mobile app PWA/Web version (deployed on Vercel) returns a 404 error when a dynamic route (e.g., `/jobs/[id]`) is refreshed. This happens because Vercel attempts to find a physical file matching the path instead of serving `index.html` for client-side routing.

## Goal
Configure Vercel to correctly handle Single Page Application (SPA) routing by rewriting all requests to `index.html`.

## Proposed Changes

### [DevOps/Infrastructure] [apps/mobile/vercel.json]
- Add a `rewrites` array to redirect all paths to `/index.html`.
- This ensures that React Navigation's `linking` configuration can handle the URL parsing on the client side.

### [Verification]
- Deploy the change to a preview branch (if possible) or verify the configuration locally.
- Test the following scenarios:
    1. Navigate to a job detail page via UI, then refresh.
    2. Directly enter a job detail URL in the browser address bar.
    3. Ensure static assets (images, manifest.json) still load correctly.

## Agents Involved
1. **Explorer Agent**: (Completed) Investigated the cause and identified missing rewrites.
2. **Project Planner**: (Current) Created this implementation plan.
3. **DevOps Engineer**: Will implement the `vercel.json` changes.
4. **Test Engineer**: Will verify the fix.