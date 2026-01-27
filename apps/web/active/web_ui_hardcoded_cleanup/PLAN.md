# Web UI Hardcoded Color Cleanup

## Goal
Eliminate remaining hardcoded Tailwind colors in `apps/web/components/ui/` to ensure full theme compliance. Specifically hitting `Input` and `Skeleton` components.

## User Review Required
> [!IMPORTANT]
> This completes the "standardization triad" for the Web UI.

## Proposed Changes

### Web UI Components

#### [MODIFY] [input.tsx](file:///c:/Users/tahir/Documents/assembly_tracker/apps/web/components/ui/input.tsx)
- Replace `border-red-500` with `border-destructive`
- Replace `focus-visible:ring-red-500` with `focus-visible:ring-destructive/50`

#### [MODIFY] [skeleton.tsx](file:///c:/Users/tahir/Documents/assembly_tracker/apps/web/components/ui/skeleton.tsx)
- Replace `bg-gray-200` with `bg-muted` (standard token for muted backgrounds/loading states)

## Verification Plan

### Manual Verification
1.  **Skeleton**: Verify loading states match the theme color (`muted`).
2.  **Input Error**: Trigger form errors and verify the border color matches the `destructive` token (Soft Red).

### Automated Tests
- Run `npm run lint`.
