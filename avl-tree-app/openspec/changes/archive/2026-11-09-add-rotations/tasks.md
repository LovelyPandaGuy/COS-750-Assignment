# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/engine/avl.test.ts` from every scenario in the spec delta, named after FR-ENG-04 and FR-ENG-07, including the four cases at the root and deeper (left and right child of a parent), the 10, 20, 30, 40, 50, 25 example, ascending 1 to 15, and the fast-check invariants property; verify `npm test` fails only because `avl.ts` does not exist, and that the earlier 42 tests still pass.

## 2. Engine

- [x] 2.1 Add the case-mapping helper to `src/engine/conventions.ts` and verify the existing FR-ENG-10 scan and override tests still pass.
- [x] 2.2 Implement `rebalance` (detect, classify, single or double rotation) in `src/engine/avl.ts`; verify the case and rotation scenarios pass.
- [x] 2.3 Implement `avlInsert` with the result shape from the design and export both from `src/engine/index.ts`; verify the hand-worked example, duplicate, immutability, ascending 1 to 15 and property tests pass.

## 3. Review

- [x] 3.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; verify all pass with no new `[OPEN]` markers.
- [ ] 3.2 Fresh-context review of the diff against the specs, SE §6.4 and the conventions module; verify the report is a pass or findings are resolved. (No UI, so no a11y check.)

## Workflow follow-up

- The user merges and runs `/opsx:archive` for this change and for `add-conventions-and-bst`. Agents do not.
- Record the answers to open questions 1 and 2 in `docs/decisions.md`.
