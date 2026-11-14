# Tasks

Scope:
- **Harness and checks:** `tests/visual/matrix/**`, `tests/visual/matrix.spec.ts`, `tests/ui/quality/**`, a `test:matrix` script in `package.json`.
- **Audit output:** `openspec/changes/ui-quality-sweep/findings.md`.
- **Fixes:** CSS and layout markup under `src/ui/`, only for accepted findings.

No behaviour, logic, content, wording or token changes. Items needing a new token, component or design change go to the design as `[OPEN]`.

## 1. Gate, matrix harness and failing checks (test-writer)

- [x] 1.1 **Gate (human).** Done on `chore/ui-sweep` (39418d1) rather than on main, by the user's choice (14 Nov): the seven changes and `add-lesson-outline` were archived there, and the build was fixed there. The three checks below pass.
  - Archive `add-ui-foundation`, `revamp-tree-view`, `revamp-sandbox-layout`, `revamp-question-and-feedback`, `revamp-progress-and-hub`, `revamp-readiness` and `add-narration`, one at a time on main.
  - Build and merge `add-lesson-outline` as its own change. It must first settle its 960 px query against D118.

  Verify:
  - `openspec list` shows only `ui-quality-sweep` in flight;
  - `openspec/specs/ui-foundation`, `ui-question`, `ui-feedback`, `ui-progress` and `ui-readiness` exist;
  - `openspec validate ui-quality-sweep --strict` passes.

  No other task starts before this one.
- [x] 1.2 Write the manifest `tests/visual/matrix/states.ts`, the seeding helpers and the step actions (design decision 1). Cover every route, the first screen of each of the 21 screen types with their states, the outline panel, and the gallery component states listed in each capability delta. Write the unit test that checks coverage against `src/routes.ts`, the lesson JSON and the screen frames (ui-foundation "State matrix", "Quality bar 1"). Verify that the coverage test passes.
- [x] 1.3 Write `tests/visual/matrix.spec.ts` with the in-page checks (design decision 2) and add the `test:matrix` script. The checks are: no sideways scroll, targets and text size, axe, titles and landmarks, and the live-region recorder. Verify that the spec runs on all entries and writes its JSON results. It is expected to fail, and the failures are the audit input.
- [x] 1.4 Write the mode tests over the same manifest (design decisions 3 to 5): greyscale and the three simulations, forced colours, print, larger text at 200%, landscape phone, reduced motion on and off, the keyboard walk, and focus traps, return and scroll after a change. Verify that each runs and records results.
- [x] 1.5 Write the source scans in `tests/ui/quality/` (design decision 6): hover-only CSS, harsh words (reported only for `src/live_content/`), red tokens in answer states, and `terms.ts` with the term check. Mark this content flagged for the user. Verify that `npm test` runs them; failures are expected.

  Then ask the user before committing the harness and the first baselines, stating their size (proposal question 6).

## 2. Audit run (read-only; no source edits)

- [x] 2.1 Run `npm run test:matrix` and the mode tests at the three widths, light and dark. Then run `npm test` and `npm run lint` (stylelint and the contrast test). Collect every failure into a scratch list with its entry, width, theme and mode. Verify that the list exists and every failing check has a row.
- [x] 2.2 Critique (read-only) with the `frontend-design` skill: every frame's matrix screenshots against its screen spec and `quality-bar.md`. Look specifically for:
  - empty, loading and error states (storage unavailable; the SQLite fallback is recorded as "not built");
  - dark-theme parity;
  - inconsistent terms, spacing or button hierarchy between screens;
  - the outline panel at each width, including any overlap with the tree;
  - whitespace pushing Next, the Hint button or the tree below the fold at 1366×768 and on a phone;
  - hover-only affordances on touch.

  Verify that each item has a row or a "checked, none" line.
- [ ] 2.3 The `reviewer` and `a11y-checker` agents (fresh context; the human adds their files first, proposal question 5) review the matrix and the app, and add rows with their source. The a11y-checker also covers:
  - a manual pass in Safari and Firefox;
  - a VoiceOver or NVDA listen on one lesson, the hub and `/readiness`;
  - the Windows high-contrast mode.

  Verify that both report into `findings.md`.

## 3. Findings

- [ ] 3.1 Write `openspec/changes/ui-quality-sweep/findings.md` (design decision 7):
  - one row per finding, with ID, screen, state, width, theme or mode, severity, bar line, proposed fix, new token (yes = `[OPEN]`), lane and source;
  - duplicates merged.

  Rows that need a new token, component or design change are `[OPEN]` and listed for `INDEX.md` "What must change". Verify that every scratch-list item maps to a row and `openspec validate --strict` passes.

## 4. Triage stop (human)

- [ ] 4.1 **STOP.** A developer reviews `findings.md` and marks each row accept, defer or reject in its Decision column. Agents do not start group 5 until every row has a decision. For each accepted row, the agent then adds a fix task under its lane's group (5 to 7) naming the row ID. Each deferred row's check is marked `test.fixme('F-nnn')`. Verify that no row has an empty Decision, and that each accepted row appears in exactly one fix task.

## 5. Fixes: shared and base (ui-polisher; CSS and layout markup only)

- [ ] 5.1 Fix the accepted shared rows: `src/ui/base`, the shell (TopBar, Aa menu, skip link), the lesson player frame and outline panel, and `screens.css`. Each commit cites its finding IDs. Verify that their checks pass in `npm run test:matrix`, and that `npm test`, `npm run lint` and `npm run test:visual` pass. Merge before groups 6 and 7 branch.

## 6. Fixes: lane A, tree (ui-polisher)

- [ ] 6.1 Fix the accepted lane A rows in `src/ui/tree/**`, `editor`, `controls`, `replay` and `sandbox`, on their own branch from the merged shared fixes. Each commit cites its finding IDs. Verify as in 5.1.

## 7. Fixes: lane B, learning (ui-polisher)

- [ ] 7.1 Fix the accepted lane B rows in `src/ui/learn/**`, `lesson/questions`, `progress`, `readiness` and `narration`, on their own branch from the merged shared fixes, in parallel with group 6. Each commit cites its finding IDs. Verify as in 5.1.

## 8. Hand-off of `[OPEN]` items

- [ ] 8.1 List every `[OPEN]` row (a new token, component, design or wording change) in `.claude/docs/design/INDEX.md` "What must change" and in the "For a human" section of `findings.md`, each with its finding ID and owner (design or content-author). Do not fix them here. Verify that every `[OPEN]` row is listed once.

## 9. Close

- [ ] 9.1 Re-run the full matrix and the modes after groups 5 to 7 are merged. Regenerate only baselines whose diff is explained by an accepted finding, listing each with its ID. Verify that `npm run test:matrix`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run test:visual` pass, with deferred rows as `fixme`.
- [ ] 9.2 Append the score table to `findings.md`: one row per frame (1a to 1p) and per route without a frame, and one column per quality-bar line. Each cell reads pass, deferred (F-nnn) or `[OPEN]`. Then run the fresh-context `reviewer` and `a11y-checker` on the result. Verify that the table has no empty cell, and `openspec validate ui-quality-sweep --strict` passes.

  Ask the user before committing the updated baselines.

## Workflow follow-up

- After the human skim: record D149 to D153 in `.claude/docs/decisions.md`. Add `quality-bar.md` notes for the new checks: forced colours, 200% text, landscape, and the live-region and focus checks.
- Deferred findings become their own changes, by lane.
- A human merges and runs `/opsx:archive`. Agents do not.
