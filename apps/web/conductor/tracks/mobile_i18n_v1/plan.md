# Plan: Mobile i18n Infrastructure

## Goal
Implement a robust multi-language system (TR/EN) for the React Native (Expo) application, consistent with the web application's localization.

## Phase 1: Setup
- [ ] Task: Install `i18n-js` or `react-i18next` and `expo-localization`.
- [ ] Task: Create `src/locales` directory with `tr.json` and `en.json`.
- [ ] Task: Configure i18n initialization in `App.js`.

## Phase 2: Translation Extraction
- [ ] Task: Move all hardcoded strings from `LoginScreen`, `ProfileScreen` to locale files.
- [ ] Task: Translate `JobDetailScreen` and components.
- [ ] Task: Localize validation messages and date formats.

## Phase 3: Language Selection
- [ ] Task: Add a language switcher in the Profile/Settings screen.
- [ ] Task: Persist user language preference using `AsyncStorage`.

## Phase 4: Verification
- [ ] Task: Verify all screens update instantly on language change.
- [ ] Task: Ensure consistency with web translation keys.
