# Implementation Plan: Implement RWD Layout

**Branch**: `002-implement-rwd-layout` | **Date**: 2026-01-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/002-implement-rwd-layout/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement a fully responsive design (RWD) for the ACIM Reader application.
Key goals:

1.  **Mobile Support**: Single-column layout, mobile-optimized navigation (Hamburger menu), and touch-friendly controls.
2.  **Desktop Stability**: Ensure zero visual regression for desktop users (Pixel Perfect).
3.  **Dictionary UX**: Replace popups with bottom drawers on mobile; implement "Tap to Lookup".
4.  **Performance**: Optimize for mobile load times and scroll performance.

## Technical Context

**Language/Version**: JavaScript / React 18  
**Primary Dependencies**: `@mui/material` (v5.15), `@mui/icons-material`, `react-use`  
**Storage**: N/A  
**Testing**: Manual Verification (as per Constitution)  
**Target Platform**: Mobile Web (iOS Safari, Android Chrome) & Desktop Web  
**Project Type**: Single Web Application (React)  
**Performance Goals**: FCP < 2.5s (3G), 60fps scrolling  
**Constraints**: Mobile data usage, preserve Desktop layout strictly  
**Scale/Scope**: ~1000 lines of UI refactoring

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. Code Quality**: Modular `MobileNavDrawer` component separation.
- **II. UX Consistency**: Desktop layout explicitly preserved. Mobile UX follows modern standards (Bottom Sheet).
- **III. Performance**: Lazy loading for drawer components envisioned.
- **IV. Bilingual**: Full support in mobile menu.
- **V. Data**: No changes to `raw/` data.

## Project Structure

### Documentation (this feature)

```text
specs/002-implement-rwd-layout/
├── plan.md              # This file
├── research.md          # Technical approach
├── data-model.md        # Component design
└── tasks.md             # Execution tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── App.js           # Update: Theme breakpoints
│   ├── Reader.js        # Update: Layout logic, Tap-to-lookup, Mobile state
│   ├── Dictionary.js    # Update: Add mobile Drawer mode
│   └── MobileNavDrawer.js # New: Mobile navigation component
└── index.css            # Update: Global body styles if needed
```

**Structure Decision**: Refactoring existing React components within `src/app/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | N/A        | N/A                                  |
