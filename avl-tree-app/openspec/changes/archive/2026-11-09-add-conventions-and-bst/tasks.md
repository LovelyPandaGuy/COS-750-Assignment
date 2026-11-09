# Tasks

## 1. Tooling and red tests

- [x] 1.1 Add `vitest` and `fast-check`, a `test` script and a `typecheck` script; verify `npm test` runs (no tests yet) and `npm run typecheck` passes.
- [x] 1.2 Add the ESLint rule forbidding UI imports under `src/engine/`; verify a deliberate `import 'react'` in a scratch engine file fails `npm run lint`, then remove it.
- [x] 1.3 Test-writer: turn every scenario in both specs into failing tests under `tests/engine/`, named after FR-ENG-01, 02, 03, 05 and 10, including the fast-check rotation property and the "no hard-coded convention" scan; verify `npm test` fails only because the engine does not exist, then commit the red tests.

## 2. Engine

- [x] 2.1 Implement `src/engine/conventions.ts` and the tree type with height and balance factor; verify the FR-ENG-03 and FR-ENG-10 tests pass.
- [x] 2.2 Implement BST insert, search and delete; verify the FR-ENG-01 tests pass, including duplicate, missing key, three delete cases and immutability.
- [x] 2.3 Implement rotation primitives (pending open question 1); verify the FR-ENG-02 unit tests and property test pass.
- [x] 2.4 Implement the AVL validity check; verify the FR-ENG-05 tests pass (multi-offender tie-break only after open question 3 is settled).

## 3. Review

- [x] 3.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; verify all pass with no new `[OPEN]` markers.
- [ ] 3.2 Reviewer subagent checks the diff against the specs, SE §6.4 and the conventions module; verify the report is a pass or findings are resolved. (a11y-checker not needed: no UI.)

## Workflow follow-up

- The user merges and runs `/opsx:archive`. Agents do not.
- Update `docs/decisions.md` for open questions 1 to 3 once answered.
