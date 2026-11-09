# Proposal

## Open questions

1. **Assumed, not blocking: trace part of the delete scenario is deferred.** The main spec's "AVL delete" scenario says both rebalancing steps "appear in the trace". Traces for insert and delete belong to `add-operation-trace` (not started). Here the result lists every rebalance, in order, with its case and node, and the scenario is reworded from "in the trace" to "reported". `add-operation-trace` puts the trace wording back. Same pattern as `avlInsert`.
2. **Assumed, lecturer to confirm (D4, lecturer question 3): the tie case.** When the taller child of an unbalanced node is itself balanced (possible only on delete), SE §6.4 says use a single rotation. I label it by which way the unbalanced node leans: LL when left-heavy, RR when right-heavy. A lecture that names this case separately (for example "R0") would need the label changed in the conventions module only. Which deletion cases the lecture covers is still an open lecturer question.
3. **Settled by the SE, recorded here: two-children delete** takes the in-order successor (SE §6.4), as plain `remove` already does. The rule is not changed.
4. **Assumed, not blocking: names.** `avlDelete(tree, key)` returns `{ tree, deleted, rebalances }`, with `rebalances` ordered from the lowest node upward. Missing key: tree unchanged, `deleted` false, no rebalances. The result shape widens with `add-operation-trace`.
5. **Priority note.** FR-ENG-08 is "Should", and D4 puts deletion (C7, LO8) in scope with LO8 never blocking Ready.

No `[OPEN]` items block the specs.

## Why

C7 and LO8 need students to see deletion keep a tree balanced, including the case that insert never produces: more than one rebalance on the way up. The engine has plain delete and the rebalance step, but no delete that rebalances, so deletion practice and marking cannot be engine-computed.

## What Changes

- Add `avlDelete`: BST delete, then walk back up the deletion path, recompute heights and rebalance at every node whose balance factor is +2 or -2.
- Report every rebalance (case and node), lowest first.
- Reuse the existing `rebalance` step (single or double rotation, with the tie rule already in place).
- Serves FR-ENG-08 (Should), NFR-08 in part (in-order preserved, balance factors in range after each delete), LO8 (C7), engine side only.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `avl-engine`: modifies "AVL delete" (existing text kept, scenarios made testable and extended) and adds "AVL delete rebalancing cases" for the single, double and tie cases and the invariants.

## Out of scope

Traces for delete and insert, and the replay property (`add-operation-trace`); the pseudocode text and panel for delete; any UI, content, readiness or LO8 gating logic; the D13 figure; changes to plain `remove`, `rebalance` or `avlInsert`.

## Impact

- New: `avlDelete` and its result type in `src/engine/avl.ts`, exported through `index.ts`; tests in `tests/engine/avl-delete.test.ts`.
- Unchanged: `bst.ts`, `rotations.ts`, `conventions.ts` and all existing tests. No new dependencies. No other change is in flight on `avl-engine`.
