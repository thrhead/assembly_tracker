# Mobile UI Spacing Standardization

## Goal
Standardize spacing values (margins, paddings, gaps) across the mobile app by extending the `SPACING` tokens in `theme.js` and applying them to key components. This replaces usage of "magic numbers" like `12`, `20` with semantic tokens.

## User Review Required
> [!NOTE]
> We will extend the `SPACING` object in `apps/mobile/src/constants/theme.js` to include missing common values: `xs` (4px), `sm` (12px), and `ml` (20px).

## Proposed Changes

### Core Theme Definitions

#### [MODIFY] [theme.js](file:///c:/Users/tahir/Documents/assembly_tracker/apps/mobile/src/constants/theme.js)
- Update `SPACING` object:
    - Add `xs: 4`
    - Add `sm: 12`
    - Add `ml: 20` (Medium-Large, between 16 and 24)

### Component Refactor

#### [MODIFY] [JobCard.js](file:///c:/Users/tahir/Documents/assembly_tracker/apps/mobile/src/components/JobCard.js)
- Replace hardcoded numbers with `SPACING` tokens:
    - `padding: 20` -> `padding: SPACING.ml`
    - `marginRight: 16` -> `marginRight: SPACING.m`
    - `marginBottom: 16` -> `marginBottom: SPACING.m`
    - `gap: 12` -> `gap: SPACING.sm`
    - `gap: 8` -> `gap: SPACING.s`
    - `paddingHorizontal: 10` -> Keep as is or use `SPACING.sm` (12) for consistency (Standardize to 12).
    - `paddingVertical: 4` -> `paddingVertical: SPACING.xs`

## Verification Plan

### Manual Verification
1.  **Visual Check**:
    *   **Job Card Layout**: Verify that the spacing inside the job card looks correct and consistent with the previous design (no visual regressions).
    *   **Spacing Consistency**: The gaps between elements (icon and text) should feel uniform.

### Automated Tests
- `npm run lint`: Ensure no variable scope errors (e.g., `SPACING` not imported).
