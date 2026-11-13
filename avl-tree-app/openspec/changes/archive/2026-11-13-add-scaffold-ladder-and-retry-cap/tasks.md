# Tasks

> **Merge note.** Union of both branches' tasks; this branch's IDs are kept first and the incoming tasks follow, renumbered. Checked on either side stays checked. Incoming work marked "superseded" built the version not chosen on 13 Nov.

## 1. Red tests (test-writer)

- [x] 1.1 Write `tests/assessment/scaffold-ladder.test.ts` from every session, escalation, hints-used, hint-match, worked-example, guided, cap and lecture-draft scenario (FR-SCA-02, FR-SCA-03, FR-ASM-07): property tests for the never-shrinking prefix and "no loop without an exit", the bank over seeds 0 to 99, and the single-place scan extended to `SCAFFOLD_LADDER`.
- [x] 1.2 Write `tests/assessment/scaffold-content.test.ts`: full coverage, a missing hint caught, clean hints over the bank, an answer-stating hint caught, reversed conventions, and calm wording.
- [x] 1.3 Extend `tests/state/learner-storage.test.ts` and the session test from the `learner-storage` delta (fresh state, model fields, round trip, older state, each malformed entry, the session action, the inventory). Commit 1.1 to 1.3 as the red tests.
- [x] 1.4 (incoming; the `ladderLevel` and per-misconception template tests are superseded) Write failing tests for:
  - the mastery table and window
  - `ladderLevel` order and requests
  - the hint, worked-example and step-through builders over every item and seeds 0 to 99
  - the lecture-question templates and the D19 and number checks
  - `capped`, `finished` and `checkComplete`
  - the session actions
  - the ladder UI (escalation, order, hints counted, axe, 44 px, wording scan)
  - the cap UI (no Try again at three, capped screen, continue, module completes with a capped item, the route)

## 2. Learner state and rules

- [x] 2.1 (implementer) Add `LectureQuestion` and `lectureQuestions` to the fresh state and the parser, the `lecture-question` session action, and the inventory wording.
- [x] 2.2 (incoming) Add `MASTERY_WINDOW` and `MASTERY_CORRECT` to the config and build `mastery.ts`. Add the `lecture-question-recorded` action and update `attempt-recorded` to set the sub-skill status. Expose `recordLectureQuestion` on the session.
- [x] 2.3 (incoming; to move onto this branch's `scaffold.ts`) Add `capped`, `finished` and the new `checkComplete` rule.

## 3. Ladder logic (implementer)

- [x] 3.1 Add `SCAFFOLD_LADDER` to `src/modules/config.ts`. Add `startCheck`, `checkStep`, `currentInstance` and the lecture-question draft to `src/assessment/scaffold.ts`.
- [x] 3.2 Add `workedExample`, `guidedSteps` and `scaffolds` with the hint lookup.

## 4. Scaffold content (content-author, `src/content/` only)

- [x] 4.1 Write `src/content/questions/scaffolds.ts` as follows. Incoming: the ladder and cap wording in `checkCopy` (its per-misconception lecture templates are superseded).
  - a hint for each drafted misconception
  - the per-need hints from the `NEEDS` labels
  - a general hint for each sub-skill
  - the lecture-question wording
  - every entry `beyond ID` and flagged for G3

## 5. Validation (implementer)

- [x] 5.1 Add the `scaffold` and `answer` problem kinds and the scaffold pass to `validateBank`, and extend `BankRecords`.

## 6. Screens (incoming)

- [x] 6.1 Build `ScaffoldLadder` (the levels, the live region, the step-through) and wire it into `CheckItem` with `hintsUsed` on the attempt.
- [x] 6.2 Enforce the cap in `CheckItem` and `CheckFeedback`: no Try again, Continue, the full step-through, the lecture question recorded once, and completion with a capped item.

## 7. Integration, records and review

- [x] 7.1 Add decision rows for the proposal's assumptions, update D42, D74 and `next-steps.md` row 21. Merge note: this branch added D75 to D82; incoming added rows "from D80". The ranges overlap in `decisions.md`, which is still in conflict.
- [x] 7.2 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`, with no new `[OPEN]` marker.
- [ ] 7.3 (incoming) Reviewer and accessibility-checker passes. Your browser checks: keyboard only, greyscale, colour-vision emulation (D25), 360 px touch. A read of the drafted hints and lecture questions (gate G3).
