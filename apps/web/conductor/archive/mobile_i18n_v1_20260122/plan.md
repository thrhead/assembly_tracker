# Plan: Mobile i18n Infrastructure

## Goal
Implement a robust multi-language system (TR/EN) for the React Native (Expo) application, consistent with the web application's localization.

## Phase 1: Setup
- [x] Task: Install `i18n-js` or `react-i18next` and `expo-localization`.
- [x] Task: Create `src/locales` directory with `tr.json` and `en.json`.
- [x] Task: Configure i18n initialization in `App.js`.

## Phase 2: Translation Extraction
- [x] Task: Move all hardcoded strings from `LoginScreen`, `ProfileScreen` to locale files.
- [x] Task: Translate `JobDetailScreen` and components.
- [x] Task: Localize validation messages and date formats.

## Phase 3: Language Selection
- [x] Task: Add a language switcher in the Profile/Settings screen.
- [x] Task: Persist user language preference using `AsyncStorage`.

## Phase 4: Verification
- [x] Task: Verify all screens update instantly on language change.
- [x] Task: Ensure consistency with web translation keys.