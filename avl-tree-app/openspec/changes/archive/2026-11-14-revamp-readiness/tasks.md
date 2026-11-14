# Tasks

Scope: `src/ui/readiness/**`, tests, and the wiring the user added (proposal questions 13 to 15). Proposal question 1 (confirm at the skim) also allows:
- `src/ui/contracts.ts`;
- the four stubs and `src/ui/stubs/index.ts`;
- the counts in `tests/ui/contracts.test.tsx`;
- one line in `src/gallery/Gallery.tsx`.

Fixture text only in the components and gallery ("Example …"), LO1 to LO7 with LO7 optional (proposal question 2).
- The wiring touches `src/ui/lesson/c1c9.tsx`, `src/pages/Readiness.tsx`, `src/state/` (two actions) and `src/content/readiness.ts` (content-author).
- No `src/live/` or `src/live_content/` change.

## 1. Red tests (test-writer)

- [x] 1.1 Write `tests/ui/readiness/summary.test.tsx` for the row, status, headline and listen-for scenarios:
  - seven rows with name, levels, status, note and Review link; LO7 optional;
  - two levels; the evaluate tag; no note;
  - Ready and Revise `data-status` and their two border styles;
  - the optional badge;
  - overall Ready with LO7 Revise; overall Revise; the title without a rank;
  - no score, percentage or rank words;
  - only given words;
  - the listen-for points;
  - axe.

  Name each test after FR-RDY-01, FR-MOT-04, ID 9.3 or D25.
- [x] 1.2 Write `tests/ui/readiness/questions-and-flags.test.tsx`:
  - flags with ID, text and link, calm, and nothing when there are none;
  - edit and save (focus back on Edit), cancel, remove only where allowed, the empty state;
  - the keyboard order through the summary;
  - axe with one question being edited.

  Name each test after FR-RDY-02, ID 9.2, D27 or NFR-02.
- [x] 1.3 Write `tests/ui/readiness/export.test.tsx`, then the cross-cutting tests.
  - **`export.test.tsx`:**
    - `buildExportText` holds every row, flag, question and point;
    - Copy with a stubbed clipboard announces "Example copied";
    - Save builds a `text/plain` Blob under the file name and announces it (stubbed `URL.createObjectURL`);
    - a rejecting clipboard and a throwing Blob each show the fallback text area and announce it;
    - Print calls `window.print`;
    - no `fetch` or `XMLHttpRequest`;
    - the print block's rules (hidden controls, `CanvasText` and `Canvas`, 12 pt or more).
  - **Cross-cutting:**
    - add the source scan (no `src/content/`, `src/state/`, `src/live/` or `src/live_content/` import under `src/ui/readiness/`);
    - set the contract counts to 29 and 16;
    - write `tests/visual/readiness.spec.ts`:
      - the gallery's readiness section at 390, 768 and 1366, light and dark;
      - no page scroll, targets of at least 44 px and text of at least 16 px;
      - cards at 390 (no visible header row), a table from 768;
      - greyscale;
      - print emulation with no visible controls and the status words visible;
      - screenshots.

- [x] 1.4 Wiring tests:
  - `tests/state/own-questions.test.ts` for the `learner-session` scenarios: edit, blank edit, remove, drafted questions untouched, saved;
  - update the report tests in `tests/ui/lesson-c1-c9.test.tsx` to the table with the same meaning, and add the `lesson-c9` delta scenarios: levels from ID 5.1, the title without a rank, export on `/readiness`, editing an own question, read-only suggested questions.

  Verify that `npm test` fails only in the new or changed cases and the counts, and that `npm run test:visual` fails only in the new file. Then ask the user before committing the red tests.

## 2. Build (implementer, `src/ui/readiness/` and the agreed files)

- [x] 2.1 Write `types.ts` and `exportText.ts` (design decisions 1 and 6). Build OutcomeStatusTable (with `levelTag` and the status cell), ConfidenceFlags and the headline (design decisions 2 to 5). Move the two names to BUILT in `src/ui/contracts.ts`, and delete their stubs and index lines. Verify that the summary tests, the flag tests, the contracts test and `npm run typecheck` pass.
- [x] 2.2 Build LectureQuestionsList and ExportActions (design decisions 7 and 8), and compose ReadinessSummary with the listen-for block. Move the two names to BUILT and delete their stubs. Verify that the question and export tests pass.
- [x] 2.3 Write `readiness.css`:
  - tokens only and D118 queries only;
  - the card layout below 768 px;
  - the status borders;
  - the print block (design decisions 3, 4 and 9).

  If stylelint rejects `CanvasText` or `Canvas`, stop and report (proposal question 8). Verify that `npm run lint` and the print-block test pass.
- [x] 2.4 Write `ReadinessGallery.tsx` and mount it with one line in `src/gallery/Gallery.tsx` (design decision 11). Run `npm run test:visual`, create the readiness baselines, and regenerate only the gallery baselines that grew. List them in `review.md`.

## 3. Wiring

- [x] 3.1 Content-author: write `src/content/readiness.ts` with `OBJECTIVE_LEVELS` from ID 5.1 and `readinessCopy` (design decision 15), flagged in a header comment. Implementer: add the two session actions and the context functions (design decision 14). Verify that the own-question tests pass.
- [x] 3.2 Implementer: rewrite `ReadinessReportView` as the mapper (design decisions 12 and 13). Add `showList` to `OwnQuestion` and pass false on `/readiness`. Delete `src/ui/readiness.css`. Verify that the `lesson-c9` tests, the routing tests and the axe-on-every-C9-screen tests pass. Then run `npm run test:visual`, and regenerate only baselines whose change is this wiring (list them).

## 4. Critique, then polish

- [x] 4.1 Critique (read-only): use the `frontend-design` skill to score every state of the readiness components, in all of these:
  - at 390, 768 and 1366 px;
  - in light and dark;
  - in greyscale and the three colour-vision simulations;
  - in print preview.

  Score against all ten lines of `.claude/docs/design/quality-bar.md`, screen spec 1o, the wired `/readiness` page and C9's report screen, and the design system's ReadinessSummary, MasteryBadge and OutcomeChip. Write the findings to `openspec/changes/revamp-readiness/review.md` under "Critique". Do not edit code.
- [x] 4.2 Polish (ui-polisher, CSS and layout markup in `src/ui/readiness/` only, no tokens, logic or tests): fix each finding inside the design system. Verify that `npm test`, `npm run lint` and `npm run test:visual` pass, and that every quality-bar line reads pass or records a human decision.

## 5. Review

- [ ] 5.1 Full check: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:visual` and `openspec validate revamp-readiness --strict` all pass. Then the `reviewer` (fresh context, against the spec, D27, D113 and the quality bar) and the `a11y-checker` report pass, or their findings are resolved. The a11y-checker also runs:
  - the keyboard-only walk, including edit and export;
  - a screen-reader listen to one stacked card (design risk 1) and to the Copy announcement;
  - greyscale and the colour-vision checks;
  - 44 px targets and 16 px text;
  - a real print preview, in light and dark themes.

  Record the results in `review.md`.

## Workflow follow-up

- After the human skim:
  - record D138 to D144 in `.claude/docs/decisions.md`;
  - mark D4's and D8's LO8/LO9 wording as superseded by ID 5.1 and D113 (LO1 to LO7, LO7 optional);
  - resolve the FR-ASM [OPEN] from the SE document.
- **Design:** LO6 (Evaluate) shows a plain tag until the design gives OutcomeChip an evaluate style.
- **Logic change:** the change note per objective against the student's own earlier C9 attempt (needs a run history, D88's note).
- A human merges and runs `/opsx:archive`. Agents do not.
