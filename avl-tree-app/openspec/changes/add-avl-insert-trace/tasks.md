# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/engine/avl-insert-trace.test.ts` from every scenario under "AVL insert trace", "Insert trace steps" and "Insert pseudocode line map" (RR and LR at the root, the 10..50 then 25 RL example, imbalance below the root, no imbalance, duplicate, empty tree, stale heights, agreement and step-structure properties, line map), named after FR-ENG-04 or FR-ENG-06; verify it fails only because `avlInsertTrace` and `INSERT_LINES` do not exist.
- [x] 1.2 Write `tests/engine/trace-replay.test.ts` from every scenario under "Trace replay" (insert property with prefixes, search traces, rotation direction, empty trace, delete refused), named after FR-ENG-06; verify it fails only because `replay` does not exist and that all existing tests still pass.

## 2. Insert trace

- [ ] 2.1 Add the path-copy helper to `src/engine/tree.ts` (rebuild the path to the root around a changed subtree, keeping ancestors' stored heights); verify `npm run typecheck` passes and existing tree tests still pass.
- [ ] 2.2 Add `INSERT_LINES` and the walk-down part of `avlInsertTrace` (compare, descend, insert, found, empty tree) in `src/engine/avl.ts`; verify the duplicate, empty-tree and line-map scenarios pass.
- [ ] 2.3 Add the walk-up update-height steps with stale-height snapshots, stopping at z or the root; verify the no-imbalance and stale-heights scenarios pass.
- [ ] 2.4 Add the imbalance and rotation steps using the existing `rebalance` and rotations; verify the whole insert-trace test file passes, including both property tests.

## 3. Replay

- [ ] 3.1 Implement `replay(start, trace)` in `src/engine/trace.ts`, re-applying steps by kind and keys without reading snapshots and throwing on delete steps; verify the whole replay test file passes.

## 4. Review

- [ ] 4.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; verify all pass with no new `[OPEN]` markers in `src/` and no change to `avlInsert` or its tests.
- [ ] 4.2 Fresh-context review of the diff against the spec delta, SE §6.3 and §6.4, the ID's C6 outline and the conventions module; verify the report is a pass or its findings are resolved. (No UI, so no a11y check.)

## Workflow follow-up

- Settle the insert line layout (proposal, question 1) and record the answer in `docs/decisions.md` under D12.
- Next change: the delete trace, which makes replay accept delete steps and completes FR-ENG-06.
- The user merges and archives; agents do not.
