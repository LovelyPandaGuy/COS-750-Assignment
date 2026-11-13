# Tasks

## 1. Red tests (test-writer)

- [x] 1.1 Write `tests/assessment/readiness-check.test.ts` from every `readiness-check` scenario, named after the FR or LO it serves (FR-ASM-06, FR-ASM-07, LO4, LO5, LO7). Cover:
  - bank coverage, the optional item, and the module checks unchanged
  - the readiness validator: clean, and a fixture bank without LO5
  - engine answers over seeds 0 to 99
  - the LO5 worst cases and tags
  - build needs a rotation, plain BST build recognised, search uses the built tree
  - session order, shared combined seed, unreadable input
  - returns in miss order as attempt 1, the "each returns only once and always ends" property test, the single-place scan for `READINESS_RETURNS`
  - skip on LO8 only

  Add `worst-search`, `build-avl` and `search-built` cases to `engineAnswer` in `tests/assessment/helpers.ts`, computed straight from the engine and `searchBounds`. Verify the tests fail only because the new modules and kinds do not exist.
- [x] 1.2 Write `tests/assessment/readiness-report.test.ts` from every `readiness-report` scenario (FR-RDY-01, FR-RDY-02). Cover:
  - the four item states and the latest run deciding
  - Ready with a return, a combined item holding LO4 back, nothing answered
  - the property test comparing verdicts with the rule applied directly
  - LO8 not blocking, and Revise elsewhere
  - confident errors per outcome, with unknown IDs ignored
  - links per outcome
  - unresolved, resolved, the empty-only-when-nothing-unresolved property test, the template over every label
  - drafted versus own questions, and the own question passing the learner-state validator

  Build attempts by hand with fixed times. Verify the tests fail only because the modules do not exist. Commit 1.1 and 1.2 as the red tests.

## 2. Kinds and bank

- [x] 2.1 (implementer) Add `combined?` to `BankItem`, the three kind names, and `src/assessment/kinds/readiness.ts` with `worst-search`, `build-avl` (with its concatenated trace and pinned fallback) and `search-built`, sharing the search builder from `trees.ts` (design decision 2). Add `READINESS_BUILD_KEYS` and `READINESS_RETURNS` to `src/modules/config.ts`. Verify the kind tests in 1.1 pass using fixture items, and that `tests/assessment/question-model.test.ts` and `question-bank.test.ts` still pass.
- [x] 2.2 (content-author, `src/content/` only) Write `src/content/questions/readiness.ts`: the 11 items of design decision 1, flagged `beyond ID`, and `lectureListText`. Add `modules` to `OUTCOMES` from the ID's objective list. No formula, sign, lean or case wording except through `ConventionsWording`, and no typed numbers. Verify `npm run typecheck` passes.
- [x] 2.3 (implementer) Add `validateReadinessBank` (design decision 3). Verify that it reports nothing for `READINESS`, catches the fixture bank without LO5, and that `validateBank(CHECKS)` is still clean. If an item fails, report it to the content-author; do not change the check.

## 3. Session (implementer)

- [x] 3.1 Add `src/assessment/readiness.ts`: `startReadiness`, `readinessStep`, `readinessInstance` and `itemSeed` (design decision 4). Verify every session, return and skip test passes, including the property test.

## 4. Report and lecture list (implementer)

- [x] 4.1 Add `readinessReport` to `src/assessment/report.ts` (design decision 5). Verify the item-state, verdict, LO8, confident-error and link tests pass, including the property test.
- [x] 4.2 Add `lectureList` and `OWN_LECTURE_QUESTION` (in `src/modules/config.ts`) (design decision 6). Verify the unresolved, resolved, property, template and own-question tests pass.

## 5. Integration and records

- [x] 5.1 Add rows D83 to D91 to `.claude/docs/decisions.md` for proposal items 1 to 9 (assumed, 13 Nov, add-readiness-c9). Update D14 to point at them. Update `next-steps.md` (row 23 built as logic, and the screens change still to come). Verify with `grep -c "add-readiness-c9" .claude/docs/decisions.md` (9 or more).
- [x] 5.2 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`. Verify all pass, no new `[OPEN]` marker is added, and nothing under `src/ui/`, `src/pages/` or `src/components/` changed (logic only).

## Workflow follow-up

- Reviewer (fresh context) checks the diff against both specs, D4, D8, D9, D13, D14, D19, D20 and D27. No a11y-checker run: this change has no UI.
- The user reads the flagged C9 wording, merges, and runs `/opsx:archive`.
- A later change (after change 20) renders the C9 question screen and the readiness summary, with print, save and copy (FR-RDY-03).
