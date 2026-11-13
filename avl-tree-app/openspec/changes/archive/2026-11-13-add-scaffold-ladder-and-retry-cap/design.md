# Design

## Context

Change 20 shows check items: `CheckItem` instantiates an item for the learner's seed and the count of stored attempts, marks it, stores the attempt, and shows `CheckFeedback` with Try again always offered. `RETRY_CAP = 3` and `attemptPolicy('check')` (`hints: 'ladder'`) exist from change 19 but are not enforced. `LearnerState` has `attempts` and an unused `subSkillStatus`. The bank (`src/content/questions/`) has 18 catalogued misconceptions plus one tag per C8 need, and 14 sub-skills. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- One ladder, one cap, one threshold, each a number or function in one place.
- Support content that is complete by construction (a validator, not a promise).
- Capped items never trap a student.

**Non-Goals:**
- Practice-step support, fading, skipping practice, progress display, readiness (changes 22, 23).

## Decisions

1. **Derived state, not flags.** The wrong-attempt count of an item is derived from stored attempts (`attemptsOf(itemId)`; unreadable never stored). `capped(item)` = three or more attempts, none correct. `finished(item)` = correct or capped. No new stored flags except lecture questions. Alternative, a stored "capped" flag, rejected as redundant and open to drift.
2. **`src/assessment/scaffold.ts`, pure.** `ladderLevel(wrongAttempts, requested)` gives the level shown (the larger of the automatic and requested level, never skipping); `hintFor(inst, misconception)`, `workedExampleFor(item, seed, attempt)`, `stepsFor(inst)` (sentences of the correct explanation), `lectureQuestionFor(inst, misconception)`. The worked example instantiates the item with a seed derived from the learner's seed and a fixed offset, retried until its signature differs from the question's.
3. **Content in one file, `src/content/questions/scaffolds.ts`.** `HINTS` keyed by misconception ID, `SUB_SKILL_HINTS` and `LECTURE` keyed likewise; each a `Wording` receiving the instance's facts and the conventions wording, every entry `beyond ID`. `validateBank` gains a scaffold check: every catalogue misconception and every used sub-skill has a hint and a template; the existing wording and number checks run over them.
4. **Mastery in `src/assessment/mastery.ts`:** `subSkillStatus(attempts, items, subSkill)` over the last `MASTERY_WINDOW` attempts with `MASTERY_CORRECT`, both in `src/modules/config.ts`. The reducer calls it inside `attempt-recorded`, so the attempt and the status change in one state update and one save. The reducer imports the bank for item-to-sub-skill; items outside the bank (older attempts) are ignored.
5. **Lecture questions.** `LearnerState.lectureQuestions?: LectureQuestion[]` (optional in the type for older saves; the parser fills `[]`). `parseLearnerState` validates entries. New reducer action `lecture-question-recorded`, a no-op when the item already has one. The inventory description is reworded. No schema version bump: the field is additive and a missing field is read as empty.
6. **UI.** A `ScaffoldLadder` region under the feedback: level buttons ("Show a hint", "Show a worked example", "Walk me through it") enabled in order, a polite live region for each level opened, the step-through's "Show next step". `CheckItem` tracks levels requested for the variant; on a wrong attempt it opens level min(wrong attempts, 3). `hintsUsed` on the stored attempt is the levels open when it was marked. At the cap `CheckFeedback` drops Try again, shows Continue, and the lecture question; the player records it once in an effect guarded by the stored list.
7. **Route.** `firstAttemptMisses` already counts first-attempt misses, so a capped item keeps the suggestion at "look over this module again" with no change.
8. **Completion.** `checkComplete` counts an item when it is correct or capped; `CheckItem` calls `completeModule` after either outcome.

## Risks / Trade-offs

- **Step-through reads like the "why".** It is the correct explanation split by sentence, so it adds no new text but may feel repetitive. Authoring per-kind steps is the alternative if reviewers dislike it.
- **Hint wording is new and large** (about 60 short strings). The validator guards completeness and D19, not quality; gate G3 reading is the control.
- **A worked example that equals the question.** The retry loop guards it; a test runs seeds 0 to 99 for every item.
- **Asking for the step-through first reveals the answer.** Allowed and recorded; the first-attempt route and mastery still read the real marks.
- **Provisional threshold.** One config pair; the SE document marks it TODO.
