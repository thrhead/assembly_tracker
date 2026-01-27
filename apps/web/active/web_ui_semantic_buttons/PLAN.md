# Web UI Semantic Button Refactor

## Goal
Refactor `apps/web/components/ui/button.tsx` to use semantic CSS variables (tokens) defined in `globals.css` instead of hardcoded Tailwind colors (e.g., `bg-indigo-600`). This ensures the application theme is consistent and easily customizable via CSS variables.

## User Review Required
> [!IMPORTANT]
> This change will affect ALL buttons in the web application. The visual appearance will shift from the hardcoded "Indigo" to the "Primary" color defined in `globals.css` (currently also a soft indigo/purple, so the change should be subtle but architecturally correct).

## Proposed Changes

### Web UI Components

#### [MODIFY] [button.tsx](file:///c:/Users/tahir/Documents/assembly_tracker/apps/web/components/ui/button.tsx)
- Replace `bg-indigo-600` with `bg-primary`
- Replace `text-white` (on primary) with `text-primary-foreground`
- Replace `hover:bg-indigo-700` with `hover:bg-primary/90`
- Replace `focus:ring-indigo-500` with `focus-visible:ring-ring`
- Update `destructive` variant to use `bg-destructive text-destructive-foreground`
- Update `outline` variant to use `border-input bg-background hover:bg-accent`
- Update `ghost` variant to use `hover:bg-accent hover:text-accent-foreground`
- Update `link` variant to use `text-primary`

## Verification Plan

### Manual Verification
1.  **Visual Check**: Build the app (`npm run build` or `next dev`) and verify:
    *   Primary buttons appear with the correct theme color.
    *   Destructive buttons appear with the correct error color.
    *   Outline/Ghost buttons interact correctly with hover states.
2.  **Theme Toggle**: If a dark mode toggle exists, verify buttons adapt correctly (since we are now using semantic tokens `dark: ...` in `globals.css`).

### Automated Tests
- Run `npm run lint` to ensure no regression.
