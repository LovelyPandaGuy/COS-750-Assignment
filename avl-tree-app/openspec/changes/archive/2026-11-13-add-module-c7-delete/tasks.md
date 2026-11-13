# Tasks

## 1. Red tests

- [x] 1.1 Add the `module-framework` delta cases to `tests/modules/framework.test.ts` (delete facts for two children, rebalances and no rebalancing; missing key reported; `multi-rebalance` claim true and false) and write `tests/modules/c7.test.ts` (validator, activities, recap child counts and successor, one rebalance, two rebalances named from facts, no case names, seeded practice over seeds 0 to 199, marking right / higher / in-balance, hints, calm wording), each named after the LO, FR or D it serves; verify they fail only because the code does not exist.
- [x] 1.2 Write `tests/ui/c7-module.test.tsx` (recap figures, practice by pointer and keyboard, balance hidden until solved, feedback, hints countdown, nothing stored, check placeholder, axe on every C7 step); verify they fail only because the code does not exist and all existing tests still pass. Leave them uncommitted.

## 2. Framework

- [x] 2.1 Add the `deleted` source, `DeleteFacts` and the `multi-rebalance` claim to `src/modules/schema.ts`, `facts.ts` and `validate.ts`; verify the framework tests pass and every existing module still validates.

## 3. Practice logic

- [x] 3.1 Add `src/modules/deletePractice.ts` (`drawDeletePractice`, `markAfterDelete`); verify the seeded-tree property test and marking tests pass.

## 4. Content

- [x] 4.1 Write `src/content/modules/c7.ts`, the C7 practice wording in `src/content/modules/practice.ts` and register C7 (content-author for the content; every string beyond the ID marked); verify the C7 module tests and the validator test over all modules pass.

## 5. UI

- [x] 5.1 Add `FindAfterDelete` in `src/ui/module/practice/` and render it from `ModulePlayer` for `after-delete` steps; verify the C7 UI tests pass.

## 6. Review

- [x] 6.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; add assumed rows to `.claude/docs/decisions.md` for proposal items 2 to 5; verify all pass and there are no new `[OPEN]` markers.
- [ ] 6.2 Run the reviewer and a11y-checker roles; then by hand: keyboard-only run through C7, greyscale screenshot, colour-vision emulation (D25), a touch run of the practice at 360 px; verify the reports pass or findings are resolved.

## Workflow follow-up

- Read the assumptions in the proposal and every flagged string in `src/content/modules/c7.ts` (gate G3).
- When the lecturer answers question 4 (deletion cases), add case wording through the conventions module.
- The user commits, merges and archives; agents do not.
