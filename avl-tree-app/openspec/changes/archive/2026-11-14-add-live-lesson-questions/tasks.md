# Tasks

Roles as in `.claude/CLAUDE.md`. Nothing under `src/live_content/` or the .docx files is edited. No task commits; the user commits. Apply after `add-live-lesson-content`.

## 1. Red tests

- [x] 1.1 (test-writer) Write `tests/live/mark.test.ts` for every `lesson-questions` marking and wrong-answer scenario. Include the property that every `wrongAnswers` entry in the content is reachable: a constructed answer matching the entry is marked with that entry's misconception. Update `tests/state/*` for the attempt number. Verify the tests fail only because the marker does not exist (ID 9.5, 9.6, 12.2).
- [x] 1.2 (test-writer) Write `tests/ui/lesson-questions.test.tsx` and `tests/ui/lesson-checks.test.tsx` for every `lesson-questions`, `lesson-checks`, `check-feedback` and `lesson-player` delta scenario, including axe before and after an answer for each question type, keyboard-only use of the tree builder, and reload during a check. Retire `tests/ui/predict-first.test.tsx`, `tests/ui/do-it-yourself.test.tsx`, `tests/practice/predict.test.ts` (its module stays for change 2) only where they test removed UI. Verify the new tests fail only because the components do not exist (ID 9.1, 9.2, 9.4, 10.1).

## 2. Marking

- [x] 2.1 (implementer) Add `engineAnswer(q)` shared by `crossCheck.ts` and the new `src/live/mark.ts`, with the wrong-answer patterns from design 2, and add the attempt number to the attempt record in `src/state/learnerState.ts` (missing loads as 1). Verify the task 1.1 tests pass and the content still validates with no problems.

## 3. Question controls

- [x] 3.1 (implementer, content-author for `src/content/lesson.ts`) Build `QuestionCard`, `ChoiceControl`, `ValuesControl`, `NodePicker` and `TracePicker` in `src/ui/lesson/questions/`, with four-part feedback from `conventions.json` (`CheckFeedback` reworded or replaced). Verify the task 1.2 tests for those types pass (ID 9.5, 10.1).
- [x] 3.2 (implementer) Build `TreeBuilder` (design 4): branch targets, rotation menu, delete, undo, reset, in-order strip, action log. Verify the builder's reducer tests and the c2-s01, chk5-03, chk6-04 and chk7-03 UI tests pass (ID 8.3, D3).

## 4. Screens

- [x] 4.1 (implementer) Wire predict, recall, task, practice (including the pseudocode panel and step counter) and transfer screens into `regionsFor`, and replace the placeholder. Make the Hint control follow the screen's question. Verify the `lesson-player` and `lesson-questions` screen tests pass (ID 3.2, 7.2, 8.1, 9.4).
- [x] 4.2 (implementer) Build `CheckRunner` for check screens: questions in order, two attempts, required confidence, Next only when finished, resume from stored attempts, completion on finish (C7 optional). Verify the `lesson-checks` tests pass (ID 9.1, 9.2, FR-LRN-05).
- [x] 4.3 (implementer) Add guided pauses to `LessonAnimation` (design 6) and the review link that moves to the concept's screen (design 7). Verify the `c6-s06` guided test and the review-link test pass (ID 7.2, 10.1).

## 5. Removal and records

- [x] 5.1 (implementer, test-writer) Delete `PredictPrompt`, `PredictionReveal`, `ModeSwitch`, `DoItYourself` and `FeedbackPanel` and their tests, after an import search. Add D106 to D111 to `.claude/docs/decisions.md`, and update the CLAUDE.md guardrails for checks and practice. Verify `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all` pass.
- [ ] 5.2 Run the reviewer and a11y-checker roles. Then by hand: a keyboard-only run through C3's practice and check, C5's rotation check on a phone at 360 px, and a greyscale screenshot of feedback. Verify the reports pass or findings are resolved.

## Workflow follow-up

- Read proposal items 1 to 12 and the new labels in `src/content/lesson.ts`.
- Archive order: `add-live-lesson-content`, then this change.
- The user commits, merges and archives; agents do not.
