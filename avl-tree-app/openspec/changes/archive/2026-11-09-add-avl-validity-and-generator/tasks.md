# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/engine/analyse.test.ts` from the validity scenarios (report, first-violation agreement, violation kind, BST order, duplicates, stored height, no mutation, lowest offender, stored heights not trusted), named after FR-ENG-05 and FR-ASM-04; verify it fails only because `analyse.ts` and `leanOf` do not exist.
- [x] 1.2 Write `tests/engine/random.test.ts` and `tests/engine/generate.test.ts` from every generator scenario, named after FR-ASM-07 and D9, including the pinned PRNG outputs for seed 12345; verify they fail only because the modules do not exist and that the existing tests still pass.

## 2. Validity report

- [x] 2.1 Add `leanOf` to `src/engine/conventions.ts` and implement `analyseTree` in `src/engine/analyse.ts`, exported from `index.ts`; verify the analyse tests, the existing validity tests and the FR-ENG-10 scan all pass.

## 3. Generator

- [x] 3.1 Implement `random.ts` (seeded source), seeded insert sequences and seeded trees in `generate.ts`; record the pinned PRNG outputs in the test; verify the random, sequence and tree tests pass.
- [x] 3.2 Implement case-targeted sequences and `variantSeed`; verify the four-case scenarios for seeds 1 to 50, the impossible-request rejection and the retry scenarios pass.

## 4. Review

- [x] 4.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; verify all pass with no new `[OPEN]` markers.
- [ ] 4.2 Fresh-context review of the diff against the specs and the conventions module; verify the report is a pass or findings are resolved. (No UI, so no a11y check.)

## Workflow follow-up

- Archive `add-rotations` before applying this change (open question 1). The user archives; agents do not.
- Record the validity and generator assumptions in `docs/decisions.md` once confirmed.
