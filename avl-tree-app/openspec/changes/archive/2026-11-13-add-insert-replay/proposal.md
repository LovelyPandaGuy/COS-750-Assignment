# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place; please read them before `/opsx:apply`.

1. **Note: what this change is (plan row 15b, D49).** When row 15 was split (12 Nov) the insert replay was listed as missing. It is not: `add-replay-and-pseudocode` built `ReplayPlayer` for AVL inserts (step controls, the insert outline, the step sentence), `PredictPrompt` and `PredictionReveal` (predict first, then compare, with "replay that step"), and `ModeSwitch` (Watch or Do it yourself). What is missing is a way for a module step to use them: the step `replay` only plays searches, and nothing composes predict, replay and reveal. This change is that framework piece. No student-visible screen changes until C6 uses it.
2. **Assumed, not blocking: the three ways a step can show an insert map onto the ID's C6 fading.** Watch only ("done for you"), predict first then watch ("guided"), and a Watch or Do it yourself switch ("on your own"). C6 chooses per step; this change does not write C6.
3. **Assumed, not blocking: predict-first composition (D33).** The prompt shows first and the replay is held (cannot play or step) until the student locks in or skips. When the replay reaches its end, the reveal compares the prediction with the engine's answer and "Replay that step" jumps the replay to the step that settles it. The prediction is practice: never stored, never marked (predict-first spec).
4. **Assumed, not blocking: insert facts.** A step that inserts a key records, from the engine, the key, whether a rebalance happened, the unbalanced node and the number of single rotations, and the height after. The case is kept in the facts but reaches text only through the conventions wording (D19). Inserting a key already in the tree is reported by the validator.
5. **Assumed, not blocking: Back and Next restart.** As with search replays, an insert step starts fresh each time it is shown: replay at the start, prompt with nothing chosen, Watch selected.

## Why

C6 (LO7) teaches insertion with rebalancing through worked examples that fade from done for you to guided to on your own, and every later module that shows an insert needs the same thing. The engine trace, the replay, the prediction prompt and the rotation tool all exist and are tested, but no module step can use them for an insert.

## What Changes

- **Insert replay in a step.** A step can name an AVL figure and a key to insert, and shows the existing replay of that insert with the insert pseudocode as its primary representation.
- **Predict first.** A step can ask for a prediction (which node becomes unbalanced, which case, or which root) before the replay; the replay waits, then the reveal compares and can jump to the deciding step.
- **Watch or Do it yourself.** A step can offer the existing switch, so the student can perform the rotation themselves on the same insert.
- **Insert facts.** The engine's result for the insert becomes facts the step text can use and the validator accepts.
- Serves LO7 (through C6); FR-VIS-03, FR-VIS-04, FR-VIS-05, FR-VIS-06; decisions D19, D22, D33.

## Out of scope

- C6 content and its fading sequence (`add-module-c6-insertion`).
- Changes to how the replay, prompt, reveal or rotation tool look or behave.
- Delete replays (needs a delete trace in the engine).
- Storing predictions (change 26 may log them).

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `module-framework`: a step's replay can play an insert as well as a search, optionally with predict-first or a Watch or Do it yourself switch, and insert facts are computed.

## Impact

- New: `src/ui/module/InsertReplay.tsx` (composes prompt, held replay, reveal and the mode switch).
- Changed: `src/modules/schema.ts` (`replay.insert`, `replay.predict`, `replay.doItYourself`), `src/modules/facts.ts` (insert facts), `src/modules/validate.ts` (insert numbers, duplicate insert as a source problem), `src/ui/module/ModulePlayer.tsx` (renders insert replays), `src/ui/replay/ReplayPlayer.tsx` (one optional `onPosition` callback; no visible change).
- Uses as they are: `ReplayPlayer`, `PredictPrompt`, `PredictionReveal`, `ModeSwitch`, `avlInsert`, `avlInsertTrace`, `predictionFor`.
- No new dependencies, no storage schema change, no network calls.
