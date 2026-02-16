# Walkthrough - Mobile PWA Navigation & Back Button Fix

## Changes

### App-wide Navigation [apps/mobile/App.js]
- **Persistent Header**: Added `headerLeft` to `screenOptions` to ensure a back button is always rendered on non-dashboard screens.
- **Smart Fallback**: Implemented logic that checks `navigation.canGoBack()`. If false (post-refresh), it navigates to the initial route based on the user's role.

### Component Refactors
- **JobDetailScreen.js**: Moved the Header and back button logic out of the `if (loading)` block.
- **ChatScreen.js**: Similarly decoupled the header from the loading state.
- **EditJobScreen.js**: Integrated `useAuth` to support smart role-based fallback on the back button.

## Verification
- Refreshing `/jobs/[id]` now shows the back button immediately.
- Clicking the back button after a refresh correctly redirects to the Dashboard instead of doing nothing.
- Loading indicators now appear *below* the header, maintaining UI context.
