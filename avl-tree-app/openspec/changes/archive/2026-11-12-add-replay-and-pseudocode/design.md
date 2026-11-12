# Design

## Context

See proposal.md for why and the assumptions. The engine already gives everything a replay needs: `avlInsertTrace` and `searchTrace` return steps with immutable `before` and `after` snapshots, `nodes`, `rebalanceCase` and `pseudocodeLine`; the line maps `INSERT_LINES`, `LOOP_LINES` and `RECURSIVE_LINES` are exported; `replay()` reproduces a prefix. `TreeView` is controlled and draws whatever tree and roles it is given, reading heights from the snapshot as stored, so a mid-trace snapshot is drawn and described as the engine left it. The practice parts leave a `watch` slot in `ModeSwitch`, an `onProceed` callback on `PredictPrompt` and an `onReplayStep(stepIndex)` callback on `PredictionReveal`. `src/engine/`, `src/ui/tree/` and `src/ui/practice/` belong to other capabilities and are not edited.

## Goals / Non-Goals

**Goals:**
- One pure module owns position, playback and speed, so step back and bounds are property-tested without React.
- The tree, roles, sentence numbers, highlighted line, case and step count are all read from the trace. Content files hold wording and listings only.
- Every control works by keyboard, touch and pointer, scoped so the shortcut keys never fire outside the player.

**Non-Goals:**
- Node sliding animation, delete replay, the representation switcher, "be the algorithm" search, placing the player on a module screen (see the proposal's Out of scope).

## Decisions

1. **New folders `src/replay/` (logic) and `src/ui/replay/` (components).** Mirrors `src/practice/` and `src/ui/practice/` from the predict change. Alternative: put the reducer in `src/engine/`. Rejected: the engine is UI-free trace logic owned by `avl-engine`, and playback speed is a UI concern.

2. **Position, not step index, is the state.** `ReplayState = { position: 0..n, playing: boolean, speed: 0.5 | 1 | 2, held: boolean }` with actions `step`, `back`, `play`, `pause`, `toggle`, `tick`, `setSpeed`, `slower`, `faster`, `jumpTo(stepIndex)`, `hold(boolean)`, `reset`. `treeAt(start, trace, p)` returns `start` at 0 and `trace[p-1].after` otherwise. Reading the snapshot (not calling `replay()` at each position) is O(1) and is what the engine's own tests already prove equal to `replay()`; the property test in the spec checks it again. Alternative: store the current tree and undo stack. Rejected: snapshots make undo free (SE §6.4).

3. **One interval in the player, driven by the reducer.** A `useEffect` keyed on `playing` and `speed` sets one `setInterval(BASE_MS / speed)` that dispatches `tick`; `tick` advances, sets `playing = false` on reaching n, and is ignored while paused or held, so Pause never races a pending tick. A speed change restarts the interval from that moment. Alternative: a `setTimeout` per position. Rejected during apply: the next timeout is only scheduled after React commits, so timing depends on render scheduling (seen with fake timers). `BASE_MS = 1200` lives in `src/content/replay.ts` next to the speed labels, flagged.

4. **Operation in, traces computed inside.** `ReplayPlayer` takes `operation: { kind: 'insert', tree, key } | { kind: 'search', tree, key }`, plus `held?: boolean`, `showStep?: { index: number; nonce: number }` and `label`. It calls `avlInsertTrace` or `searchTrace(tree, key, form)` in a `useMemo`, so a screen can never pass a trace that does not match its tree, and the loop/recursive switch can recompute. A change of tree, key, kind or form dispatches `reset`. `showStep` carries a nonce so pressing "Replay that step" twice for the same index still jumps. Alternative: an imperative `ref.jumpTo`. Rejected: props keep the player controlled and testable.

5. **Derived views are pure functions in `src/replay/replay.ts`.**
   - `rolesAt(trace, p)`: new from the insert step on; z and y from the latest imbalance step at or before p − 1 while the step at p − 1 is imbalance or rotation.
   - `visitedAt(trace, p)`: count of `compare` steps in `trace.slice(0, p)`.
   - `explainAt(op, trace, p)`: a tagged value (`{ tag: 'start' | 'compare' | 'descend-left' | 'descend-right' | 'descend-none' | 'found' | 'not-found' | 'insert' | 'duplicate' | 'height' | 'imbalance' | 'rotation', keys, numbers }`) with heights and balance factors read with `balanceFactorOf` from the step's `after`. Descend direction comes from comparing the operation key with `nodes[0]`; rotation direction from `pivot < at` as in `replay()`. Templates in `src/content/replay.ts` turn tags into words. Same split as `compare()` in the predict change, so a table test covers each tag and a wording scan covers every template.

6. **Pseudocode listings are data in `src/content/pseudocode.ts`.** `{ insert: string[5], searchLoop: string[7], searchRecursive: string[5] }`, one string per line, line k at index k − 1. The loop and recursive text is the layout already written in `src/engine/search.ts`; the insert outline paraphrases SE §6.4 / ID C6. A test checks every engine line number fits its listing. `PseudocodePanel` takes `listing`, `line: number | null`, `rebalanceCase?` and an optional form switch; it is stateless.

7. **Keyboard handling on the player container.** One `onKeyDown` on the player root, as in `DoItYourself`. Arrow keys and brackets are handled and `preventDefault`ed. Space is handled on keydown (with `preventDefault`) and also `preventDefault`ed on keyup, so a focused button does not also turn it into a click; this gives one toggle per press wherever focus is in the player. Events from the form radios are left alone, so their arrow and Space keys work as usual. Keys with Ctrl, Alt or Meta pass through. `TreeView` here is read-only (`role="img"`, no focusable nodes) so its arrow keys do not compete; its scroll region is focusable and arrow keys there step the replay rather than scroll, which is accepted (the region still scrolls by pointer, touch and Tab-then-scrollbar) and flagged for the a11y-checker.

8. **Controls markup.** Back, Play/Pause and Step are `<button>`s whose text is the word with the glyph in an `aria-hidden` span (⏮, ▶ / ⏸, ⏭). Speed is a group of three toggle buttons with `aria-pressed`, labelled "Speed". Progress is a native `<progress value max>` with an accessible name, beside the "Step p / n" text. When held, Play and Step get `disabled` and a short note says to answer or skip the prediction first.

9. **Live region.** `StepExplanation` is a `<p aria-live="polite">` that is always mounted (so the first update is announced) and whose text changes with the position. The search count ("Nodes visited: 2") sits in the same block as text. Colour is never used for these.

10. **Styles.** `src/ui/replay/replay.css` uses tokens only: `--code-highlight` and `--text-primary` with bold for the current line, `--type-mono` for listings, `--target-min` for buttons, `--space-*` and `--radius-md`. Controls wrap with `flex-wrap` so 360 px needs no sideways page scroll. No transitions are added, so reduced motion needs nothing extra.

## Risks / Trade-offs

- [Insert listing is an outline, not code, and differs from frame 1f] → listing text is one content file; the line map is the engine's. Flagged in the proposal (question 2) for the lecturer.
- [Mid-trace snapshots show stale heights for ancestors until their update-height step] → this is how the engine models the walk back up; sentences and the drawing both read the same snapshot, so they never disagree. The predict-first reveal already relies on this.
- [Fast replay floods screen readers] → polite region; at 2× a step lasts 600 ms, so some sentences may be cut. Stepping by hand always gives the full sentence. Ask the a11y-checker.
- [Arrow keys in the tree's scroll region step the replay] → Decision 7; revisit if the a11y review objects.
- [`--type-mono` is 15 px, under the 16 px running-text rule] → the design system sets it for code; flagged in the spec rather than overridden.
- [1200 ms is a guess] → one constant in content; pilot timing can tune it.

## Open Questions

- Whether the lecturer wants Java or Python listings (D12). Only `src/content/pseudocode.ts` would change, and the engine's line maps if the line count changes.
