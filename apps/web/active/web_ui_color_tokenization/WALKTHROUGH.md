# Walkthrough - Web UI Global Color Tokenization

## Changes
### Updated [globals.css](file:///c:/Users/tahir/Documents/assembly_tracker/apps/web/app/globals.css)
- Added new semantic color tokens for both Light and Dark modes:
    - **Warning**: Soft Orange (`oklch(0.85 0.15 80)`)
    - **Success**: Soft Green (`oklch(0.80 0.15 150)`)
    - **Info**: Soft Blue (`oklch(0.75 0.15 240)`)

### Updated [badge.tsx](file:///c:/Users/tahir/Documents/assembly_tracker/apps/web/components/ui/badge.tsx)
- Replaced hardcoded `bg-yellow-500` with `bg-warning`
- Added new `success` and `info` variants to the Badge component.

## Verification Results

### Automated Tests
- `npm run lint`: **Passed** (0 errors)

### Visual Changes (Expected)
- **Warning Badges**: Will now match the global pastel theme (`bg-warning`) instead of a harsh default yellow.
- **Success/Info Badges**: New variants are now available for use in the UI.
