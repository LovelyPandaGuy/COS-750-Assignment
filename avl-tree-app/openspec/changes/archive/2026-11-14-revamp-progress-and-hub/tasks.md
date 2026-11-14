# Tasks

Scope: `src/ui/progress/**` and tests. Proposal question 1 (confirm at the skim) also allows:
- `src/ui/contracts.ts`;
- the six stubs and `src/ui/stubs/index.ts`;
- the counts in `tests/ui/contracts.test.tsx`;
- one line in `src/gallery/Gallery.tsx`.

Fixture text only ("Example …", the D3 intro, "Example lesson 4 of 9"). No `src/content/`, `src/pages/` or `src/components/` changes.

## 1. Red tests (test-writer)

- [x] 1.1 Write `tests/ui/progress/start.test.tsx` for the Start and reset scenarios:
  - first visit and returning (ResumeCard absent or present, one primary button);
  - privacy text visible;
  - no credential fields;
  - the reset dialog's confirm, Cancel, Escape, focus return and description;
  - the `startCopy` content check;
  - axe in both states and with the dialog open.

  Name each test after FR-ONB-01 to 04 or NFR-05.
- [x] 1.2 Write `tests/ui/progress/hub.test.tsx` for the state, done, locked and hub scenarios:
  - word and symbol per state and the four `data-state` border styles;
  - optional C7;
  - either navigation rule;
  - done with no `--mastery-` token, and the separate badge;
  - locked reason as description, no navigation, calm markup;
  - UnitCard contents and one primary button;
  - ActivityList order with no reorder control;
  - the SandboxCard at each current lesson C1 to C9 and all done, and its suggestion line;
  - the LectureQuestionsCard with 2 and 0;
  - no scores;
  - axe.

  Name each test after FR-LRN-03, FR-LRN-04, FR-LRN-05, FR-MOT-04, FR-VIS-08 or D25.
- [x] 1.3 Cross-cutting tests:
  - write `tests/ui/progress/navigation.test.tsx`: LessonProgress text, bar share and ends; LessonMenu open and close by keyboard, every item reachable, opening a lesson, axe open;
  - add the source scan (no `src/content/`, `src/state/` or `src/live/` import under `src/ui/progress/`);
  - set the counts in `tests/ui/contracts.test.tsx` to 25 built and 20 stubbed;
  - write `tests/visual/progress.spec.ts` covering:
    - the gallery's progress section at 390, 768 and 1366, light and dark;
    - no page scroll, targets of at least 44 px and text of at least 16 px;
    - the map's direction per width;
    - the phone menu placement;
    - greyscale;
    - screenshots.

  Verify that `npm test` fails only in the new cases and the counts, and that `npm run test:visual` fails only in the new file. Then ask the user before committing the red tests.

## 2. Build (implementer, `src/ui/progress/` and the agreed files)

- [x] 2.1 Write `types.ts` (`LessonState`, the item union with `reason` required when locked, `PhaseState`; design decision 1). Then:
  - build StartPanel, ResumeCard, PrivacyNotice, ResetProgressLink (reusing `src/components/ConfirmDialog`) and StartView (design decisions 7 and 8);
  - in `src/ui/contracts.ts`, move the four Start names to BUILT with `ComponentProps` re-exports, and repoint ResumeCard;
  - delete their stubs and index lines.

  Verify that the Start tests, the contracts test and `npm run typecheck` pass.
- [x] 2.2 Build ProgressMap, UnitCard, ActivityList, SandboxCard, LectureQuestionsCard and HubView (design decisions 2 to 4 and 8). Move UnitCard, SandboxCard and LectureQuestionsCard to BUILT, repoint ProgressMap and ActivityList, and delete their stubs. PathModeToggle stays a stub. Verify that the hub tests pass.
- [x] 2.3 Build LessonProgress and LessonMenu (design decisions 5 and 6). Verify that the navigation tests pass.
- [x] 2.4 Write `progress.css` (tokens only, D118 queries only, the per-state borders of design decision 4) and `ProgressGallery.tsx`, and mount the gallery with one line in `src/gallery/Gallery.tsx`. Verify that `npm run lint` passes. Run `npm run test:visual`, create the progress baselines, and regenerate only the gallery baselines that grew. List them in `review.md`.

## 3. Critique, then polish

- [x] 3.1 Critique (read-only): use the `frontend-design` skill to score every state of the progress components, in all of these:
  - at 390, 768 and 1366 px;
  - in light and dark;
  - in greyscale and the three colour-vision simulations.

  Score against all ten lines of `.claude/docs/design/quality-bar.md`, screen specs 1a, 1b and 1e, and the design system's ProgressMap, UnitCard and MasteryBadge. Write the findings to `openspec/changes/revamp-progress-and-hub/review.md` under "Critique". Do not edit code.
- [x] 3.2 Polish (ui-polisher, CSS and layout markup in `src/ui/progress/` only, no tokens, logic or tests): fix each finding inside the design system. Verify that `npm test`, `npm run lint` and `npm run test:visual` pass, and that every quality-bar line reads pass or records a human decision.

## 4. Review

- [ ] 4.1 Full check: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:visual` and `openspec validate revamp-progress-and-hub --strict` all pass. Then the `reviewer` (fresh context, against the spec, D3, D11, D27 and the quality bar) and the `a11y-checker` report pass, or their findings are resolved. The a11y-checker also runs:
  - the keyboard-only walk of the menu and the reset dialog;
  - a screen-reader listen to a locked item's reason (design risk 3);
  - greyscale and the colour-vision checks;
  - 44 px targets and 16 px text.

  Record the results in `review.md`.

## Workflow follow-up

- After the human skim:
  - record D132 to D137 in `.claude/docs/decisions.md`;
  - mark D20's "nothing hard-locked" and "Choose my own" as superseded by ID 8.2 (D133);
  - resolve the progress-bar FR ID [OPEN] from the SE document.
- **Policy change (logic lane):** the unlock rule in the policy function (ID 8.2; C7 blocks nothing, D134). It modifies `module-hub` ("Nothing is locked", the Up next and Later words) and `start-screen`.
- **Wiring change:**
  - `src/pages/Start.tsx` and `Hub.tsx` onto StartView and HubView, with real words from `src/content/`;
  - LessonProgress and LessonMenu in every screen's TopBar;
  - delete the old `src/components/` ProgressMap, ResumeCard and ActivityList.
- A human merges and runs `/opsx:archive`. Agents do not.
