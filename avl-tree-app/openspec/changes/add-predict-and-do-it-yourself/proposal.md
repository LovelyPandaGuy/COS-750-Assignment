# Proposal

## Open questions

No `[OPEN]` item blocks the specs. Items 1 to 3 are assumptions the user should read; each names the decision or requirement it leans on.

1. **Assumed, not blocking: "stored" prediction (FR-VIS-05, D16, wireframe 1g note 1).** FR-VIS-05 says "Prediction is stored"; wireframe 1g says predictions "are never scored or stored as marks". I read these together as: the prediction is kept as an event (for the event log, D16), never as a mark and never toward readiness. The event log and storage adapter do not exist yet, so this change reports each prediction through a callback (`{ kind, choice, answer, skipped }`) and stores nothing. The "is stored" half of FR-VIS-05's acceptance is therefore not met until the storage change wires the callback. Please confirm.
2. **Assumed, not blocking: Watch mode is a slot (D10, FR-VIS-03).** Watch mode needs StepControls, the pseudocode panel and the replay (frame 1f, FR-VIS-03/04), which are another change. Here the Watch/Do it yourself switch takes the Watch content as a prop and shows it when Watch is on. "Replay disabled until answered or skipped" (frame 1g) is met by a `onProceed` callback that fires only after Lock in or Skip; the screen that owns the replay uses it. "Replay that step" in the reveal is likewise a callback with the trace step index.
3. **Assumed, not blocking: what the student predicts (FR-VIS-05).** FR-VIS-05 lists three predictions: which node becomes unbalanced, which of the four cases applies, and the new root. Frame 1g draws only the first. I support all three through one question model, because all three are read from the engine's insert trace. The frame 1g option list is the nodes on the insertion path plus "None"; the tree can also be clicked to choose any node. Prompt and reveal wording is not in the ID; it is flagged for the user to read.
4. **Note: wireframe heights (D2).** Frame 1h's numbers (h4 for the root, "bf −2 at 20") use the old height convention and a tree that does not match its own caption. The app shows only engine values (leaf 0, empty -1), so the specs use hand-checked trees, not the wireframe's numbers. `docs/design/INDEX.md` already lists this fix.
5. **Note: engine capability is in flight.** `add-avl-insert-trace` is still open on `avl-engine`. This change adds no delta to `avl-engine` or `tree-view`: new logic goes in new files under `src/practice/` and imports the engine as it is, so the one-change-per-capability rule holds.

## Why

C5 and C6 (LO6, LO7) ask students to predict, watch, then do. Frame 1g has them commit to a guess before a replay, and frame 1h has them perform the rotation themselves. Without these, the explore screen is passive, and FR-VIS-05 and FR-VIS-06 (both Must) have no UI.

## What Changes

- **Predict first.** A prompt before a replay asks the student to predict (first unbalanced node, the case, or the new root), with "Lock in & watch" and "Skip, just watch". After the replay a reveal compares the guess with the engine's result in neutral words, explains any difference and links to the step. The answer is computed from `avlInsertTrace`, never typed.
- **Watch or Do it yourself switch.** A two-option switch. Do it yourself shows the tree after a plain BST insert (the state before rebalancing) and a task prompt that says how many rotations are needed.
- **Rotation menu.** Select a node (click, tap, Enter), then choose Rotate left, Rotate right or Cancel; R, L and Esc work when focus is in the practice area. A rotation with no child to lift gives a specific message and leaves the tree unchanged.
- **In-order strip.** The in-order key sequence, computed from the tree, so the student sees that rotations never change it.
- **Undo and reset.** Undo steps back one rotation (button and Ctrl/Cmd+Z); Reset returns to the start tree.
- **Feedback on a rotation.** Balanced, still unbalanced, or leaning the other way, each computed from the new tree, in "not quite yet" wording, never red, never counted.
- Serves FR-VIS-05 (Must), FR-VIS-06 (Must), FR-VIS-10 (Must, tap-then-tap, 44 px), FR-VIS-09 and FR-VIS-07 (by reusing `TreeView`). Learning outcomes LO6 (C5) and LO7 (C6).

## Capabilities

### New Capabilities
- `predict-first`: the prediction question, its engine-computed answer, the prompt and the reveal.
- `do-it-yourself`: the mode switch, the student-performed rotation and its validation, the rotation menu, the in-order strip, undo and reset, and rotation feedback.

### Modified Capabilities
None. `TreeView` is used through its existing props (`interactive`, `roles`, `selectedKey`, `onSelect`) and the engine through its existing exports.

## Out of scope

Step controls, speed, step back and the pseudocode panel (FR-VIS-03/04, frame 1f); the Representation switcher and Read aloud; the worked-example screen, its breadcrumb and where examples come from; generated problems and seeded retries (D9); scaffolding and the check variants (frames 1i to 1m); redo; deletion rotations; storing predictions (question 1); readiness (practice never counts toward it, frame 1h note 3); the sandbox. `TreeView`, `avl-engine` and `app-shell` are not changed.

## Impact

- New: `src/practice/predict.ts` and `src/practice/rotate.ts` (pure logic); `src/ui/practice/` (PredictPrompt, PredictionReveal, ModeSwitch, RotationMenu, InOrderStrip, FeedbackPanel, DoItYourself, stylesheet); `src/content/practice.ts` (wording, flagged).
- New tests: `tests/practice/predict.test.ts`, `tests/practice/rotate.test.ts`, `tests/ui/predict-first.test.tsx`, `tests/ui/do-it-yourself.test.tsx`.
- No new dependencies. Reuses `analyseTree`, `isOutOfBalance`, `caseFor`, `leanOf`, `avlInsertTrace`, `insert` and `TreeView`.
