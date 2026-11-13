# Design

## Context

`src/engine/avl.ts` has `rebalance` (classifies and rotates one node) and a recursive `avlInsert` returning `{ tree, inserted, rebalance }`. `trace.ts` declares `TraceStep` (SE §6.3) with all nine kinds; only `searchTrace` produces steps. `makeNode` always derives the stored height from the children, and `rotateLeft`/`rotateRight` build with it. Trees are at most about 15 nodes in the UI. Motivation and open questions: proposal.md. Behaviour: specs/avl-engine/spec.md.

## Goals / Non-Goals

**Goals:**
- An insert trace detailed enough for C6: the walk down, each height update, z and y, the case and each single rotation.
- A replay that checks the snapshots, so FR-ENG-06 is tested for real and not by reading the last `after`.

**Non-Goals:**
- Changing `avlInsert`, `rebalance` or the rotations. A delete trace. A shared `OperationResult` type.

## Decisions

- **Separate `avlInsertTrace(tree, key)` in `avl.ts`, beside `avlInsert`.** It returns `{ tree, inserted, rebalance, trace }`. It is iterative: walk down recording the path, attach the leaf, then walk the path back up. That order matches the step order directly, which a recursion that builds on return makes awkward. It calls `rebalance` on the subtree at z, so case choice and rotations stay in one place. Alternative of adding `trace` to `avlInsert`: rejected because the generators call `avlInsert` many times and do not need snapshots, and changing its result would touch existing tests. Drift between the two is caught by the agreement property test.
- **Whole-tree snapshots.** Each step's `before` and `after` are the root, so the UI never reattaches a subtree itself. A helper rebuilds the path from a changed node to the root. At 15 nodes and about 20 steps this is cheap, and unchanged subtrees are shared.
- **Stale heights in intermediate snapshots (proposal, question 2).** The path rebuild after the insert and after each update-height uses node literals that keep each ancestor's old stored height, not `makeNode`. Each update-height step then sets one node's height with `nodeHeight` from the conventions module. Rotations use `rotateLeft`/`rotateRight` unchanged; their children are already up to date, so `makeNode` gives correct heights. The final tree passes the existing "stored heights match real heights" check.
- **Step keys.** compare `[node]`; descend `[from, to]` or `[from]` at an empty child (the search grammar); insert `[k]`; found `[k]`; update-height `[node]`; imbalance `[z, y]` with `rebalanceCase`; rotation `[at, pivot]` with `rebalanceCase`. For LR the rotations are `[y, x]` then `[z, x]`; for RL the same with sides swapped. The `index` order is the only order.
- **Rotation direction is not stored.** It follows from BST order: pivot key less than the node's key means a right rotation. This keeps SE §6.3's type unchanged, as the search change did for descend direction.
- **Line map `INSERT_LINES` in `avl.ts`,** keyed by step kind: compare, descend, found and insert 1; update-height 2; imbalance 3; rotation 5. Line 4 is unused for now (question 1). Kept in the engine, not in content, as for search.
- **`replay(start, trace)` in `trace.ts`.** A loop over steps by kind: compare, descend, found, not-found and imbalance change nothing; insert attaches a leaf at its BST place keeping ancestor heights; update-height recomputes one node's stored height from its children; rotation rotates at the named node in the direction above; delete throws (not yet traced). It never reads `before` or `after`. It needs a small path-copy helper shared with `avlInsertTrace`; that helper lives in `tree.ts` so neither module depends on the other.
- **Tests.** `tests/engine/avl-insert-trace.test.ts` (names prefixed `FR-ENG-04` or `FR-ENG-06`, LO7 noted) and `tests/engine/trace-replay.test.ts` (`FR-ENG-06`). Hand-worked trees are built with the existing `avlInsert`. Property tests use fast-check over distinct key sequences of up to 15 keys. Line numbers are asserted through `INSERT_LINES` by purpose, with one scenario pinned to numbers.

## Risks / Trade-offs

- [Line map may change after the lecturer's answer] → one constant; tests refer to it by purpose.
- [Stale-height snapshots could confuse a UI that trusts stored heights] → that is the point of the update steps; the UI change must draw stored heights from the snapshot. Recorded here for that change.
- [Two insert implementations] → agreement property test over random trees and keys, including duplicates.
- [Replay and the engine share the path helper, so a helper bug could hide in both] → hand-worked scenarios pin exact trees independently of the helper.
