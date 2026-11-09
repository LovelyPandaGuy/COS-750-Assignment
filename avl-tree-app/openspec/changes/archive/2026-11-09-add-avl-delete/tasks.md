# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/engine/avl-delete.test.ts` from every scenario in the spec delta (no rebalance, RR, RL, LR, both tie cases, the two-step example, root delete with two children, missing key and empty tree, fast-check invariants property, delete-until-empty), named after FR-ENG-08; verify it fails only because `avlDelete` does not exist and that the existing 113 tests still pass.

## 2. Engine

- [x] 2.1 Implement `avlDelete` and its result type in `src/engine/avl.ts` using the existing `rebalance`, exported through `index.ts`; verify the whole delete test file passes, including the two-step example and the property test.

## 3. Review

- [x] 3.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; verify all pass with no new `[OPEN]` markers in `src/`.
- [ ] 3.2 Fresh-context review of the diff against the specs and SE §6.4, checking in particular that the walk continues past the first rebalance; verify the report is a pass or findings are resolved. (No UI, so no a11y check.)

## Workflow follow-up

- The user archives; agents do not. Record open question 2 (tie-case label) and lecturer question 3 in `docs/decisions.md` once confirmed.
- `add-operation-trace` restores the "appear in the trace" wording for the two-step scenario.
