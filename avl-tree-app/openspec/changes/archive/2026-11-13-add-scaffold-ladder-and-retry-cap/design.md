# Design: add-scaffold-ladder-and-retry-cap

> **Merge note.** Joins the logic-only design (this branch) and the screens-and-mastery design (`feat/add-checks-and-feedback`). Where they contradicted, this branch's version was chosen (13 Nov).

## Context

See proposal.md for why and scope. What exists:

- `src/assessment/`: `instantiate(item, seed, attempt)` builds a problem that differs from the attempt before it (D9). `mark` returns `correct`, `not-yet` (with a misconception when one is recognised) or `unreadable`. `attemptRecord` builds the stored `Attempt`. `attemptPolicy('check')` returns `{ retryCap: RETRY_CAP, hints: 'ladder' }`, but the cap is not enforced.
- `src/modules/config.ts` holds `RETRY_CAP = 3` and `PRACTICE_HINTS = 2`; a test checks they appear nowhere else.
- `validateBank` checks tags, explanations, numbers, convention wording and judging words.
- The bank has 25 catalogued misconceptions (18 drafted plus one per need) and 14 sub-skills.
- `LearnerState` has `attempts` and an unused `subSkillStatus`, and no place for lecture questions.
- Change 20, on the incoming branch, shows check items: `CheckItem` instantiates, marks and stores an attempt, then shows `CheckFeedback` with Try again always offered.

## Goals / Non-Goals

**Goals:**
- One ladder, one cap and one threshold, each defined in one place.
- Support content that is complete by construction (a validator, not a promise).
- Capped items never trap a student.

**Non-Goals:** practice support, fading, skipping practice, progress display, readiness (changes 22 and 23).

## Decisions

### 1. A reducer for the question's state (Decided 13 Nov: this branch's version.)

`src/assessment/scaffold.ts`:
- `startCheck(item, seed)` and `checkStep(item, session, action)` return the new session plus the mark and the attempt record, so the caller saves the attempt.
- The session (`itemId`, `seed`, `attempt`, `rungs`, `lastMisconception`, `outcome`, `lectureQuestion`) holds only numbers and IDs; the instance is recomputed.
- A rung count makes "a prefix that never shrinks" hold by construction.
- Incoming screens drive this reducer. Their completion rule (correct or capped counts as finished) reads the stored attempts.

### 2. Escalation (Decided 13 Nov: this branch's version.)

- A help request opens the next rung; a wrong readable answer also opens the next rung (`rungs = min(rungs + 1, max)`).
- An unreadable answer changes nothing.
- `hintsUsed` is the number of rungs open when the answer is marked.
- At the cap every rung opens.
- The order is `SCAFFOLD_LADDER` in `src/modules/config.ts`.

### 3. The hint

The misconception's hint, else the sub-skill's, rendered with the instance's facts and `conventionsWording()`. For a capped question, it uses the last problem. A missing hint falls back to the sub-skill hint at run time, and the validator reports it.

### 4. The worked example

Instantiate the item from a seed salted away from the attempts' seeds, retrying until its `signature` differs from every reachable attempt (0 to `RETRY_CAP - 1`). Throw a `RangeError` after a bound.

Rejected alternative: a worked example authored per kind, because it needs new teaching text.

### 5. The guided step-through (Decided 13 Nov: this branch's version.)

- Tree items: the engine's insert trace, rendered by the existing replay components.
- Other items: the sentences of the correct explanation, split after `.`, `?` or `!`.

The steps are shown one at a time. It is one function, so a per-kind step-through later replaces only that function.

### 6. Scaffold content (Decided 13 Nov: this branch's version.)

`src/content/questions/scaffolds.ts` (content-author), every entry `beyond ID`:
- `HINTS`: one per misconception, with need hints built from the `NEEDS` labels.
- `GENERAL_HINTS`: one per sub-skill.
- `lectureQuestionText(label, stem)`: one template.

### 7. Validation

`validateBank` gains a scaffold pass over every item and seed:
- every catalogue misconception and used sub-skill has a hint
- numbers come only from the instance
- no typed convention wording
- no `undefined` or `NaN`, and no judging words
- no hint states the answer (this branch adds the `scaffold` and `answer` problem kinds)

`BankRecords` takes the hint tables, so tests can pass a catalogue with a gap.

### 8. Lecture questions in learner state

`LectureQuestion { questionId, module, at, text, misconceptionId? }` sits in a `lectureQuestions` list. A missing field reads as `[]`; anything else malformed is corrupt. A session action records one (`lecture-question`). Incoming screens record it once per item. The inventory text is reworded. There is no schema bump: a bump would reset every pilot student's progress, and D18 favours the cheaper change.

### 9. Mastery (incoming)

`subSkillStatus(attempts, items, subSkill)` in `src/assessment/mastery.ts` reads the last `MASTERY_WINDOW` attempts against `MASTERY_CORRECT` (both in config). The reducer calls it inside `attempt-recorded`, so the attempt and the status change in one save.

### 10. UI, route and completion (incoming)

- A `ScaffoldLadder` region sits under the feedback, with buttons "Show a hint", "Show a worked example" and "Walk me through it", enabled in order. It has a polite live region and "Show next step". At the cap, `CheckFeedback` drops Try again and shows Continue and the lecture question, recorded once.
- `firstAttemptMisses` keeps the route at "look over this module again".
- `checkComplete` counts an item that is correct or capped.

## Risks / Trade-offs

- **The step-through reads like the "why".** It adds no text but may feel repetitive. It is isolated in one function.
- **About 40 to 60 new hint strings are unverified teaching wording.** All are `beyond ID` and flagged for G3. The validator guards completeness and D19, not quality.
- **The "does not state the answer" check is heuristic.** The reviewer reads every hint once.
- **A worked example equal to the question.** Guarded by the retry loop and a test over seeds 0 to 99.
- **Asking for the step-through first reveals the answer.** Allowed and recorded.
- **The provisional mastery threshold (incoming).** It is one config pair.

## Migration Plan

No migration. States saved before this change load with empty `lectureQuestions` under schema version 1. An older build drops the extra field on its next save.
