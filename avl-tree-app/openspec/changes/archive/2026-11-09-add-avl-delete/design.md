# Design

## Context

`src/engine/avl.ts` already has `rebalance(tree)`, which detects an out-of-range balance factor at a node, classifies LL/RR/LR/RL and applies the single or double rotation. It already treats a balanced taller child as a single rotation (the tie rule), written for delete but untested until now. `bst.ts` has plain `remove` (two children: in-order successor). `avlInsert` returns `{ tree, inserted, rebalance }`. SE §6.4 describes AVL delete. Motivation: proposal.md.

## Goals / Non-Goals

**Goals:**
- `avlDelete` that is pure, immutable and reuses `rebalance` unchanged.
- Every rebalance on the path reported, in order.

**Non-Goals:**
- Traces, replay, pseudocode lines. Changing `rebalance`, `remove` or `avlInsert`.

## Decisions

- **One recursive delete, rebalance on the way back up, never stop early.** Unlike insert, a rotation after a delete can shorten its subtree, so each ancestor is rebuilt with `makeNode` and passed through `rebalance`, all the way to the root. Alternative of stopping when a subtree's height is unchanged rejected: it is an optimisation with a correctness argument to maintain, and trees here have at most about 15 nodes.
- **Two children:** take the minimum key of the right subtree, delete that key from the right subtree with the same recursive function (so rebalances inside the right subtree are reported), then rebuild the node with the successor key and rebalance it. The rebalances come out ordered lowest first: right subtree path, then the node, then ancestors.
- **Result:** `{ tree, deleted, rebalances: Rebalance[] }`, reusing the `Rebalance` type from `avl.ts`. A missing key returns the same tree reference, `deleted: false` and an empty list, and no ancestor is rebuilt (like plain `remove`).
- **Tie rule and labels unchanged:** `rebalance` already picks a single rotation when the taller child is balanced and labels it by the lean of the unbalanced node through `caseFor`; this change adds the tests that pin it (open question 2). No edit to `conventions.ts`.
- **Tests:** `tests/engine/avl-delete.test.ts`, names prefixed `FR-ENG-08`. Hand-built trees with `makeNode` for the scenario shapes (the two-step example is a 12-node tree whose shape is given in the spec), a fast-check property over AVL-built trees with present and missing keys, and a seeded delete-until-empty run. Invariants use `analyseTree` and `checkAvl`, plus an independent height check, as in the insert tests. The bound on rebalances is checked against the length of the search path to the deleted key (plus the successor path when it has two children).

## Risks / Trade-offs

- [Lecture names the tie case differently] → the label comes from the conventions module; open question 2.
- [Hand-built example mistakes] → the 12-node and other shapes were checked against an independent implementation while drafting; the tests build them by `makeNode` and assert the exact result shapes, so a mistake shows as a failing test, not a silent pass.
- [Result shape widens with traces] → `rebalances` stays a plain list; `add-operation-trace` wraps or extends it.
