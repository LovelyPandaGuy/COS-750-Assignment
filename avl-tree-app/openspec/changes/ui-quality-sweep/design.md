# Design: ui-quality-sweep

## Context

See `proposal.md` for why, and for the gate (question 1). What exists:

- **Visual tests.** `playwright.config.ts` has three projects (phone 390×844, tablet 768×1024, desktop 1366×768) and a 0.1% tolerance. Baselines are macOS-named, and the specs cover only `gallery.html` sections (foundation, learn, progress, readiness, narration, tree-view).
- **Unit checks.** axe runs in about 36 test files, per component or screen. `tests/tokens.contrast.test.ts` checks token contrast. Stylelint enforces tokens and the D118 queries.
- **The app.** It uses HashRouter, so routes look like `/#/path`. The learner state is in `localStorage['avl-primer:learner']` and the settings in `avl-primer:settings`. Page titles are set by `useScreen` (`document.title`). The shell has a skip link, the TopBar and the Aa menu.
- **The tokens.** Every colour token has a dark value. Only `--focus-ring-width` and `--focus-ring-gap` lack one, and they aren't colours. There are no `forced-colors` rules anywhere in `src/`.

## Goals / Non-Goals

**Goals:**
- One harness that renders each state once and runs every check on it, so a finding has one reproducible address (entry, width, theme, mode).
- Checks that stay in CI after the change, so the bar holds.

**Non-Goals:**
- Fixing anything before triage.
- Testing browsers other than Chromium in CI. The real-browser pass (Safari, Firefox) is part of the a11y-checker's manual run (NFR-04).

## Decisions

1. **The manifest (`tests/visual/matrix/states.ts`).** It has the type `Entry = { id, frame?, route, seed: LearnerSeed, settings?, steps?: Action[], component?: string, states?: string[] }`.
   - `seed` builds a learner state with the existing `progressState`-style helpers, ported to the visual folder because Playwright can't import Vitest fixtures with JSX.
   - `steps` are scripted actions after load, such as "Next ×3", "choose option a", "Sure" or "Check answer". They put a screen into a state without new app code.
   - Gallery component states are entries with `route: '/gallery.html#<section>'` and a selector.
   - A unit test checks coverage against `patterns` and the lesson JSON screen types (ui-foundation "Every route and screen type is listed").
   - *Alternative:* a test-only route that renders any state. Rejected: it would need app code, and the brief allows no behaviour change.
2. **One spec, one loop (`tests/visual/matrix.spec.ts`).** For each entry, and for light and dark, it:
   - seeds storage with `addInitScript` and opens the route;
   - runs the steps and waits for fonts and animations to settle;
   - takes the screenshot (`matrix/<id>-<theme>`);
   - runs the in-page checks: no sideways scroll, targets and text sizes, axe through `@axe-core/playwright` if it's already a dependency, otherwise axe injected from `node_modules/axe-core`, plus titles and landmarks;
   - writes the check results to `test-results/matrix/<id>-<project>-<theme>.json`.

   The screenshot assertion fails on a diff. The check results fail the test where a requirement says SHALL. In the audit run (task 2) they are collected rather than stopping the run (`--reporter` plus soft assertions), so one run lists every finding.
3. **Special modes, as separate tests over the same manifest:**
   - **Greyscale and the three simulations:** Chromium CDP `Emulation.setEmulatedVisionDeficiency`, plus a CSS greyscale filter. They compare each entry's colour-differing pairs (from `data-state`, `data-status` and `data-verdict` attributes) by text and computed border, not by pixels.
   - **Forced colours:** `page.emulateMedia({ forcedColors: 'active' })`.
   - **Print:** `page.emulateMedia({ media: 'print' })` on `/readiness` and the certificate.
   - **Larger text and zoom:** the Aa larger setting seeded, at a 195 px viewport (390 at 200%).
   - **Landscape phone:** a 844×390 viewport.
   - **Reduced motion:** `emulateMedia({ reducedMotion: 'reduce' })`, then reading every element's computed durations after triggering the entry's step.
4. **The keyboard walk.** It presses Tab until focus returns to the start (maximum 200 presses) and records each focused element's role, name, box and outline width. It fails on focus on an invisible element, a missing outline, or a reading-order inversion (an element whose box is above the previous one by more than one row and isn't in a later landmark). For dialogs and menus it opens them, tabs and checks that focus stays inside, then presses Escape and checks focus is back on the opener.
5. **The live-region recorder.** A `MutationObserver` on `[aria-live], [role=status], [role=alert]` is added by `addInitScript` and logs each text change with a timestamp. A finding is the same text twice in a row within 1 s, or a change with no user action.
6. **Source scans (Vitest, `tests/ui/quality/`):**
   - hover-only CSS (ui-foundation quality bar 8);
   - harsh words in visible text across `src/content/` and `src/live_content/`, reported only: the JSON is never edited (CLAUDE.md);
   - red or error tokens in answer-state rules;
   - the term list (`terms.ts`, one constant: concept → allowed word, synonyms).

   The term list is new test data, assumed: it starts from the words the design system uses. A clash goes to the content-author, never fixed by the polisher.
7. **`findings.md`.** One table, one row per finding, with the columns:

   | Column | Values |
   |---|---|
   | ID | `F-001` and so on |
   | Screen | frame and route |
   | State | the entry |
   | Width | 390, 768, 1366, landscape or 200% |
   | Theme | light or dark, plus mode: greyscale, CVD, forced or print |
   | Severity | blocker, major, minor or polish |
   | Bar | the line or requirement it breaks |
   | Proposed fix | |
   | New token? | yes or no; yes means `[OPEN]` |
   | Lane | shared, A or B |
   | Decision | empty until triage: accept, defer or reject |

   **Severity:**
   - **blocker:** it fails a WCAG AA criterion, loses content, or breaks a student's path;
   - **major:** it breaks a quality-bar line on a main screen;
   - **minor:** it breaks a line on a secondary state;
   - **polish:** it meets the bar but reads worse than the design.

   The source of each finding is noted: a check name, the critique, or the reviewer.
8. **The critique and the agents.** The `frontend-design` skill runs read-only over the matrix screenshots, one frame at a time, and adds rows. The `reviewer` and `a11y-checker` run with a fresh context once their agent files exist (proposal question 5), and add rows with their source.
9. **Fix grouping.** After triage, each accepted row's lane decides its group.
   - Shared fixes land first on `ui-sweep/shared`. Lanes A and B branch from that once it's merged.
   - Each fix task names its finding IDs, and each commit message cites them.
   - The polisher edits CSS and layout markup only. A row marked `New token? yes` never becomes a fix task.
10. **Close.** Re-run the matrix and the modes, regenerate only baselines whose diff is explained by an accepted finding, and list them. Then append the score table: one row per frame (1a to 1p) and per non-frame route, ten columns for the bar lines, each pass, deferred (finding ID) or `[OPEN]`.

## Risks / Trade-offs

- **The matrix runtime.** About 70 entries × 3 widths × 2 themes, plus the modes, is roughly 600 page loads. → `fullyParallel` is already on. The modes run at one width each where width doesn't matter: print at 1366, forced colours at 390 and 1366. The matrix is its own npm script (`test:matrix`), not part of `test:visual`.
- **Repo size from baselines.** → The proposal states the cost (question 6), and the user decides before the first commit. An alternative is to commit only the matrix's per-frame baselines, and keep per-state ones local.
- **Scripted steps break when wording changes.** → Steps find controls by their content-file label, imported from `src/content/`, not by literal text.
- **Simulated colour vision is Chromium-only.** → It is enough for the bar (the design system's "View as" uses the same matrices). Safari and Firefox are in the manual pass.
- **The audit finds more than two developers can fix.** → That's what triage is for. Deferred rows stay in `findings.md` and their checks are marked `test.fixme` with the finding ID, so the bar is still visible.
