# Proposal: add-scaffold-ladder-and-retry-cap

Plan row 21. Serves FR-SCA-01 (mastery, incoming), FR-SCA-02 (a scaffold matched to the misconception: a hint, then a worked example, then a guided step-through), FR-SCA-03 (a cap of 3 per question, a recorded lecture question, then continue), FR-ASM-07 (a retry is a new problem) and the content-validation row of SE 7.1 (every misconception has a scaffold and a lecture-question template). Outcomes: LO1 to LO9 through the module checks. Ties to D8, D9, D19, D21, D27.

> **Merge note.** This change was built twice in parallel: logic only on `feat/add-readiness-c9`, and with screens and mastery on `feat/add-checks-and-feedback`. Where the two contradicted, this branch's version was chosen (13 Nov). Only the scope question (item 1) is still open.

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place.

### Assumed, not blocking

1. **Scope: logic first, or with screens. Undecided.** This branch built the ladder and the cap as pure, tested logic, because change 20 was not built (user choice, 13 Nov); change 20 renders it. The incoming branch also builds `ScaffoldLadder`, enforces the cap in `CheckItem` and `CheckFeedback`, and adds mastery.
2. **One rung per wrong answer or request (D21). Decided 13 Nov: this branch's version.** Order: hint, worked example, guided step-through. A wrong, readable answer or a request opens the next rung. A rung never skips and never closes within a question. An unreadable answer opens nothing and does not count. The number of rungs open when the student answers is the attempt's `hintsUsed`. The order is `SCAFFOLD_LADDER` in `src/modules/config.ts`, next to `RETRY_CAP`.
3. **At the cap (FR-SCA-03, D9, D20).** After `RETRY_CAP` wrong, readable answers the question closes: the guided step-through of the last problem shows the answer, a lecture question is recorded, and the student continues. Flagged by the incoming branch: a capped item counts as finished for completion, so a module is never stuck; its sub-skill stays "not yet" and the suggested route is to look over the module again.
4. **The worked example is a solved sibling (FR-SCA-02, D7).** It is another variant of the same item, differing from every attempt the question can reach. It has the engine's answer and the item's existing correct explanation, so there is no new text.
5. **The guided step-through is the student's problem in steps. Decided 13 Nov: this branch's version.** For tree items the steps are the engine's insert trace. For every other item they are the sentences of the correct explanation, one at a time. It is one function, so per-kind step-throughs later change one place.
6. **Asking for the step-through before answering shows the answer (incoming).** That is allowed and recorded (`hintsUsed: 3`); a later right answer still counts.
7. **The hints are new wording, flagged for G3.** There is one hint per catalogue misconception, and a general hint per sub-skill for a request made before a wrong answer or after a wrong answer with no misconception. All are `beyond ID` and read formula, sign, lean and case wording from the conventions module (D19). They show only numbers from the problem and never state the answer.
8. **One lecture-question template. Decided 13 Nov: this branch's version.** The text is built from the misconception's catalogue label and the last problem's stem (only the stem when there is no misconception). There is no per-misconception text.
9. **Lecture questions live in the learner state.** A new `lectureQuestions` list sits under the existing storage key. A save without it loads as empty, not corrupt, so the schema version stays 1 (D16, NFR-05, NFR-06).
10. **The mastery threshold (FR-SCA-01, incoming).** At least 2 of the last 3 attempts must be correct (provisional in the SE document; TODO to confirm with the ID). With fewer than 3 attempts, every attempt must be right. The status is stored per sub-skill after every attempt (D8). Both numbers are in the config. This branch left mastery out of scope.

## Why

FR-SCA-02 and FR-SCA-03 are Musts. A wrong answer in a check must lead to help that matches the mistake, and no student may loop without an exit. D21 fixed the policy numbers and `attemptPolicy('check')` already says "the ladder", but no ladder exists. Readiness (change 23) and the diagnostic (change 22) also need lecture questions and the sub-skill status.

## What Changes

- **A check-question session (this branch):** start, answer, ask for help. It tracks the attempt, the open rungs, the last misconception and the outcome (open, correct or capped). Each retry is the question model's next variant.
- **The scaffold ladder:** a hint matched to the last misconception (with the sub-skill hint as fallback), then a worked example on a sibling problem, then a guided step-through.
- **The retry cap of 3:** no more Try again; the step-through shows the answer, a lecture question is recorded, and the student continues.
- **Scaffold content:** a hint for every misconception and sub-skill and the one lecture-question template, all flagged `beyond ID`; the bank validator reports a missing hint, typed convention wording, invented numbers and a hint that states the answer.
- **The learner state** gains `lectureQuestions` and a session action to record one.
- **Incoming:** the stored mastery status per sub-skill, `ScaffoldLadder` in `CheckItem`, and the capped state in `CheckFeedback`.

## Capabilities

### New Capabilities
- `scaffold-ladder`: the check-question session, the escalation order, the worked example, the guided step-through, the hint coverage and wording rules, and (incoming) the ladder's accessibility.
- `retry-cap` (incoming): the cap of 3, the capped outcome, the lecture question and continuing.
- `mastery` (incoming): the sub-skill threshold and the stored status.

### Modified Capabilities
- `learner-storage`: the learner state holds lecture questions; a fresh state has none, they are validated on load, and an older save still loads.
- `module-checks` (incoming): retries are capped; a capped item counts as finished.
- `check-feedback` (incoming): the capped state replaces Try again with the answer and Continue.
- `learner-session` (incoming): screens can record a lecture question; the sub-skill status updates with each attempt.
- `question-bank` (incoming): every misconception has a hint.

## Impact

- This branch: new `src/assessment/scaffold.ts` and `src/content/questions/scaffolds.ts`; changed `src/modules/config.ts`, `src/assessment/validate.ts`, `src/state/learnerState.ts`, `learnerReducer.ts` and `storage.ts`. Tests: `tests/assessment/scaffold-ladder.test.ts`, `scaffold-content.test.ts` and `tests/state/learner-storage.test.ts`.
- Incoming: `src/assessment/mastery.ts`, `ScaffoldLadder`, `CheckItem` and `CheckFeedback`. The incoming screens must move onto this branch's `scaffold.ts` API. The code files are still in conflict.
- No new dependencies, no network.

## Out of scope

- Practice support: practice steps keep their own two-hint flow (D21). Fading support and skipping practice after a correct first check (FR-SCA-04, FR-SCA-05).
- Showing sub-skill progress, the readiness summary, the C1 diagnostic and C9 (changes 22 and 23; FR-MOT-01).
- Exporting or printing lecture questions (change 23), and the event log (change 26).
- New bank items or misconceptions.
