# Design

## Context

`src/engine/` has `conventions.ts`, `tree.ts` (`makeNode`, `height`, `balanceFactorOf`), `bst.ts` (`insert` returning `{ tree, inserted }`, `search`, `remove`), `rotations.ts` (`rotateLeft`, `rotateRight`) and `validity.ts` (`checkAvl`). Nodes are immutable and `makeNode` derives the stored height, so any tree built through it always has correct heights. SE §6.2 suggests `avl.ts` and `trace.ts`; SE §6.3 gives `TraceStep` and `OperationResult`; SE §6.4 gives the insert algorithm. Motivation: see proposal.md.

## Goals / Non-Goals

**Goals:**
- One trace contract that AVL delete and search can reuse later without changing insert traces.
- Every snapshot is a whole tree from the root, so the UI never stitches subtrees together.

**Non-Goals:**
- Trace for `remove` and `search` (their result types stay as they are).
- Any memory optimisation of snapshots (15-node cap, SE §6.4).

## Decisions

- **Files.** `src/engine/trace.ts`: `TraceStep`, `StepKind`, `OperationResult`, `replay`, `INSERT_PSEUDOCODE` (line table). `src/engine/avl.ts`: `insertAvl`. `bst.ts` `insert` gains a trace. Export both from `index.ts`. Alternative of putting the trace inside each operation file rejected: delete and search need the same types.
- **Types as in SE §6.3, unchanged.** `kind` keeps all nine values, including `descend`, `delete` and `not-found`, though insert uses only `compare`, `found`, `insert`, `update-height`, `imbalance`, `rotation`. `descend` is left for search (FR-ENG-09), where "move to child" is its own animated step; for insert, one `compare` step per visited node is enough. `OperationResult` is `{ tree, trace, inserted? }`.
- **Case names.** `avl.ts` reads the four names from `REBALANCE_CASES` by position at call time (`const [LL, RR, LR, RL] = REBALANCE_CASES`), so it never spells a name and a mocked or edited `REBALANCE_CASES` relabels every step (FR-ENG-10, spec scenario "Case labels come from the conventions module"). `conventions.ts` only gains a comment stating that the order is the contract. A lookup object built inside `conventions.ts` was rejected during apply: it would be computed from the module's own binding, so a test overriding `REBALANCE_CASES` could not see the labels change.
- **Case selection by heights, not by sign.** The taller child y and the direction y leans are found by comparing child heights, so case selection does not depend on the balance-factor sign (D2, lecturer to confirm). Taller left, y leans left or level: LL; taller right, y leans right or level: RR; taller left, y leans right: LR; taller right, y leans left: RL. (y level cannot happen on insert but the rule is total, ready for delete.) Imbalance is detected as |balance factor| > 1, which is sign-independent too.
- **Building snapshots.** Insert first records the path from the root (keys plus directions). Each stage builds a whole new tree by rebuilding the path from the changed subtree up to the root with `makeNode` (a small `rebuildPath(path, subtree)` helper in `avl.ts`). So:
  - `compare` and `found` steps: `before === after` (same reference) = the input tree.
  - `insert`: after = input tree with the new leaf. Because `makeNode` derives heights, all heights in this snapshot are already correct.
  - `update-height` steps walk back up from the new leaf's parent to z (or to the root if nothing is unbalanced), one per node, with `before === after`. They exist to drive the step-by-step narration and the pseudocode highlight, not to change the tree; the UI reads the height from the snapshot. Alternative rejected: snapshots with stale heights, which would let a tree in a trace disagree with `makeNode` and complicate `replay`.
  - `imbalance`: `before === after`, `nodes: [z, y]`, label set.
  - `rotation`: one step per single rotation. Single case: `nodes: [z, y]`. Double case: first step at y (`nodes: [y, x]`, where x is y's taller child), then at z (`nodes: [z, x]`); both labelled with the double case. Each after tree is the whole tree with the rotated subtree reattached.
- **Stop after the fix.** After the rotation no further steps are emitted (SE §6.4 step 5); ancestors above z keep their heights by the AVL property, and `makeNode` already recomputed them when the snapshot was rebuilt.
- **Plain insert trace.** `compare` per node, then `insert` (or `found` on a duplicate). Same `rebuildPath` helper, imported from a shared internal module rather than duplicated.
- **Replay.** `replay(start, trace)` walks the steps, checks that each `before` deep-equals the current tree (throws with the step index if not), moves to `after`, and returns the final tree. A trace of length 0 returns `start`. This tests FR-ENG-06 and gives step-back in FR-VIS-03 a single source.
- **Pseudocode lines.** `INSERT_PSEUDOCODE` is an exported readonly array of five entries matching the C6 steps (1 BST insert, 2 update heights going up, 3 find the lowest unbalanced node, 4 work out the case, 5 rotate). Mapping: `compare`, `found`, `insert` → 1; `update-height` → 2; `imbalance` → 3 (the case label on that step covers step 4 for display); `rotation` → 5. Line 4 has no step kind of its own; the UI can show it with the imbalance step. Pending proposal open question 2; the table text is not shown to students until the content author fills it from the ID or the lecturer.
- **Tests.** `tests/engine/avl-insert.test.ts` (FR-ENG-04, FR-ENG-07), `tests/engine/trace.test.ts` (FR-ENG-06), each test named after its FR. fast-check properties: AVL validity, sorted in-order, at most one `imbalance` step per insert, replay equals result, snapshot chain, input tree unchanged (deep-frozen copy compared).

## Risks / Trade-offs

- [Changing `bst.ts` insert's return type] → the new type is a superset (`tree`, `inserted` kept), so existing tests and `tests/engine/helpers.ts` keep compiling.
- [Case-name decision changes (D2)] → only `REBALANCE_CASES` changes; tests read labels from the conventions module.
- [`update-height` steps with identical before and after look odd in a replay] → the UI narrates them from `nodes` and the snapshot height; if the UI change needs a height field, it is an additive widening of `TraceStep`.
- [Pseudocode numbering overturned by open question 2] → numbering lives in one table and one kind-to-line map; tests read the map, so a change is one edit.
- [Delete may need a step kind insert does not, such as "successor"] → widen `StepKind` in that change; insert traces are unaffected.
