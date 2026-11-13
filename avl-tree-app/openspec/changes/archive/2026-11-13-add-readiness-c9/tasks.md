# Tasks

> **Merge note.** Union of both branches' tasks; this branch's IDs are kept first and the incoming tasks follow, renumbered. Checked on either side stays checked. Incoming tasks marked "superseded" built the version not chosen on 13 Nov; their code is to be replaced by this branch's.

## 1. Red tests (test-writer)

- [x] 1.1 Write `tests/assessment/readiness-check.test.ts` from every `readiness-check` scenario (FR-ASM-06, FR-ASM-07, LO4, LO5, LO7): bank coverage, the optional item, module checks unchanged; the readiness validator; engine answers over seeds 0 to 99; LO5 worst cases and tags; build rotates, plain BST recognised, search uses the built tree; session order, shared combined seed, unreadable input; returns in miss order, the "returns once and always ends" property test, the single-place scan for `READINESS_RETURNS`; skip on LO8 only. Add `worst-search`, `build-avl` and `search-built` to `engineAnswer` in `tests/assessment/helpers.ts`.
- [x] 1.2 Write `tests/assessment/readiness-report.test.ts` from every `readiness-report` scenario (FR-RDY-01, FR-RDY-02): item states and the latest run deciding; Ready with a return, a combined item holding LO4 back, nothing answered; the verdict property test; LO8 not blocking; confident errors with unknown IDs ignored; links; unresolved and resolved misconceptions, the property test, the template over every label; drafted and own questions. Commit 1.1 and 1.2 as the red tests.
- [x] 1.3 (incoming, superseded) Write failing tests for the incoming kinds and `READINESS` over seeds 0 to 99 (validator clean with C9 at eleven); `outcomeStatus`, `confidentErrors`, `lectureList` and `summaryText` (no profile ID); own-question storage and session (older save, tampered, trim, blank, reload, reset); the C9 page (intro, ladder and cap, recycle once as new variants, skipped when all Ready, completion, summary link); the summary page (table against fixtures, links back, flags, lecture list, own question required for export, copy with status, save builds a text file, print stylesheet hides controls, wording scan, axe).

## 2. Kinds and bank

- [x] 2.1 (implementer) Add `combined?` to `BankItem`, the three kind names and `src/assessment/kinds/readiness.ts` (`worst-search`, `build-avl`, `search-built`, sharing the search builder from `trees.ts`). Add `READINESS_BUILD_KEYS` and `READINESS_RETURNS` to `src/modules/config.ts`.
- [x] 2.2 (content-author) Write `src/content/questions/readiness.ts`: the 11 items, flagged `beyond ID`, and `lectureListText`. Add `modules` to `OUTCOMES`.
- [x] 2.3 (implementer) Add `validateReadinessBank`; `validateBank(CHECKS)` stays clean.
- [x] 2.4 (incoming, superseded) Build `search-bound`, `avl-build-root` and `build-and-search`. Add `M-AVL-WORST-LINEAR` with a hint and a lecture template. Write `READINESS` and join it into `ALL_ITEMS`. Update the validator's C9 count and optional rule.

## 3. Session and state

- [x] 3.1 (implementer) Add `src/assessment/readiness.ts`: `startReadiness`, `readinessStep`, `readinessInstance` and `itemSeed`.
- [x] 3.2 (incoming, superseded) Add `ownQuestions` to the learner state, the parser, the storage writer and the inventory, plus the `own-question-added` action and `addOwnQuestion` on the session.

## 4. Report and lecture list

- [x] 4.1 (implementer) Add `readinessReport` to `src/assessment/report.ts`.
- [x] 4.2 (implementer) Add `lectureList` and `OWN_LECTURE_QUESTION`.
- [x] 4.3 (incoming, superseded) Build `assessment/readiness.ts`: `outcomeStatus`, `confidentErrors`, `lectureList` and `summaryText`.

## 5. Screens (incoming)

- [x] 5.1 (to move onto this branch's session) Build `ReadinessCheck` at `/module/C9/check`: the intro, the eleven `CheckItem` steps, the recycle step, C9 completion and the summary link.
- [x] 5.2 (to move onto this branch's report) Build the `Readiness` summary: the outcome table, flags, lecture list, own-question form, and print, save and copy with a print stylesheet. Wording goes in `content/readiness.ts`.

## 6. Integration, records and review

- [x] 6.1 Add decision rows for the proposal's assumptions, update D14 and `next-steps.md`, and run `npm test`, typecheck, lint, build and `openspec validate --all` with no new `[OPEN]` marker. Merge note: this branch added D83 to D91; incoming added rows "from D87". The ranges overlap in `decisions.md`, which is still in conflict.
- [ ] 6.2 (incoming) Reviewer and accessibility-checker passes. Your browser checks: keyboard only, greyscale, colour-vision emulation (D25), 360 px touch, and print to one A4 page. A read of the new wording (gate G3).
