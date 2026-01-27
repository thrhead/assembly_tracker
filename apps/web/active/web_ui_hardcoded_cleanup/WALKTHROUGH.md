# Walkthrough - Web UI Hardcoded Color Cleanup

## Changes
### Refactored [input.tsx](file:///c:/Users/tahir/Documents/assembly_tracker/apps/web/components/ui/input.tsx)
- Replaced hardcoded `border-red-500` with `border-destructive`.
- Replaced hardcoded `focus-visible:ring-red-500` with `focus-visible:ring-destructive/50`.

### Refactored [skeleton.tsx](file:///c:/Users/tahir/Documents/assembly_tracker/apps/web/components/ui/skeleton.tsx)
- Replaced `bg-gray-200` with `bg-muted`.

## Verification Results

### Automated Tests
- `npm run lint`: **Passed** (0 errors)

### Visual Changes (Expected)
- **Inputs with Errors**: Will now show the global destructive color instead of generic red-500.
- **Loading Skeletons**: Will match the theme's muted color (oklch-based), ensuring better contrast in both light and dark modes.
