# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/practice/predict.test.ts` and `tests/practice/rotate.test.ts` from every scenario under "Prediction kinds and options", "The answer comes from the engine", the comparison table in "Reveal after the replay", "Student-performed rotation", "Feedback on a rotation" (including the in-order and height properties), "In-order strip" and the history part of "Undo and reset", named after FR-VIS-05, FR-VIS-06 or LO6; verify they fail only because the modules do not exist.
- [x] 1.2 Write `tests/ui/predict-first.test.tsx` and `tests/ui/do-it-yourself.test.tsx` from every scenario under "Prompt before a replay", the reveal rendering, "Predictions are practice, never marks", "Prompt is accessible", "Watch or Do it yourself switch", "Practice starts from the unbalanced tree", "Rotation menu", the UI half of "Undo and reset" and "Practice is not graded" (axe, keyboard-only, 44 px, 360 px, wording scan); verify they fail only because the components do not exist and that all existing tests still pass.

## 2. Logic

- [x] 2.1 Add `src/practice/predict.ts` (options, engine-computed answer and step index, comparison tags); verify the prediction tests pass, including the property test against `avlInsert`.
- [x] 2.2 Add `src/practice/rotate.ts` (start tree and rotation count, `rotateAt` with refusals, feedback kind, in-order, the practice reducer with undo and reset); verify the rotation tests pass, including the order and height properties.

## 3. UI

- [x] 3.1 Add `src/content/practice.ts` (content-author; flag the wording for the user) and `PredictPrompt` and `PredictionReveal` in `src/ui/practice/`; verify the prediction UI tests pass.
- [x] 3.2 Add `ModeSwitch`, `RotationMenu`, `InOrderStrip` and `FeedbackPanel` with the stylesheet (tokens only); verify their parts of the do-it-yourself tests pass.
- [x] 3.3 Add `DoItYourself` (task prompt, interactive `TreeView`, scoped key handling, focus moves, undo and reset); verify the whole do-it-yourself test file passes.

## 4. Review

- [x] 4.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; verify all pass with no new `[OPEN]` markers and no edits to `src/engine/`, `src/ui/tree/` or `src/ui/AppShell.tsx`.
- [ ] 4.2 Run the `reviewer` (fresh context) and `a11y-checker` subagents; then by hand: keyboard-only run, greyscale screenshot, a touch run (tap node, tap Rotate) and a 360 px width run, and a screen-reader pass over the prompt, reveal and feedback; verify the reports pass or findings are resolved.

## Workflow follow-up

- Confirm the three assumptions in the proposal (stored prediction, Watch slot, prediction kinds) and read the new wording in `src/content/practice.ts`.
- Next changes: step controls and the worked-example screen, which place these parts and own the replay; the storage change, which consumes the prediction callback.
- The user merges and archives; agents do not.
