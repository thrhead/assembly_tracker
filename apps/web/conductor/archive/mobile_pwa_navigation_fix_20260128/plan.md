# Plan: Mobile PWA Navigation & Back Button Fix

## Problem
In the PWA version of the mobile app, refreshing a page causes two main issues:
1. **Loss of Navigation History**: React Navigation's stack is reset, making `canGoBack()` false and hiding the back button.
2. **Hidden Header during Loading**: Screens showed a full-screen loader that hid the header/back button until data was fetched.

## Goal
Ensure the back button is always visible and functional, even after a hard refresh on web.

## Phase 1: Global Smart Back Button
- Update `App.js` to implement a custom `headerLeft` in `screenOptions`.
- Add logic to fallback to the user's dashboard if no history exists.

## Phase 2: Screen-level Refactoring
- Modify `JobDetailScreen.js` and `ChatScreen.js` to render the header outside the loading state.
- Update internal back buttons to use the smart fallback logic.

## Phase 3: UI Cleanup
- Disable default headers on screens that provide their own custom header to avoid duplication.
