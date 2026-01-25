# Tasks: 實作響應式網頁設計 (RWD Layout)

**Feature Branch**: `002-implement-rwd-layout`  
**Status**: In Progress

## Phase 1: Setup & Configuration

_Goal: Initialize responsive theme settings and prepare new component structures._

- [x] T001 Define explicit breakpoints and responsive typography overrides in [src/app/App.js](src/app/App.js)
- [x] T002 Create skeleton for `MobileNavDrawer` component in [src/app/MobileNavDrawer.js](src/app/MobileNavDrawer.js)

## Phase 2: Foundational Components

_Goal: Prepare core components for responsive interactions._

- [x] T003 Refactor `Dictionary` component to accept `mobile` prop and Render `SwipeableDrawer` or `Popper` conditionally in [src/app/Dictionary.js](src/app/Dictionary.js)
- [x] T004 Implement full navigation and translation selectors in [src/app/MobileNavDrawer.js](src/app/MobileNavDrawer.js)
- [x] T005 [P] Add mobile state detection (`useMediaQuery`) and drawer state management to [src/app/Reader.js](src/app/Reader.js)

## Phase 3: Desktop Experience Consistency (User Story 1)

_Goal: Refactor layout to support RWD while strictly preserving Desktop pixels._

- [x] T006 [US1] Refactor main content Grid in [src/app/Reader.js](src/app/Reader.js) to use conditional `sx` for Desktop (1024px fixed) vs Mobile
- [x] T007 [US1] Wrap existing desktop navigation selectors in `Box` or `Grid` with `display: { xs: 'none', md: 'flex' }` in [src/app/Reader.js](src/app/Reader.js)
- [x] T008 [US1] Verify Desktop layout remains top-left aligned with 1024px width in [src/app/Reader.js](src/app/Reader.js)

## Phase 4: Mobile Reading Experience (User Story 2)

_Goal: Implement single-column layout and touch-friendly text interaction._

- [x] T009 [US2] Update Reader Grid container to use `width: '100%'` and `m: 0` on mobile breakpoints in [src/app/Reader.js](src/app/Reader.js)
- [x] T010 [US2] Implement `handleWordClick` using `document.caretRangeFromPoint` for Tap-to-Lookup in [src/app/Reader.js](src/app/Reader.js)
- [x] T011 [US2] Add `Typography` overrides (min 16px body text) for mobile in [src/app/App.js](src/app/App.js) or [src/app/Reader.js](src/app/Reader.js)
- [x] T012 [US2] Configure `overscroll-behavior` and touch scrolling styles in [src/index.css](src/index.css)

## Phase 5: Mobile Interaction & Navigation (User Story 3)

_Goal: Implement Hamburger menu and Bottom Sheet dictionary._

- [x] T013 [US3] Add Hamburger Icon button (visible only on mobile) to trigger `MobileNavDrawer` in [src/app/Reader.js](src/app/Reader.js)
- [x] T014 [US3] Integrate `MobileNavDrawer` component into [src/app/Reader.js](src/app/Reader.js) passing all necessary state props
- [x] T015 [US3] Update `Dictionary` usage in [src/app/Reader.js](src/app/Reader.js) to pass `mobile={isMobile}` prop
- [ ] T016 [US3] Add "Edit Note" button logic to `Dictionary` drawer content (mobile mode only) in [src/app/Dictionary.js](src/app/Dictionary.js)

## Phase 6: Polish & Performance

_Goal: Ensure smooth transitions and performance standards._

- [ ] T017 Verify tap target sizes (44px+) for all mobile interactive elements in [src/app/MobileNavDrawer.js](src/app/MobileNavDrawer.js)
- [ ] T018 Audit and optimize re-renders when toggling mobile drawer in [src/app/Reader.js](src/app/Reader.js)

## Dependencies

1. **Setup** (T001-T002) MUST be done first.
2. **Foundation** (T003-T005) blocks US3.
3. **US1** (T006-T008) and **US2** (T009-T012) can be done in parallel after Setup.
4. **US3** (T013-T016) depends on Foundation and US2 (for Reader integration).

## Parallel Execution Strategy

- **Developer A**: Focus on `Reader.js` layout refactoring (US1 & US2) -> Tasks T006, T007, T009, T010.
- **Developer B**: Focus on Component implementation (`MobileNavDrawer`, `Dictionary` update) -> Tasks T002, T003, T004, T016.

## Implementation Strategy

We will adopt a "Component-First" strategy:

1. Build the isolated mobile components (`MobileNavDrawer`) first.
2. Refactor the `Dictionary` component.
3. Finally, wire everything into `Reader.js` and apply layout changes. This minimizes the time `Reader.js` is in a broken state.
