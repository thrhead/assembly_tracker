# Walkthrough - Mobile UI Color & Opacity Tokenization

## Changes
### Updated [theme.js](file:///c:/Users/tahir/Documents/assembly_tracker/apps/mobile/src/constants/theme.js)
- Added new centralized opacity tokens for both Light and Dark themes to eliminate hardcoded RGBA values:
    - `primaryBg` (for Job Icons, Status Badges)
    - `warningBg` (for Pending Status)
    - `cyanBg`, `pinkBg`, `tealBg` (for Quick Actions)

### Refactored Components
#### [JobCard.js](file:///c:/Users/tahir/Documents/assembly_tracker/apps/mobile/src/components/JobCard.js)
- Replaced hardcoded `rgba(...)` logic with `theme.colors.primaryBg` and `theme.colors.warningBg`.

#### [AdminDashboardScreen.js](file:///c:/Users/tahir/Documents/assembly_tracker/apps/mobile/src/screens/admin/AdminDashboardScreen.js)
- Updated Quick Action cards and Job List icons to use the new tokens.

## Verification Results

### Automated Tests
- `npm run lint`: **Passed** (0 errors)

### Visual Changes (Expected)
- **Consistency**: The opacity of backgrounds (e.g., 10%) is now single-sourced in `theme.js`. Changing it there will update the entire app.
- **Dark Mode**: Tokens correctly switch between light/dark variations (e.g., Neon Green vs Electric Blue base) without complex inline ternary operators.
