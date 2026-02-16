# Web UI Global Color Tokenization

## Goal
Expand the design system in `globals.css` to include missing standard semantic states: **Warning**, **Info**, and **Success**. Refactor components (like `Badge`) to use these new tokens instead of hardcoded hex/tailwind colors.

## User Review Required
> [!IMPORTANT]
> This creates new global variables. The colors chosen will match the existing "Soft Pastel" OKLCH theme.

## Proposed Changes

### Global Styles

#### [MODIFY] [globals.css](file:///c:/Users/tahir/Documents/assembly_tracker/apps/web/app/globals.css)
Add the following new tokens to `@theme inline` and `:root`:
- `--warning`: `oklch(0.85 0.15 80)` (Soft Orange/Amber)
- `--warning-foreground`: `oklch(0.25 0.05 80)`
- `--success`: `oklch(0.80 0.15 150)` (Soft Green)
- `--success-foreground`: `oklch(0.25 0.05 150)`
- `--info`: `oklch(0.75 0.15 240)` (Soft Blue)
- `--info-foreground`: `oklch(0.25 0.05 240)`

And their dark mode equivalents in `.dark`.

### Web UI Components

#### [MODIFY] [badge.tsx](file:///c:/Users/tahir/Documents/assembly_tracker/apps/web/components/ui/badge.tsx)
- Replace `bg-yellow-500` with `bg-warning`
- Update `warning` variant to use `text-warning-foreground`
- Add new variants if needed (`success`, `info`) for future use.

## Verification Plan

### Manual Verification
1.  **Visual Check**: Verify `Badge` components with `variant="warning"` appear correctly.
2.  **Theme Check**: Toggle dark mode and verify warning colors adapt to the darker palette.

### Automated Tests
- Run `npm run lint`.
