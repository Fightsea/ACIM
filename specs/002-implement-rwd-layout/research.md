# Research & Technical Approach: Mobile RWD Implementation

**Feature**: `002-implement-rwd-layout`
**Date**: 2026-01-25

## 1. Layout Refactoring

### Current State

`Reader.js` uses a hardcoded fixed-width container:

```javascript
<Grid container rowSpacing={2} columnSpacing={1} sx={{ m: 1, width: 1024 }}>
```

### Approach

We will replace the hardcoded width with a responsive constraint using MUI's breakdown system.

**Decision**: Use `maxWidth: 'lg'` (1200px) or `1024px` specifically, with `width: '100%'` and `mx: 'auto'` (margin auto) for centering, but the spec says "Left-top alignment" for Desktop.

- **Desktop**: `width: 1024px`, `margin-left: 8px` (keep `m: 1` -> 8px).
- **Mobile**: `width: 100%`, `m: 0`, `p: 2` (padding for content).

**Code Pattern**:

```javascript
const isMobile = useMediaQuery(theme.breakpoints.down('md'));
// ...
<Grid container sx={{
    m: isMobile ? 0 : 1,
    width: isMobile ? '100%' : 1024,
    // ...
}}>
```

## 2. Navigation & Controls

### Approach

We will separate the control logic (Volume/Chapter/Section selectors) from the UI representation.

**Decision**:

1.  **Desktop**: Retain the existing inline `Autocomplete` components grid. Use `display: { xs: 'none', md: 'block' }` to hide them on mobile.
2.  **Mobile**: Introduce a `HamburgerMenu` component.
    - trigger: `<IconButton>` located at top-left or top-right.
    - content: A standard MUI `Drawer` containing the same `Autocomplete` components stacked vertically.
    - state: Pass the same state setters (`setVolume`, `setChapter`, etc.) to the Drawer.

## 3. Dictionary Interaction (Tap-to-Lookup)

### Challenge

The spec requires "Tap to Lookup" on mobile, replacing "Select to Lookup". Mobile browsers don't natively select words on single tap.

### Alternatives Considered

1.  **Wrap every word in `<span>`**: Performance suicide for long chapters.
2.  **Range API (`caretRangeFromPoint`)**: Standard way to get text node and offset from coordinates.

### Decision

Use **Range API** for mobile word detection.

- On `onClick` (Mobile):
  1.  Get click coordinates.
  2.  Use `document.caretRangeFromPoint(x, y)`.
  3.  Expand range to word boundaries.
  4.  Extract text.
  5.  Trigger `setSelectedWord`.
- On `onMouseUp` (Desktop): Maintain existing selection logic.

## 4. Dictionary UI

### Approach

Responsive container for definitions.

**Decision**:

- **Desktop**: `Popper` (Existing).
- **Mobile**: `SwipeableDrawer` (MUI) anchored at `bottom`.
  - Height: Auto or 50vh.
  - Content: Same `Dictionary` content, just wrapped differently.

## 5. Bilingual Support (Mobile)

### Logic

The spec requires integrating language settings into the Hamburger menu.

**Decision**:

- Add the "Translation", "Second Translation", "Third Translation" selectors into the `MobileNavDrawer`.

## 6. Typography

### Decision

Use MUI `ThemeProvider` overrides for breakpoints.

```javascript
typography: {
  body1: {
    fontSize: '1rem', // 16px default
    [theme.breakpoints.down('md')]: {
      fontSize: '16px', // Enforce 16px minimum
    },
  },
  h6: {
    // scale headings
  }
}
```
