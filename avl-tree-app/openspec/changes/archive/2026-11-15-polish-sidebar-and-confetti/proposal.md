# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Please read these before `/opsx:apply`.

1. **Settled (user, 15 Nov): no maroon edge on the viewed lesson (D172).** The magenta-red left edge that D165 added to the lesson being viewed in the Lessons sidebar is removed. The viewed lesson keeps its existing signals: the thick violet border, the tint and the bold underlined title (D164). The magenta accent stays on the sandbox section rules and the lesson's title panel, so D165's "always with a non-colour cue" is unchanged.
2. **Settled (user, 15 Nov): livelier confetti from a React library, as "side cannons" (D173).** When a lesson is completed, two confetti cannons fire from the bottom-left and bottom-right corners towards the middle for `rewards.json` `confetti.durationMs` (1500 ms), then the pieces drift down. The effect comes from `react-canvas-confetti` 2.0.7 (MIT), a React wrapper around `canvas-confetti` 1.9 (ISC). It replaces the 40 CSS pieces of D169.
3. **Assumed, not blocking: the rules of D169 stay.**
   - There is no confetti with the Confetti setting off, under reduced motion (the library's own `disableForReducedMotion` as well as our check), or for lessons completed before.
   - The canvas is `aria-hidden`, takes no pointer input and is fixed over the page.
   - The colours are the palette and the tree colours, read from the tokens at fire time, so dark mode matches.
   - The canvas is removed once the pieces have fallen, at most 4 s after completion.
   - The ID asks for "a short burst" (ID 10.4), and the firing lasts the content's 1.5 s.
4. **New dependency (flagged):** `react-canvas-confetti` (and through it `canvas-confetti` and its types), installed from npm at build time and bundled, so the app still makes no network calls after the first load (NFR-05). It adds about 8 kB gzipped.

Serves ID 10.4 (confetti on completion, can be turned off), FR-MOT-01, NFR-02 and quality bar 9 (reduced motion), NFR-05; D164, D165, D169.

## Why

The user did not like the maroon-red edge on the highlighted lesson in the sidebar, and found the current confetti (small CSS pieces falling from the top) not exciting.

## What Changes

- **Sidebar (changed):** the magenta left edge on the viewed lesson is removed.
- **Confetti (changed):** side cannons from `react-canvas-confetti`, replacing the CSS pieces. The same triggers and guards apply.
- **Dependency (new):** `react-canvas-confetti`.

## Out of scope

- The lesson's title panel, and the other magenta uses.
- Sounds, or confetti anywhere else (ID 10.4: "the only decorative effect").

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `lesson-celebration`: "Confetti when a lesson is completed" (side cannons from the library, the canvas, the removal time).

## Impact

- Changed:
  - `src/ui/navigation/sidebar.css` (the edge rule removed);
  - `src/ui/lesson/Confetti.tsx` (the library; `Celebration` keeps its triggers);
  - `confetti.css` (reduced to the canvas container);
  - `package.json` and the lockfile.
- Tests: the celebration tests (the canvas and the fire call, with the library mocked in jsdom, which has no canvas), and the accent scan's minimum, which goes from three uses to two.
- Decisions: D172 and D173. D165's list of accent uses and D169's look are amended.
