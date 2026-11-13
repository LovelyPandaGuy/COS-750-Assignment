# Tasks

## 1. Failing tests first

- [x] 1.1 Write failing tests: mastery table and window; `ladderLevel` order and requests; hint, worked-example and step-through builders over every item and seeds 0 to 99 (no answer in a hint, example differs and matches the engine, steps end with the answer); lecture-question templates and the D19 and number checks; the validator catching a missing hint or template; `capped` and `finished` and `checkComplete` with capped items; learner-state lecture-question parse (older save, round trip, tampered); session actions (recorded once, status in the same change, reset); the ladder UI (escalation by wrong attempts and on request, order enforced, hints counted, axe, 44 px, wording scan); the cap UI (no Try again at three, unreadable not counted, capped screen, continue to the summary, module completes with a capped item, route is look over again).

## 2. State and rules

- [x] 2.1 Add `MASTERY_WINDOW` and `MASTERY_CORRECT` to the config; build `mastery.ts`; add `lectureQuestions` to the learner state, parser and inventory text; add the `lecture-question-recorded` action and update `attempt-recorded` to set the sub-skill status; expose `recordLectureQuestion` on the session.
- [x] 2.2 Add `capped`, `finished` and the new `checkComplete` rule, and `scaffold.ts` (levels, hint, worked example, steps, lecture question).

## 3. Content

- [x] 3.1 Draft `scaffolds.ts`: a hint and a lecture-question template for every catalogue misconception and every used sub-skill, all `beyond ID`; add the scaffold check to `validateBank`; add the ladder and cap wording to `checkCopy`.

## 4. Screens

- [x] 4.1 Build `ScaffoldLadder` (levels, live region, step-through) and wire it into `CheckItem` with `hintsUsed` on the attempt.
- [x] 4.2 Enforce the cap in `CheckItem` and `CheckFeedback`: no Try again, Continue, the full step-through, the lecture question recorded once, completion with a capped item.

## 5. Docs and review

- [x] 5.1 Add decisions from D80 for the assumptions in the proposal, update `next-steps.md` row 21, and run `npm test`, typecheck, lint, build and `openspec validate --all`.
- [ ] 5.2 Reviewer and accessibility-checker passes; the user's browser checks (keyboard only, greyscale, colour-vision emulation D25, 360 px touch), and a read of the drafted hints and lecture questions (gate G3).
