# Tasks

## 1. Red tests

- [x] 1.1 Add the `module-framework` delta cases to `tests/modules/framework.test.ts` (AVL worst case for 1,000,000 and the property over 1 to 2,000) and write `tests/modules/c4.test.ts` (validator, activities, million-key text, height + 1, found and not-found examples, seeded practice trees over seeds 0 to 199, marking and hint wording, calm-wording scan), each named after the LO, FR or D it serves; verify they fail only because the code does not exist.
- [x] 1.2 Write `tests/ui/c4-module.test.tsx` (replay step and restart, listings side by side, be the algorithm by pointer and keyboard, "Not in the tree", feedback, hints countdown, nothing stored, axe on every C4 step); verify they fail only because the code does not exist and all existing tests still pass. Leave them uncommitted.

## 2. Framework

- [x] 2.1 Add `maxAvlHeight` and `avlWorst` to `src/modules/facts.ts`, and `replay`, `listings`, `searchPractice`, `'trace-search'` and the two representations to `src/modules/schema.ts`; verify the framework tests pass and the existing C2, C3, C5 and C8 tests still pass.
- [x] 2.2 Render replay steps and side-by-side listings in `ModulePlayer` (tokens only, stacking below two-column width); verify the replay and listings UI tests pass.

## 3. Practice logic

- [x] 3.1 Add `src/modules/searchPractice.ts` (`drawSearchPractice`, `markPick`, `markNotInTree`) and `SEARCH_PRACTICE_KEYS` in `src/modules/config.ts`; verify the seeded-tree property test and marking tests pass.

## 4. Content

- [x] 4.1 Write `src/content/modules/c4.ts`, the C4 practice wording in `src/content/modules/practice.ts` and register C4 in `src/modules/registry.ts` (content-author for the content; every string beyond the ID marked); verify the C4 module tests, the validator test over all modules and the calm-wording scan pass.

## 5. UI

- [x] 5.1 Add `BeTheAlgorithm` in `src/ui/module/practice/` and render it from `ModulePlayer` for `trace-search` steps, keeping its state in the player's practice map; verify the C4 UI tests pass.

## 6. Review

- [x] 6.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; add assumed rows to `.claude/docs/decisions.md` for proposal items 3 to 7; verify all pass and there are no new `[OPEN]` markers.
- [ ] 6.2 Run the reviewer and a11y-checker roles; then by hand: keyboard-only run through C4, greyscale screenshot, colour-vision emulation (D25), a touch run of both practice steps at 360 px; verify the reports pass or findings are resolved.

## Workflow follow-up

- Read the assumptions in the proposal and every flagged string in `src/content/modules/c4.ts` (gate G3).
- On archive, update D13 to settled: 28 steps, computed from the minimum AVL node counts (proposal item 2).
- The user commits, merges and archives; agents do not.
