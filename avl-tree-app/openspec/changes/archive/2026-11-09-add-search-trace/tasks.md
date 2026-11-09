# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/engine/search.test.ts` from every scenario in the spec delta (found, missing, root, empty tree, step counts 1, 3 and 3, before and after, loop and recursive lines, forms agree on kinds and keys, count at most height plus one, plain-chain 15 steps, agreement with plain `search`, fast-check property), named after FR-ENG-09; verify it fails only because `trace.ts` and `search.ts` do not exist and that the existing 93 tests still pass.

## 2. Trace types and search

- [x] 2.1 Add `src/engine/trace.ts` with the SE §6.3 `TraceStep` type and all step kinds, exported from `index.ts`; verify `npm run typecheck` passes.
- [x] 2.2 Implement `searchTrace` in loop and recursive forms with the line maps in `src/engine/search.ts`, exported from `index.ts`; verify the whole search test file passes, including the property test.

## 3. Review

- [x] 3.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; verify all pass with no new `[OPEN]` markers in `src/`.
- [ ] 3.2 Fresh-context review of the diff against the specs, SE §6.3 and §6.4, and the ID's C4 pseudocode; verify the report is a pass or findings are resolved. (No UI, so no a11y check.)

## Workflow follow-up

- Check the line layout in the pseudocode maps against the ID PDF before apply (open question 1).
- The user archives; agents do not. Record the D12 and step-count points in `docs/decisions.md` once confirmed.
