# Component & Data Design: RWD Implementation

## New Components

### `MobileNavDrawer.js`

A drawer component handling navigation and settings on mobile.

**Props**:

- `open` (boolean): Drawer visibility state.
- `onClose` (function): Handler to close drawer.
- `volume`, `setVolume`
- `chapter`, `setChapter`
- `section`, `setSection`
- `paragraph`, `setParagraph`
- `translation`, `setTranslation`
- `secondTranslation`, `setSecondTranslation`
- `thirdTranslation`, `setThirdTranslation`
- `availableTranslations` (Array)
- `volumes`, `chapters`, `sections`, `paragraphs` (Data sources)

### `Dictionary.js` (Updates)

Refactored to support dual-mode display.

**Props (New/Changed)**:

- `mobile` (boolean): If true, renders `SwipeableDrawer`. If false, renders `Popper`.

## State Management (`Reader.js`)

**New State**:

- `mobileNavOpen` (boolean): Tracks visibility of the hamburger menu drawer.
- `isMobile` (boolean): Derived from `useMediaQuery(theme.breakpoints.down('md'))`.

**Interaction Logic**:

- `handleWordClick(event)`: New handler for mobile "Tap to Lookup".
  - Uses `document.caretRangeFromPoint` to identify word.
  - Sets `selectedWord`.

## Theme Configuration (`App.js`)

**Updates**:

- Add `breakpoints`: Define explicit values for `xs`, `sm`, `md` (768px), `lg` (1024px).
- Add `typography` overrides for responsive font sizes.
