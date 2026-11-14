# Design

## Context

A1 (`revamp-tree-view`) is merged on this branch. `TreeView` now takes the optional props `slots`, `transitionMs` (default `TREE_TRANSITION_MS` = 300 in `src/ui/tree/motion.ts`), `announce` and `overlay`, and it snaps under reduced motion.

`ReplayPlayer` (`src/ui/replay/`) currently renders, in this order: tree, `StepControls`, `PseudocodePanel`, `StepExplanation` (the live sentence) and a help line. It passes none of the A1 props.

The D23 step strip is `src/ui/module/ControlStrip.tsx`. It is outside this change.

`RepresentationSwitcher` is a placeholder in `src/ui/stubs/`, with the contract `{ primary, shown, onToggle }` in `src/ui/contracts.ts`.

Module steps carry `primary` but no `supporting`.

The decisions here follow proposal questions 1 to 11.

## Goals / Non-Goals

**Goals:** screen 1f's tree, caption and control order; stable sliding steps; the D23 two-sided replay strip with Replay; an inverted current line; a working switcher with 1h's mode group; D19-clean replay wording; every quality-bar line testable.

**Non-Goals:** editing the module strip, the tree view, the practice components, the replay reducer or the module schema; read aloud; new tokens.

## Decisions

1. **Player structure.**

   ```
   <div class="replay" onKeyDown>              (keys scoped here, unchanged)
     [RepresentationSwitcher]                  only when `representations` is given and `shown` is not
     <TreeView slots transitionMs />           no announce, no overlay
     <Caption sentence visited? />             role=status, aria-live=polite (new file Caption.tsx)
     <StepControls … onReplay />
     [PseudocodePanel]                         when 'pseudocode' is shown
     [StepExplanation]                         when 'text' is shown: heading "The whole tree" + describeTree paragraph, not live
     <p class="replay-help">                   unchanged
   ```

   `StepExplanation` keeps its name and file, so the contract export stays valid. It changes from a live sentence to the visible whole-tree paragraph (props `{ description: string }`). It is not a disclosure, because the tree view already has its own "Describe tree" button. Its only caller is `ReplayPlayer` (checked 14 Nov).

   *Alternative considered:* keep the sentence in `StepExplanation` and add a separate caption. That gives two copies of the same sentence and two live regions.

2. **What is shown.**

   ```
   shown = props.shown ?? state.shown ?? ALL
   ```

   - `state.shown` is initialised from `representations` as `[primary, ...supporting]`, with `animation` mapped to `diagram`.
   - It resets when the trace changes, using the same "adjust while rendering" pattern the player already uses for `reset`.
   - `ALL` = `['diagram', 'text', 'pseudocode']` keeps today's behaviour for callers that pass nothing.
   - The tree and the caption ignore `shown`. They are the D22 floor.

3. **RepresentationSwitcher** (`src/ui/replay/RepresentationSwitcher.tsx`). Props:

   ```
   primary: Representation
   shown: readonly Representation[]
   onToggle(r): void
   mode?: { value: 'watch' | 'do'; onChange(v): void }
   task?: string
   ```

   - **Show group.** A `fieldset` with legend "Show". It holds one native checkbox inside a 44 px label for each of `BOXES = ['diagram', 'text', 'pseudocode']`. The locked box is `primary === 'animation' ? 'diagram' : primary`. That box is `checked disabled`, with a visible "main" tag (text, not colour).
   - **Mode group.** A second `fieldset` with legend "Mode" and two radios.
   - **Task.** The task text, aligned to the end of the bar from 768 px.
   - Labels come from `replayCopy.switcher`. There is no Read aloud entry; change 24 adds one to `BOXES` with its own flag.
   - As approved in question 10, the contract becomes `ComponentProps<typeof RepresentationSwitcher>`, and the stub and its index line go.

4. **Stable steps.**
   - `slots`: `useMemo(() => inOrderKeys(treeAt(start, trace, trace.length)), [trace])`. For a search, the final tree is the start tree.
   - `transitionMs`: `Math.min(TREE_TRANSITION_MS, replayCopy.baseMs / speed / 2)`.
   - Both are read from existing exports (`treeAt`, `TREE_TRANSITION_MS`). An `inOrderKeys` helper lives in `src/ui/replay/`, unless the engine already exports one; the implementer checks before adding it.
   - Reduced motion needs nothing here: `TreeView` snaps, and `replay.css` keeps no transitions.

5. **StepControls.**
   - Two `role="group"` containers named "Replay navigation" and "Progress and speed", inside the existing outer group.
   - New `onReplay` prop. The player implements it as `dispatch({ type: 'reset', length })` and then `dispatch({ type: 'toggle' })`. Both actions already exist, so `src/replay/` is untouched.
   - Layout is a flex row with `justify-content: space-between`. It wraps to a column below 768 px with the existing allowed query.

6. **PseudocodePanel.**
   - `.pseudo-line[aria-current='step']` uses `background: var(--text-primary); color: var(--bg-surface)`. The number and the case pill inherit `currentColor` on that line.
   - The case text is `copy.caseLabel(conventionsWording().caseName(c))`, so `caseLabel` takes a name and not a code.
   - The test-writer adds the inverted pair to the contrast test in `tests/tokens.contrast.test.ts`. The pair is the same as body text on a surface, so it passes.

7. **Content (content-author, flagged beyond the ID).**
   - New entries in `replayCopy`: `switcher.{show, mode, watch, doIt, main, diagram, text, pseudocode}`, `controls.replay`, `controls.iconReplay`, `controls.navGroup`, `controls.progressGroup`, `captionLabel`, `wholeTree`.
   - The help line gains Replay.
   - `sentence.imbalance` and `sentence.rotation` take `caseName: string`, and the range comes from `rangeText`.
   - `pseudocode.insert` line 3 is built from `num` over the out-of-range values derived from `BALANCE_RANGE`. The listing becomes a computed `readonly string[]`, so the engine's line numbers are unchanged.
   - `playerCopy.hint` becomes "Hint, n left" (question 2).

8. **Tests for state and motion** reuse A1's harness from `tests/ui/tree-motion.test.tsx`: fake timers, stubbed `requestAnimationFrame` and `matchMedia`. The positions are read from the drawn node transforms. The visual test drives the C6 Worked example route at the three widths.

## Test hooks (fixed by the red tests, 14 Nov 2026)

The red tests pin these names. The implementer and content-author build to them, and they do not edit the tests.
- **Caption:** `<p class="replay-caption" role="status" aria-live="polite">`, the next sibling of the tree view. It is the only `role="status"` outside `.tree-view`.
- **Strip:** the outer group keeps the name "Replay controls" and has exactly two direct `role="group"` children with different names. The navigation group's buttons read Back, Play or Pause, Step, Replay. `.replay-controls` stacks by default, and from `@media (min-width: 768px)` it uses `justify-content: space-between` or `flex-direction: row`.
- **Content keys:** `replayCopy.controls.replay === 'Replay'`, plus `controls.navGroup` and `controls.progressGroup` (distinct strings). The help line contains the play, pause, step and speed labels.
- **Switcher:** a group whose name starts with "Show", with three checkboxes named Diagram, Text and Pseudocode in that order. The locked box's `<label>` contains the word "main". The label class sets `min-height: var(--target-min)`. The Mode group's name starts with "Mode", with radios named exactly "Watch" and "Do it yourself".
- **Whole-tree text:** a heading named exactly "The whole tree", inside a `section` or `div` that holds the `describeTree` text. It is not in a `details` element and not live.
- **Panel:** the case text stays in `.pseudo-case` and contains `caseName(c)`. The current line uses `background: var(--text-primary); color: var(--bg-surface); font-weight: 700`.
- **Stylesheet:** checkbox and radio states are written with `:has(input:checked)` and `:has(input:disabled)` (or `input:checked` and `input:disabled`). There are no `transition` or `animation` declarations in `replay.css`.
- **Hint:** the hint button's text contains the number and the word "left" (for example "Hint, 2 left").
- **Insert listing line 3:** built with `conventionsWording().num` on the out-of-range values (+2 and −2 today).

## Risks / Trade-offs

- **Changing `StepExplanation`'s props is a contract change.** Mitigation: it has one caller (checked), and contracts re-export the props, so the type follows.
- **The caption can exceed two lines at 390 px** (the imbalance sentence is about 150 characters). The spec bounds it as at most two *sentences*. The polisher keeps it at 66ch and never clamps the text.
- **Sliding is now on by default in every replay.** Every replay caller gets it, and the only way to turn it off is the student's reduced-motion setting. A per-screen opt-out would be one more optional prop, not added now.
- **Defaults reach no real screen until the schema follow-up.** Until then, module replays show everything, as today. The switcher is exercised by tests and by any caller that passes `representations`.

## Migration Plan

No data or storage change. All new props are optional. Rollback is a revert of `src/ui/replay/**`, the content files, and the contract and stub edits.

## Open Questions

The user answered questions 10 and 11 on 14 Nov 2026 (both yes). Only the NFR-03 ID is still to confirm (question 12), and it does not block the build. Follow-ups:
- (a) a base change that adds `supporting` to `Step` and passes representations from `InsertReplay` and `ModulePlayer`;
- (b) a practice-lane change in which `ModeSwitch` hosts the switcher with `mode`, so it stays in Do it yourself (1h).
