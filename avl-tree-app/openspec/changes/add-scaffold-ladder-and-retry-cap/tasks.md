# Tasks

## 1. Red tests (test-writer)

- [x] 1.1 Write `tests/assessment/scaffold-ladder.test.ts` from every session, escalation, hints-used, hint-match, worked-example, guided, cap and lecture-draft scenario in `specs/scaffold-ladder`. Name each test after its FR (FR-SCA-02, FR-SCA-03, FR-ASM-07). Cover:
  - property tests (fast-check) for the never-shrinking prefix and for "no loop without an exit"
  - the bank over seeds 0 to 99 for the new-problem, sibling and guided scenarios
  - the single-place scan, extended to `SCAFFOLD_LADDER`

  Verify the tests fail only because `src/assessment/scaffold.ts` and `SCAFFOLD_LADDER` do not exist.
- [x] 1.2 Write `tests/assessment/scaffold-content.test.ts` from the coverage and hint-wording scenarios:
  - full coverage, and a missing hint caught by a fixture catalogue
  - clean hints over the bank, and an answer-stating fixture hint caught
  - the reversed-conventions render through `conventionsWording` overrides
  - calm wording

  Verify they fail only because `src/content/questions/scaffolds.ts` and the scaffold checks do not exist.
- [x] 1.3 Extend `tests/state/learner-storage.test.ts` (and the session test that covers `learnerReducer`) from the `learner-storage` delta: fresh state, model fields, round trip, older state without the field, each malformed entry, the session action and the inventory wording. Add `lectureQuestions` to the arbitrary-state generator. Verify the new cases fail and every existing case still passes. Commit 1.1 to 1.3 as the red tests.

## 2. Learner state (implementer)

- [ ] 2.1 Add `LectureQuestion`, `lectureQuestions` in `freshLearnerState` and `parseLearnerState` (a missing field reads as an empty list), the `lecture-question` session action, and the inventory wording (design decision 8). Verify task 1.3's tests and the whole `tests/state/` folder pass.

## 3. Ladder logic (implementer)

- [ ] 3.1 Add `SCAFFOLD_LADDER` to `src/modules/config.ts`. Add `startCheck`, `checkStep`, `currentInstance` and the lecture-question draft to `src/assessment/scaffold.ts` (design decisions 1 and 2), using a stub hint lookup until task 4.1 lands. Verify the session, escalation, hints-used, cap and draft tests pass, including both property tests.
- [ ] 3.2 Add `workedExample`, `guidedSteps` and `scaffolds` with the hint lookup of design decision 3 (decisions 3 to 5). Verify the hint-match, sibling and guided tests pass over seeds 0 to 99.

## 4. Scaffold content (content-author, `src/content/` only)

- [ ] 4.1 Write `src/content/questions/scaffolds.ts`: a hint for each of the 18 drafted misconceptions, the per-need hints built from `NEEDS` labels, a general hint for each of the 14 sub-skills, all `beyond ID` and flagged at the top of the file for the user to read at G3. Write `lectureQuestionText` (design decision 6). No formula, sign, lean or case wording except through `ConventionsWording`. No number except from the instance's facts. Verify `npm run typecheck` passes and the coverage test passes.

## 5. Validation (implementer)

- [ ] 5.1 Add the `scaffold` and `answer` problem kinds and the scaffold pass to `validateBank`, and extend `BankRecords` (design decision 7). Verify that every test in `tests/assessment/` passes, including the bank being clean with the real hints. If a hint fails, report it to the content-author; do not change the check.

## 6. Integration and records

- [ ] 6.1 Add rows D75 to D82 to `.claude/docs/decisions.md` for proposal items 1 to 8 (assumed, 13 Nov, add-scaffold-ladder-and-retry-cap). Update D42 and D74 to say the ladder logic exists and only the check UI (change 20) is still missing. Update `next-steps.md` row 21. Verify with `grep -c "add-scaffold-ladder-and-retry-cap" .claude/docs/decisions.md` (8 or more).
- [ ] 6.2 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`. Verify all pass, no new `[OPEN]` marker is added, and `git diff --stat` shows nothing under `src/ui/`, `src/pages/` or `src/components/` (logic only).

## Workflow follow-up

- Reviewer (fresh context) checks the diff against `specs/scaffold-ladder`, `specs/learner-storage`, D9, D19, D21 and D27. No a11y-checker run: this change has no UI.
- The user reads the flagged hints and the lecture-question template, then merges and runs `/opsx:archive`.
- Change 20 (`add-checks-and-feedback`) renders `scaffolds()` and records the lecture question through the session action.
