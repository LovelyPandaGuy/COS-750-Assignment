# Design

## Context

See proposal.md for why.
- The sidebar's viewed lesson (`.progress-item[aria-current='page']` in `sidebar.css`) has a thick violet border and tint (D164), plus the magenta left edge from D165.
- `Celebration` (`src/ui/lesson/Confetti.tsx`) watches `completedModules`. On a new completion, with the setting on and no reduced motion, it renders 40 CSS pieces for `durationMs`.
- jsdom has no canvas.

## Goals / Non-Goals

**Goals:**
- Remove the edge with no other sidebar change.
- A livelier, library-drawn confetti with the same guards.

**Non-Goals:**
- Changing when confetti plays, or the title panel.

## Decisions

### 1. Remove the edge (D172)

The two `border-inline-start-*` lines go from the viewed-lesson rule. The accent scan test's minimum drops from three uses to two (the sandbox sections and the title panel). D165's row is amended.

### 2. Side cannons with react-canvas-confetti (D173)

`Confetti` renders `<ReactCanvasConfetti onInit={({ confetti }) => …} />` from `react-canvas-confetti`. It sits in a fixed full-viewport wrapper (`.confetti`, `aria-hidden`, `pointer-events: none`). On init it starts a `requestAnimationFrame` loop that, until `durationMs` has passed, fires two small bursts per frame:
- `{ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 0.9 } }`;
- `{ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 0.9 } }`.

Both use `colors` read from the computed tokens (`--action-primary`, `--accent-highlight` and the four `--node-*`) and `disableForReducedMotion: true`. `Celebration` keeps its triggers and guards, and removes the canvas after `durationMs + 2500 ms`, at most 4 s in all.

The package ships as CommonJS only. In the dev server its default import arrived as the module object, and the page went blank ("Element type is invalid"), so `Confetti.tsx` unwraps the default export. A small error boundary around the confetti makes any failure show nothing rather than blank the page. Both the dev server and the production build were checked in a real browser (15 Nov).

In tests, the library module is mocked to render a `<canvas>` and record the fire calls, because jsdom cannot draw.

*Alternative:* `react-confetti`, which rains pieces across the whole window. This was rejected because it has no cannon preset and it covers the lesson for longer.

### Decision rows

| ID | Topic | Decision |
| --- | --- | --- |
| D172 | Sidebar edge removed | The viewed lesson in the sidebar has no magenta left edge; it keeps the thick violet border, tint and bold underlined title (D164). Amends D165's accent uses. User request (15 Nov). |
| D173 | Side-cannon confetti | Lesson completion fires confetti from two side cannons (react-canvas-confetti 2.0.7 over canvas-confetti) for rewards.json durationMs, in the palette and tree colours, on an aria-hidden canvas that takes no pointer input and is gone within 4 s; same guards as D169. Replaces D169's CSS pieces. User choice (15 Nov). |

## Risks / Trade-offs

- [A new runtime dependency] → It is small, widely used and MIT/ISC licensed. It is bundled, with no network calls, and only `Confetti.tsx` imports it, so swapping it later touches one file.
- [The canvas draws over the page for up to 4 s] → It takes no pointer input and no focus, and it is hidden from assistive technology.

## Migration Plan

No data migration. Rollback is reverting the change and removing the dependency.
