# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). The ID documents are final (D92). Every item below follows from them or is an assumption kept in one place; please read them before `/opsx:apply`.

1. **Settled (user, 14 Nov): three changes, applied in order.** This is change 1 of 3: the questions and checks inside C2 to C8. Change 2 (`live-c1-and-c9`) moves C1 and C9 onto the JSON and removes the old question model. Change 3 (`add-lesson-outline`) adds the lesson outline. **Archive order:** `add-live-lesson-content`, then this change (it changes `lesson-player`, which that change adds), then change 2, then change 3.
2. **Settled by the ID (9.1, `checks.json`): one question per criterion, one re-attempt.** A check question allows two attempts (`attemptsPerQuestion: 2`) and counts as right if either is right. Practice, recall, predict and transfer questions allow unlimited tries (ID 10.2).
3. **Settled by the ID (9.4): one static hint per question.** The Hint control opens the question's own `hint`. It never changes with the answer. Opening it is recorded as `hintsUsed` (ID 12.2).
4. **Settled by the ID (10.1): four-part feedback from the content.** The verdict is "That's right." or "Not quite." from `conventions.feedback` ("Almost there." when part of the answer is right). The reason is the chosen option's `explanation`, the matching `wrongAnswers` feedback or the question's `feedback`. The link is "Review: {concept}" to the concept's screen. The next step is "Try again" or "Continue".
5. **Settled by the ID (9.2, 12.2): confidence and the attempt record.** Each check answer carries Sure or Not sure (required before Check answer; optional in practice). Each marked answer is stored with its attempt number (1, or 2 for a re-attempt), confidence and hints used.
6. **Assumed, not blocking: the engine marks every answer (ID 12.2, D95).** The tree, the operation and the right answer come from the engine; the JSON's `expected` was already cross-checked against it on load. A wrong answer is matched against `wrongAnswers` (by option, value, node, shape or a `conventions.wrongAnswerPatterns` pattern) to name its misconception.
7. **Assumed, not blocking: a check plays inside its lesson.** The `check` screen shows the check's questions one at a time ("Question 2 of 4"), in `questionIds` order. Next is offered only when the current question is finished (right, or both attempts used), so a check is never skipped (ID 8.2).
8. **Assumed, not blocking: a lesson completes when its check is finished.** Every check question is finished (right or both attempts used); C7's optional check never blocks and completes C7 when finished (ID 7.2). Completion moves the current module on, as before.
9. **Assumed, not blocking: placing a key is a click on an empty branch.** Build-tree questions show the empty branches where the next key could go as targets (ID 8.3 "direct manipulation"; c2-s01 "click the empty branch where it belongs"). Rotations use the existing rotation menu, deletions a Delete button; Undo and Reset are always there. Every action works by touch, pointer and keyboard (D3).
10. **Assumed, not blocking: guided pauses (C6 Example 2).** At each imbalance the animation pauses and asks for n (`askNode`) and the case (`askCase`), marks both from the engine, then continues (ID 7.2 C6 "the second is guided").
11. **Out of scope here, in the rewards change:** titles after a check, routing bands, the review ladder through `reviewQuestionIds` and `scaffolds.json`, the optional challenge and the nudge (ID 9.3, 9.4). A finished check ends the lesson as now.
12. **Flagged for the user to read:** only UI labels are new ("Check answer", "Question n of m", "Sure", "Not sure", "Found", "Not found", "None", "Undo", "Reset", "Delete"); most come from `conventions.labels`. No teaching text is written.

## Why

After `add-live-lesson-content`, every question in C2 to C8 is a placeholder: the practice tasks, predictions, recall questions, transfer questions, guided pauses and lesson checks from the ID's JSON are not shown, so no lesson can be completed and the ID's assessment (ID 9) does not exist in the app.

## What Changes

- **Questions in lessons (new).** One component per question type (ID 9.5): multiple choice and case-id, enter values (with "mark any unbalanced node" and "is it an AVL tree?"), click the node, trace a search (with Found or Not found, and the pseudocode and step counter on practice screens), perform the rotation and build the tree. Predict, recall, task, practice and transfer screens ask their question in the lesson frame.
- **Marking from the engine (new).** Every answer is marked against the engine's result; wrong answers are matched to the content's misconceptions.
- **Lesson checks (new).** The check screen plays the check's questions with one re-attempt each, confidence, the static hint and four-part feedback; finishing it completes the lesson.
- **Feedback (changed).** Verdicts and links come from `conventions.json` (ID 10.1), replacing D27's "Not quite yet".
- **Attempt record (changed).** Each attempt stores its attempt number.
- **Removed (BREAKING).** The insert-replay predictions and the Do it yourself practice (`predict-first`, `do-it-yourself`), which no lesson uses any more; the JSON's predict and build-tree questions replace them.
- Serves LO1 to LO7 (ID 5.1, 5.2); ID 7.2, 8.2, 8.3, 9.1, 9.2, 9.4, 9.5, 9.6, 10.1, 10.2, 12.2; FR-ASM-01, FR-ASM-03, FR-ASM-04, FR-ASM-05, FR-LRN-05.

## Out of scope

- C1 and C9 (change 2), the lesson outline (change 3).
- Titles, routing bands, the review ladder, the challenge, the nudge, confetti (rewards change).
- The C1 refresher's practice task and re-check (change 2, with C1).

## Capabilities

### New Capabilities
- `lesson-questions`: asking and marking the JSON questions inside lessons, one component per question type, with the engine as the marker.
- `lesson-checks`: a lesson's check (one question per criterion, one re-attempt, confidence, the attempt record) and lesson completion.

### Modified Capabilities
- `lesson-player`: interactive screens ask their questions; the placeholder requirement is removed.
- `check-feedback`: verdicts, review link and next step from `conventions.json`.
- `learner-storage`: an attempt stores its attempt number.
- `predict-first`, `do-it-yourself`: every requirement removed.

## Impact

- New: `src/live/mark.ts` (marking and wrong-answer matching), `src/ui/lesson/questions/` (question card and one control per type, including the tree builder), question labels in `src/content/lesson.ts`.
- Changed: `src/ui/lesson/blocks.tsx` and `LessonPlayer.tsx` (interactive screens, check screen, completion), `src/ui/lesson/LessonAnimation.tsx` (guided pauses), `src/state/learnerState.ts` (attempt number), `src/ui/module/check/CheckFeedback.tsx` (conventions wording).
- Removed: `src/ui/practice/PredictPrompt.tsx`, `PredictionReveal.tsx`, `ModeSwitch.tsx`, `DoItYourself.tsx`, `FeedbackPanel.tsx` and their tests. `RotationMenu` and `InOrderStrip` stay and are reused. `src/practice/` stays until change 2, because the old C9 tree editor and the old module helpers still import it.
- No new dependencies, no network calls. The storage schema version is unchanged (the new field is optional).
