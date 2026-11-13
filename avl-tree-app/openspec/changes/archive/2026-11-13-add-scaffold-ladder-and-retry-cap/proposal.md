# Proposal: add-scaffold-ladder-and-retry-cap

Plan row 21. Serves FR-SCA-02 (scaffold matched to misconception, escalating hint, then worked example, then guided step-through), FR-SCA-03 (cap of 3 per question, record a lecture question, continue), FR-ASM-07 (a retry is a new problem) and the content-validation row of SE 7.1 (every misconception has a scaffold and a lecture-question template). Outcomes: all of LO1 to LO9 through the module checks; nothing here is specific to one LO.

## Open questions

None block this change (D18). Everything below is assumed, isolated in one place, and gets a row in `decisions.md`.

### Assumed, not blocking

1. **Logic before screens (user choice, 13 Nov).** Change 20 (`add-checks-and-feedback`: QuestionItem, the check FeedbackPanel, the confidence rating) is not built yet. This change builds the ladder and the cap as pure, tested logic with no UI; change 20 renders it. Modules keep the check placeholder (D42). New row, ties to D42 and D74.
2. **One rung per wrong answer or request.** A wrong, readable answer or a request for help opens the next rung: hint, then worked example, then guided step-through. Rungs never skip and never close within a question. An unreadable answer opens nothing and does not count as an attempt. The number of rungs open when the student answers is the attempt's `hintsUsed`. Ladder order lives in `src/modules/config.ts` next to `RETRY_CAP`. Ties to D9, D21.
3. **What happens at the cap.** After `RETRY_CAP` wrong, readable answers the question closes: the guided step-through of the last problem opens, a lecture question is drafted, and the student continues. Ties to D9, FR-SCA-03.
4. **Worked example is a solved sibling.** The worked-example rung shows another instance of the same item (a seed that differs from every attempt's problem), with its engine answer and the item's existing correct explanation. No new text. Ties to D9, D27.
5. **Guided step-through is the student's problem in steps.** For tree items the steps are the engine's insert trace; for every other item they are the sentences of the item's correct explanation, one at a time. One function, so per-kind step-throughs later change one place. Ties to D21, D27.
6. **Hints are new wording, flagged.** One hint per catalogue misconception, and one general hint per sub-skill for a request made before any wrong answer, or after a wrong answer with no misconception. The ID lists no hints, so every hint is `beyond ID` and flagged for the user to read at G3, like the misconception catalogue (12 Nov). Hints read formula, sign, lean and case wording from the conventions module (D19), show only numbers from the problem, and never state the answer. Ties to D19, D21.
7. **One lecture-question template.** The draft is built from the misconception's catalogue label and the stem of the last problem; with no misconception, only the stem. No per-misconception text. The student can edit it later (change 23). Ties to D9; the ID's C9 asks the student to write one question.
8. **Lecture questions live in learner state.** A new `lectureQuestions` list in the learner state, under the existing storage key. A stored state without the field loads with an empty list, so the schema version stays 1. Ties to D16, NFR-05, NFR-06.

## Why

FR-SCA-02 and FR-SCA-03 are Musts: a wrong answer in a check must lead to help that matches the mistake, and no student may loop without an exit. D21 fixed the policy numbers (`RETRY_CAP`, `PRACTICE_HINTS`) and `attemptPolicy` already says checks use "the ladder", but no ladder exists. Building it as logic now lets change 20 render a tested behaviour instead of inventing one.

## What Changes

- A check-question session: start a question from an item and a seed, answer it, ask for help. It tracks the attempt number, the open rungs, the last misconception, and the outcome (open, correct or capped). Each retry uses the question model's next variant (FR-ASM-07).
- The scaffold ladder: hint matched to the last misconception (with a general hint per sub-skill as fallback), then a worked example on a sibling problem, then a guided step-through.
- The retry cap: at `RETRY_CAP` wrong answers the question closes with the guided step-through, a drafted lecture question, and a way to continue.
- Scaffold content: a hint for every misconception in the catalogue and every sub-skill, and the lecture-question template, all flagged `beyond ID`.
- Bank validation extends to scaffolds: missing hints, typed sign, lean or case wording, invented numbers, and hints that state the answer are reported.
- Learner state gains `lectureQuestions`, validated on load, plus a session action to record one.

## Out of scope

- Any screen, panel or button (change 20 renders the ladder; change 23 lets the student edit the lecture question and shows it on the summary).
- The mastery threshold per sub-skill and routing on it (FR-SCA-01, changes 22 and 23).
- Practice support: practice steps keep their own two-hint flow (D21, D47, D72). This change does not touch practice.
- Skipping practice after a correct first check (FR-SCA-05).
- The C9 readiness check and its "missed item returns once" rule (FR-ASM-06).
- Persisting attempts or route events to the event log (change 26).

## Capabilities

### New Capabilities
- `scaffold-ladder`: the check-question session, escalation order, retry cap, worked example, guided step-through, lecture-question draft, and the coverage and wording rules for scaffold content.

### Modified Capabilities
- `learner-storage`: the learner state holds lecture questions. A fresh state has none, they are validated on load, and a state stored without them still loads.

## Impact

- New: `src/assessment/scaffold.ts` (session and ladder), `src/content/questions/scaffolds.ts` (hints and the lecture-question template).
- Changed: `src/modules/config.ts` (ladder order), `src/assessment/validate.ts` (scaffold checks), `src/state/learnerState.ts` and `src/state/learnerReducer.ts` (lecture questions), `src/state/storage.ts` (inventory description).
- Tests: new `tests/assessment/scaffold-ladder.test.ts`, `tests/assessment/scaffold-content.test.ts`; extended `tests/state/learner-storage.test.ts`.
- No new dependencies, no UI, no network.
