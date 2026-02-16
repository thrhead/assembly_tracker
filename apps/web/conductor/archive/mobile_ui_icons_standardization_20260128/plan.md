# Mobile UI Icon Standardization

## Goal
Replace all usages of `@expo/vector-icons` (specifically `MaterialIcons`) with `lucide-react-native` in `apps/mobile/src` to ensure a consistent, modern visual language across the mobile application.

## User Review Required
> [!IMPORTANT]
> This is a widespread change affecting 49+ files. Some Material icons may not have exact 1:1 matches in Lucide, so we will use the closest semantic equivalents (e.g., `dashboard` -> `LayoutDashboard`).

## Proposed Changes

### Core Components Refactor
We will migrate components in batches to handle the scale.

#### [MODIFY] [JobCard.js](file:///c:/Users/tahir/Documents/assembly_tracker/apps/mobile/src/components/JobCard.js)
- Replace `MaterialIcons` with `lucide-react-native`
- Map:
    - `radio-button-checked` -> `CircleDot`
    - `schedule` -> `Clock`
    - `more-horiz` -> `MoreHorizontal`
    - `location-on` -> `MapPin`
    - `access-time` -> `Clock`

#### [MODIFY] [CustomDrawer.js](file:///c:/Users/tahir/Documents/assembly_tracker/apps/mobile/src/components/admin/CustomDrawer.js)
- Replace `MaterialIcons` with `lucide-react-native`
- Map sidebar icons to Lucide equivalents (`Home`, `Users`, `Briefcase`, `Settings`, `LogOut`, etc.)

#### [MODIFY] [AdminDashboardScreen.js](file:///c:/Users/tahir/Documents/assembly_tracker/apps/mobile/src/screens/admin/AdminDashboardScreen.js)
- Update stat cards and action buttons to use Lucide icons.

*(And recursively for other identified files in subsequent execution steps)*

## Verification Plan

### Manual Verification
1.  **Visual Check**: Launch the app (`npx expo start`) and navigate to:
    *   **Dashboard**: Verify stat cards and action buttons have icons.
    *   **Job List**: Verify `JobCard` icons (location, time, status).
    *   **Drawer**: Verify sidebar navigation icons.
2.  **Build Check**: Ensure no missing icon imports cause runtime errors (RedBox).

### Automated Tests
- Run `npm run lint` to check for unused imports (e.g., leftover `MaterialIcons`).
