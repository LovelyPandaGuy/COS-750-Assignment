# Proposal

## Open questions

No `[OPEN]` item blocks the specs. Items 1 and 2 are tied to open decisions and can change wording but not structure; items 3 to 6 are assumptions for the user to read.

1. **Pseudocode language and style (D12, lecturer question 2).** D12 is a default: generic pseudocode as in the ID, and the lecturer may ask for Java or Python. The SE document (§6.4) also says the lecturer should confirm the balance-factor sign and case names "before the pseudocode panel is written" (D2, lecturer question 1). This change keeps every listing in one content file (`src/content/pseudocode.ts`) with line numbers that match the engine's `LOOP_LINES`, `RECURSIVE_LINES` and `INSERT_LINES`, so a later language switch edits text only. The listings are flagged for the user to read.
2. **Insert pseudocode is the five-step outline, not line-level code (D12, add-avl-insert-trace question 1).** The ID has no line-level insert pseudocode, so the engine's `INSERT_LINES` uses the five steps of the C6 outline (1 BST insert, 2 update heights going up, 3 find the lowest unbalanced node, 4 work out the case, 5 rotate). Frame 1f draws line-level code (`if bf > 1 and key < node.left.key: return rotateRight(node) # LL`). The panel shows the outline the engine points at, because the highlighted line must be the engine's `pseudocodeLine`. Line 4 never lights on its own; the imbalance step lights line 3 and the panel names the case beside it. If the lecturer wants line-level code, the engine's line map changes first.
3. **Assumed: FR-VIS-04's "highlighted line equals the step's case".** Read as: the highlighted line is the step's `pseudocodeLine`, and on imbalance and rotation steps the panel also shows the step's `rebalanceCase` (LL, RR, LR, RL) as text beside that line. The automated check runs the panel over every insert and search trace the engine tests generate.
4. **Assumed: speed values and timing (FR-VIS-03, frame 1f).** Speeds 0.5×, 1× and 2× as drawn, default 1×. One step at 1× lasts 1200 ms. The figure is not in the ID or SE document and is flagged.
5. **Assumed: no sliding animation in this change (NFR-03, wireframe 1f note 2).** Each step redraws the tree from its snapshot; nodes do not slide between positions. This already meets "reduced motion: steps snap" and keeps `TreeView` (an archived capability) unchanged. Sliding transitions are a later change to `tree-view`.
6. **Assumed: where the replay lives.** The Explore activity screen is still a skeleton (`src/pages/Activity.tsx`), and `add-routing-and-screen-skeleton` and `add-module-framework` are open. This change builds a self-contained `ReplayPlayer` that takes a start tree and a trace, and plugs it into the existing `watch` slot of `ModeSwitch` and the `onProceed` / `onReplayStep` callbacks of the predict-first parts. Placing it on a module screen is the module-framework change's job.

## Why

FR-VIS-03 (step-by-step replay with play, pause, step forward, step back and speed) and FR-VIS-04 (pseudocode line in sync with the step) are both Must, and frame 1f is the core screen of every Explore and worked-example activity. The engine already returns traces with snapshots and pseudocode lines (FR-ENG-06, FR-ENG-09), and the predict-first change already leaves a Watch slot and a "Replay that step" callback waiting, but nothing plays a trace yet. Without this, C4 (search, D5) and C6 (insert, LO7) have no Watch mode.

## What Changes

- **Replay state (pure).** A reducer over a trace: position from 0 (the start tree) to n (after the last step), playing or paused, and speed. The tree shown at position i is the start tree or step i's `after` snapshot, so step back restores the previous tree exactly. Play stops at the end; jump to a step serves "Replay that step".
- **StepControls.** Back, Play/Pause, Step, a progress bar, "Step i / n" and a 0.5× / 1× / 2× speed group, as in frame 1f. Native buttons with text labels and 44 px targets. Space, ← / →, and [ / ] work while focus is in the player only (WCAG 2.1.4). Back is disabled at the start and Step at the end.
- **PseudocodePanel.** Shows the listing for the operation (insert outline, search loop or search recursive) and highlights the current step's `pseudocodeLine` with the `--code-highlight` background, bold weight and a ▶ marker (frame 1f draws it inverted; the design system's code-highlight token is used instead), so colour is not the only signal. On imbalance and rotation steps it names the case. The search panel can switch between the loop and recursive forms, which replays the matching trace (D5).
- **StepExplanation.** One sentence per step built from the step's kind, keys and the snapshot's heights and balance factors (engine values only), in a polite live region (FR-VIS-07). Calm wording, no red or fail words.
- **Roles per step.** The tree marks the new key from the insert step on, and z and y on the imbalance and rotation steps, using `TreeView`'s existing `roles` prop (FR-VIS-02).
- **Search step count.** The player shows a running count of nodes visited that reaches the engine's `steps` at the end (FR-VIS-11, step count part only).
- **ReplayPlayer.** Composes the parts above around a read-only `TreeView` and fits the `ModeSwitch` Watch slot.
- Serves FR-VIS-03 (Must), FR-VIS-04 (Must), FR-VIS-07 (Must, per-step live region), FR-VIS-02 (roles during replay), FR-VIS-11 (step count and step-by-step replay of found and not-found searches) and NFR-02. Learning outcomes LO5 (C4 search) and LO7 (C6 insertion).

## Capabilities

### New Capabilities
- `step-replay`: replay state over an engine trace, the step controls and keyboard keys, the per-step explanation and live region, roles during replay, the search step count, and the player that composes them.
- `pseudocode-panel`: the pseudocode listings, the highlighted line and case label that follow the current step, and the loop/recursive switch for search.

### Modified Capabilities
None. `TreeView` is used through its existing props (`tree`, `roles`, `label`), the engine through its existing exports (`avlInsertTrace`, `searchTrace`, `LOOP_LINES`, `RECURSIVE_LINES`, `INSERT_LINES`), and the practice parts through their existing props and callbacks.

## Out of scope

- Delete replay (FR-VIS-12): delete has no trace yet and `replay()` refuses delete steps.
- Sliding node animation and transitions (question 5); NFR-03 measurement.
- The RepresentationSwitcher (Diagram / Text / Pseudocode / Read aloud toggles) and Read aloud.
- "Be the algorithm" mode for search, where the student picks left or right (the other half of FR-VIS-11, D5).
- Placing the player on the Explore and worked-example screens, choosing examples, breadcrumbs (question 6).
- The sandbox's trace view (FR-VIS-08), "Add to lecture questions", storing replay events (D16).
- Java or Python listings (question 1).

## Impact

- New: `src/replay/replay.ts` (pure state, roles and explanation data); `src/ui/replay/` (ReplayPlayer, StepControls, PseudocodePanel, StepExplanation, stylesheet); `src/content/replay.ts` and `src/content/pseudocode.ts` (wording and listings, flagged).
- New tests: `tests/replay/replay.test.ts`, `tests/replay/pseudocode-sync.test.ts`, `tests/ui/step-controls.test.tsx`, `tests/ui/replay-player.test.tsx`.
- No edits to `src/engine/`, `src/ui/tree/` or `src/ui/practice/`. No new dependencies.
