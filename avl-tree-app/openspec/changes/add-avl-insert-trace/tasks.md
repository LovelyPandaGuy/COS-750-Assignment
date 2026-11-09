# Tasks

Blocked until proposal open questions 1 to 3 are settled or accepted at the human skim. Tasks that depend only on open question 2 are marked.

## 1. Red tests

- [x] 1.1 Test-writer: turn every scenario under **AVL insert** and **Plain BST insert for comparison** into failing tests in `tests/engine/avl-insert.test.ts`, named after FR-ENG-04 and FR-ENG-07, including the eight deep-z cases, the fast-check properties (valid AVL, sorted in-order, at most one imbalance step) and the case-label-from-conventions scan; verify `npm test` fails only because `insertAvl` and the trace do not exist.
- [x] 1.2 Test-writer: turn every scenario under **Trace for every operation** into failing tests in `tests/engine/trace.test.ts`, named after FR-ENG-06, including the exact step sequences for 3, 2 + 1 (LL) and 3, 1 + 2 (LR), and fast-check properties for replay, snapshot chain and immutability; the pseudocode-line test reads the kind-to-line map rather than literals (open question 2). Verify the existing 1.x engine tests still pass and the new ones fail, then commit the red tests.

## 2. Trace contract

- [x] 2.1 Document in `src/engine/conventions.ts` that the order of `REBALANCE_CASES` (LL, RR, LR, RL) is the contract the engine reads case names by; verify the existing FR-ENG-10 tests and the conventions single-source test still pass.
- [x] 2.2 Implement `src/engine/trace.ts` (`TraceStep`, `StepKind`, `OperationResult`, `replay`, `INSERT_PSEUDOCODE` and the kind-to-line map); verify the replay-on-empty-trace and replay-mismatch tests pass and `npm run typecheck` passes.
- [x] 2.3 Add the shared path-rebuild helper and give plain `insert` in `bst.ts` its trace (compare, insert, found); verify the FR-ENG-07 plain-trace test and the existing FR-ENG-01 tests pass.

## 3. AVL insert

- [x] 3.1 Implement `insertAvl` in `src/engine/avl.ts` without rotation steps (BST insert, compare, insert, update-height walk to the root) and export it; verify the empty, single-node and duplicate tests pass.
- [x] 3.2 Add imbalance detection, case selection from the conventions module and the single and double rotation steps, stopping after the fix; verify every FR-ENG-04 and FR-ENG-06 test passes, including the deep-z cases, the 1-to-15 comparison and all fast-check properties.

## 4. Integration and review

- [x] 4.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate add-avl-insert-trace --strict`; verify all pass and the only `[OPEN]` marker is the pseudocode one (or none, if open question 2 is settled).
- [ ] 4.2 Reviewer subagent checks the diff against the delta spec, SE §6.3 and §6.4, C6 (LO7) and the conventions module; verify the report is a pass or its findings are resolved. (a11y-checker not needed: no UI.)

## Workflow follow-up

- Record the answers to open questions 1 to 3 in `docs/decisions.md`, and update `docs/next-steps.md` with the new change order (AVL delete and search trace as later changes).
- Fix `openspec/config.yaml`: `rules.tasks[1]` contains an unquoted `: ` so OpenSpec ignores the task rules; quote that item.
- The user merges and runs `/opsx:archive`. Agents do not.
