# Tasks

## 1. Red tests

- [x] 1.1 Add the insert-facts cases to `tests/modules/framework.test.ts` (rebalance at 30 with 1 rotation, height after 1; 25 gives 2 rotations; duplicate key and predict on a search replay as source problems; insert numbers accepted), named after FR-ENG-03, D19 and D33; verify they fail only because the code does not exist.
- [x] 1.2 Write `tests/ui/insert-replay.test.tsx` with a fixture module in the player and the composite on its own (insert replay step and end tree, held until lock in or skip, reveal at the end, "Replay that step" jumps, fresh after Back and Next, Watch or Do it yourself, nothing stored, axe for each option); verify they fail only because the code does not exist and all existing tests still pass. Leave them uncommitted.

## 2. Framework

- [x] 2.1 Add `replay.insert`, `replay.predict`, `replay.doItYourself` and insert facts to `src/modules/schema.ts`, `facts.ts` and `validate.ts`; verify the framework tests pass and every module still validates.

## 3. UI

- [x] 3.1 Add the optional `onPosition` callback to `ReplayPlayer`; verify every existing replay and predict-first test still passes.
- [x] 3.2 Add `InsertReplay` in `src/ui/module/` and render it from `ModulePlayer` for insert replays (keyed on the step); verify the insert-replay UI tests pass.

## 4. Review

- [x] 4.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; add assumed rows to `.claude/docs/decisions.md` for proposal items 2 to 5 and update `next-steps.md` row 15b; verify all pass and there are no new `[OPEN]` markers.
- [ ] 4.2 Run the reviewer and a11y-checker roles on the fixture screens; verify the reports pass or findings are resolved. (The hand checks run with C6, the first real use.)

## Workflow follow-up

- `add-module-c6-insertion` writes C6 on this: watch, then predict, then Do it yourself.
- The user commits, merges and archives; agents do not.
