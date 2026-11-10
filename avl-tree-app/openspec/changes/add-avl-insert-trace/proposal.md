# Proposal

## Open questions

1. **[OPEN] Insert pseudocode lines (D12, lecturer question 2).** The ID gives line-by-line pseudocode only for search (C4). For insert, C6 gives a five-step outline: BST insert, update heights going up, find the lowest unbalanced node, work out the case (LL, RR, LR, RL), rotate. I propose using those five steps as lines 1 to 5 of the insert panel: compare, descend, found (duplicate) and insert on line 1; update-height on line 2; imbalance on line 3; rotation on line 5. Line 4 (work out the case) gets no step of its own, because SE §6.3 puts the case on the imbalance step. Please confirm the outline is acceptable as "pseudocode", or say whether imbalance should light line 4 instead. Writing real line-level insert pseudocode would be content beyond the ID and needs your sign-off. The map is one constant, so the answer changes one file and no test logic.
2. **Assumed, not blocking: stale heights in the snapshots.** C6 and SE §6.4 say "update heights going up", one trace step per height update. For those steps to show anything, the snapshot after the insert step keeps the old stored heights on the ancestors, and each update-height step corrects one node. So an intermediate snapshot can have stored heights that differ from real heights (the analysis report already handles that). The final tree always has correct heights.
3. **Assumed, not blocking: step grammar.** The descent reuses the search grammar (compare, then descend, per node visited). Then: `insert [k]` at the empty child, or `found [k]` for a duplicate (trace ends, tree unchanged). Then one `update-height [node]` per ancestor, bottom up, up to and including z or, with no imbalance, the root. Then `imbalance [z, y]` with the case, then one `rotation [at, pivot]` for LL or RR and two for LR or RL, each with the case. Nothing after the rotation: the subtree is back to its old height (SE §6.4 step 5), so ancestors above z get no update-height step.
4. **Assumed, not blocking: names and result shape.** A new `avlInsertTrace(tree, key)` returns `{ tree, inserted, rebalance, trace }`. The existing `avlInsert` keeps its shape and is not changed; a test ties the two together, as `searchTrace` is tied to `search`. Unifying both into SE §6.3's `OperationResult` is left until delete also has a trace.
5. **Assumed, not blocking: replay.** FR-ENG-06's acceptance is "replaying the trace on the starting tree reproduces the final tree". A replay that just returns the last step's `after` would pass trivially, so `replay(start, trace)` re-applies each step from its kind and keys (attach a leaf, recompute one height, rotate at a node) without reading the snapshots, and the tests check it against the snapshots. Rotation direction is read from the keys: the pivot is smaller than the node for a right rotation. Delete steps are not replayable until the delete trace exists.
6. **Note: split from `add-operation-trace`.** `docs/next-steps.md` planned one trace change for insert and delete. This change covers insert and replay only; the delete trace follows as its own change so each stays near ten tasks.

No `[OPEN]` item blocks the specs; question 1 blocks only the pinned line numbers.

## Why

C6 and LO7 ask students to watch an insert happen: the path down, heights updating on the way up, the lowest unbalanced node, the case and the rotation. Prediction (FR-VIS-05), step replay (FR-VIS-03) and the pseudocode highlight (FR-VIS-04) all need that sequence from the engine, so nothing is typed into content. `avlInsert` today returns only the final tree and one rebalance.

## What Changes

- Add `avlInsertTrace`: the same insert as `avlInsert`, plus a trace of compare, descend, insert or found, update-height, imbalance and rotation steps, each with before and after snapshots, keys and a pseudocode line.
- Add the insert pseudocode line map (flagged, question 1).
- Add `replay(start, trace)` in `trace.ts` for search and insert traces.
- Serves FR-ENG-06 (Must; insert and search, delete pending), FR-ENG-04 (trace part of SE §6.4 step 5), FR-VIS-04 groundwork (line numbers), FR-VIS-02 groundwork (z and y named in the imbalance step). Learning outcome: LO7 (C6), engine side only.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `avl-engine`: adds "AVL insert trace", "Insert trace steps", "Insert pseudocode line map" and "Trace replay". Existing requirements are unchanged.

## Out of scope

The delete trace (next change); unifying results into `OperationResult`; the insert pseudocode text and panel; step controls, prediction and animation UI; FR-VIS-06 student-performed rotations; generators of insert problems; any storage. `avlInsert` and its tests are not touched.

## Impact

- Changed: `src/engine/avl.ts` (new function and line map), `src/engine/trace.ts` (`replay`), `src/engine/tree.ts` (a small path-copy helper both use). `index.ts` already re-exports both modules.
- New tests: `tests/engine/avl-insert-trace.test.ts`, `tests/engine/trace-replay.test.ts`.
- No new dependencies. No other change is in flight on `avl-engine`.
