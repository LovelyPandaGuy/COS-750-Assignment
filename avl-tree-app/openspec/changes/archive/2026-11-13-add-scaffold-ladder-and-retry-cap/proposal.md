# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place. Please read them before `/opsx:apply`.

1. **Flagged for you to read at G3: the scaffold wording.** The ID and the SE document name the ladder (hint, worked example, guided step-through) but give no text. This change drafts a hint for each of the 25 misconceptions in the catalogue and a fallback hint for each of the 14 sub-skills, plus a lecture-question template for each misconception and sub-skill. All are `beyond ID`, in one content file, read through the conventions module so none types a formula, a sign's lean or a case name (D19).
2. **Assumed, not blocking: the worked example and the guided step-through are built from the bank, not authored per misconception (FR-SCA-02, D7).** A worked example is another variant of the same item, solved: its stem, the engine's answer and the item's "correct" explanation. The guided step-through is the student's own question walked through one sentence of that explanation at a time, ending with the answer. Both are engine-computed and cover every misconception with no new teaching text. The cost is that the step-through reads like the "why" in feedback, split into steps.
3. **Assumed, not blocking: the ladder escalates in order, by wrong attempt or on request (D21).** Wrong attempt 1 shows the hint, wrong attempt 2 the worked example, and wrong attempt 3 (the cap) the guided step-through. A student can also ask for the next level at any time, but never skip a level. Each level opened counts as a hint used on the attempt record.
4. **Assumed, not blocking: asking for the guided step-through before answering shows the answer.** That is allowed and recorded (`hintsUsed: 3`); a later right answer still counts.
5. **Flagged for you: a capped item counts as finished for completion (FR-SCA-03, D20).** Three attempts with none right ends the item: no more Try again, the step-through shows the answer, a lecture question is recorded, and Continue is offered. The item then counts towards completing the module, so a module is never stuck. Its sub-skill stays "not yet" and the suggested route is looking over the module again. The alternative, leaving the module incomplete, would make the item impossible to finish because attempts are kept.
6. **Assumed, not blocking: the mastery threshold is "at least 2 of the last 3 attempts correct" (FR-SCA-01, provisional in the SE document, TODO to confirm with the ID).** With fewer than 3 attempts every attempt must be right: a first-try right answer is "secure", one right out of two is "developing", none right is "not yet". Both numbers are in the one config. The status is stored per sub-skill after every attempt (D8).
7. **Assumed, not blocking: lecture questions are stored in a new optional learner field.** Each holds the item, the misconception if any, the generated text and the time. An older save without the field loads as empty, not as corrupt. The text is generated, never typed by the student, so no personal data is stored. Export is change 23.

## Why

Checks now show feedback but offer no help beyond "Try again", and a student who keeps missing has no way on: the retry cap and its lecture question are still a promise. FR-SCA-01 to FR-SCA-03 are Musts, and D9 and D21 settle the policy: a ladder of support, a cap of 3, then a recorded lecture question. Readiness (change 23) and the diagnostic (change 22) also need the stored sub-skill status.

## What Changes

- **Scaffold ladder** on each check item: hint, worked example, guided step-through, in that order, opened by a wrong attempt or on request.
- **Retry cap of 3:** after the third wrong attempt there is no more Try again; the step-through shows the answer, a lecture question is recorded, and the student continues.
- **Mastery:** sub-skill status (secure, developing, not yet) computed from attempts and stored after each one.
- **Learner state** gains `lectureQuestions`; the player and session record them.
- **Content validation:** every misconception has a hint and a lecture-question template; a test fails if one is missing (FR-SCA-02).
- Serves FR-SCA-01, FR-SCA-02, FR-SCA-03, FR-ASM-03 (support), D8, D9, D19, D21, D27.

## Capabilities

### New Capabilities
- `scaffold-ladder`: the three support levels, their content and their escalation order.
- `retry-cap`: the cap of 3, the capped outcome, the lecture question and continuing.
- `mastery`: the sub-skill threshold and the stored status.

### Modified Capabilities
- `module-checks`: retries are capped; a capped item counts as finished for completion.
- `check-feedback`: the capped state replaces Try again with the answer and Continue.
- `learner-storage`: `lectureQuestions` is stored and validated.
- `learner-session`: screens can record a lecture question; sub-skill status updates with each attempt.
- `question-bank`: every misconception has a hint and a lecture-question template.

## Out of scope

- Fading support across practice, and skipping practice after a first-try right check (FR-SCA-04, FR-SCA-05); the practice steps keep their own hints (D21).
- Showing sub-skill progress, the readiness summary, the C1 diagnostic and C9 (changes 22, 23; FR-MOT-01).
- Exporting or printing lecture questions (change 23), and the event log (change 26).
- New bank items or misconceptions.
