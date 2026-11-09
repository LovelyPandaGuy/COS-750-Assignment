# Proposal

## Open questions

1. **Case names and balance-factor sign (D2, lecturer to confirm).** LL/RR/LR/RL come from the ID and SE §6.3 and are read from the conventions module (FR-ENG-10). Settled for building; unconfirmed by the lecturer. A change is a one-line edit there.
2. **Assumed, not blocking: how a rebalance is reported before traces exist (FR-ENG-06, spike S2).** `avlInsert` returns `{ tree, inserted, rebalance }`, where `rebalance` is `null` or `{ case, node }` (`node` is the key of the unbalanced node z). The trace change replaces or wraps this. Same pattern as `add-conventions-and-bst`.
3. **Assumed, not blocking: the name for the double-rotation steps.** A double rotation is exposed as two single rotations applied in order (SE §6.4), so tests and the later trace can show both steps.
4. **Scope split (your answer).** AVL delete (FR-ENG-08) is not here; it needs its own change because it can rebalance more than once.

No `[OPEN]` items block the specs.

## Why

The engine can build and rotate trees but cannot yet keep one balanced. AVL insert with case selection is the core of C5 and C6 (LO6, LO7) and of answer marking for the "pick the case" questions. D2 and the SE already settle the algorithm (SE §6.4).

## What Changes

- Add imbalance detection: find the lowest node whose balance factor is +2 or -2 on the insert path.
- Add case classification: LL, RR, LR, RL from the unbalanced node and its taller child.
- Add the correct single (LL, RR) or double (LR, RL) rotation, reattaching the rotated subtree to its parent on either side.
- Add `avlInsert`: BST insert, walk back up, stop after at most one rebalance; duplicate keys leave the tree unchanged.
- Serves FR-ENG-04 (Must), FR-ENG-07 (Should, the ascending 1 to 15 comparison), NFR-08 in part (in-order preserved, balance factors in range, at most one rebalance per insert). Learning outcomes: LO6, LO7 (engine side only).

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `avl-engine`: adds requirements for imbalance detection, case classification, rotation selection and the AVL/plain comparison, and modifies "AVL insert" (existing scenarios kept, result shape and detailed scenarios added). "Plain BST insert for comparison" stays as written. This change builds on `add-conventions-and-bst` (8 of 9 tasks done, not yet archived), which you will archive yourself.

## Out of scope

AVL delete and multi-step rebalancing (FR-ENG-08); traces, trace steps, replay and pseudocode line numbers (FR-ENG-06); search with trace (FR-ENG-09); any UI, content or storage; the tie case "taller child is balanced", which cannot occur on insert and belongs to delete.

## Impact

- New: `src/engine/avl.ts` (insert, classification, rebalance), exported from `src/engine/index.ts`; `tests/engine/avl.test.ts`.
- Reads, does not change: `conventions.ts`, `tree.ts`, `bst.ts`, `rotations.ts`, `validity.ts`.
- No new dependencies.
