# Mobile UI Color & Opacity Tokenization

## Goal
Centralize inconsistent and hardcoded color/opacity values (especially relevant to status badges and glass effects) into `apps/mobile/src/constants/theme.js`. This eliminates "magic strings" like `rgba(204, 255, 4, 0.1)` scattered in components.

## User Review Required
> [!NOTE]
> We will add semantic tokens for "Status Backgrounds" to ensure badges look consistent in both Light and Dark modes.

## Proposed Changes

### Core Theme Definitions

#### [MODIFY] [theme.js](file:///c:/Users/tahir/Documents/assembly_tracker/apps/mobile/src/constants/theme.js)
- Add `STATUS` object to `lightTheme` and `darkTheme`:
    - `successBg`: `rgba(...)` (for completed/approved)
    - `warningBg`: `rgba(...)` (for pending/in-progress)
    - `errorBg`: `rgba(...)` (for rejected/cancelled)
    - `infoBg`: `rgba(...)` (for draft/new)

### Component Refactor

#### [MODIFY] [JobCard.js](file:///c:/Users/tahir/Documents/assembly_tracker/apps/mobile/src/components/JobCard.js)
- Replace conditional RGBA logic with `theme.colors.status...`.

#### [MODIFY] [AdminDashboardScreen.js](file:///c:/Users/tahir/Documents/assembly_tracker/apps/mobile/src/screens/admin/AdminDashboardScreen.js)
- Replace Quick Action background RGBAs with `theme.colors.action...` or `theme.colors.status...`.

## Verification Plan

### Manual Verification
1.  **Visual Check**:
    *   **Job List**: Verify status badges (In Progress/Waiting) have the correct background color opacity.
    *   **Dashboard**: Verify "Quick Actions" icons have the correct colored backgrounds (Cyan/Pink/Teal).
2.  **Theme Toggle**: Switch between Light/Dark mode to ensure backgrounds remain visible and contrast-compliant (e.g., dark mode usually needs lower opacity).

### Automated Tests
- Run `npm run lint` to ensure no syntax errors.
