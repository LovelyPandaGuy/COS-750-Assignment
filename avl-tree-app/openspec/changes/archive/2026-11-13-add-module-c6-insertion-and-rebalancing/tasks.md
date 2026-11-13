# Tasks

## 1. Red tests

- [x] 1.1 Add the inserted-figure and insert-facts cases to `tests/modules/framework.test.ts` (plain insert not AVL with 30 the only violation, AVL insert fixes it with root 20, insert facts for a plain-insert figure, duplicate key) and write `tests/modules/c6.test.ts` (validator, activities, outline listing, one content step per ID step, heights before and after, lowest unbalanced node from facts, single and double with names through the wording, million-key figure, at most one rebalance per insert property, fading order and different cases, seeded practice over seeds 0 to 199 with both sizes, case marking and hints, no case names or calm-wording scans), each named after the LO, FR or D it serves; verify they fail only because the code does not exist.
- [x] 1.2 Write `tests/ui/c6-module.test.tsx` (outline step, the three examples' modes, name the case right then the rotation tool, wrong case feedback, hints countdown, keyboard only, New tree, Back keeps the practice, nothing stored, check placeholder with the "Where next?" panel, axe on every C6 step) and move the tests that used C6 as a skeleton to C9 (`module-player` skeleton case, `module-hub` skeleton list and "moving about"); verify the new cases fail only because the code does not exist and every other test passes. Leave them uncommitted.

## 2. Framework

- [x] 2.1 Add the `inserted` source, the `'insert'` listing, the `'name-case'` practice and the `'insert-rebalance'` generator to `src/modules/schema.ts`, `facts.ts`, `validate.ts` and `generators.ts` (one shared insert-facts function); verify the framework tests pass and every module still validates.

## 3. Practice logic

- [x] 3.1 Add `src/modules/casePractice.ts` (`caseProblem`, `markCase`); verify the seeded-problem property test and marking tests pass.

## 4. Content

- [x] 4.1 Write `src/content/modules/c6.ts`, the C6 practice wording in `src/content/modules/practice.ts` and register C6 (content-author for the content; every string beyond the ID marked; case names only through the wording); verify the C6 module tests, the validator test over all modules and the wording scans pass.

## 5. UI

- [x] 5.1 Add `NameTheCase` in `src/ui/module/practice/`, render it and the rotation phase from `ModulePlayer`, and show the insert listing; verify the C6 UI tests and every existing module-player, C5 and C7 test pass.

## 6. Review

- [x] 6.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; add assumed rows to `.claude/docs/decisions.md` for proposal items 2 to 10 and update `next-steps.md` row 15c; verify all pass and there are no new `[OPEN]` markers.
- [ ] 6.2 Run the reviewer and a11y-checker roles; then by hand: keyboard-only run through C6, greyscale screenshot, colour-vision emulation (D25), and a touch run of the practice and the Do it yourself example at 360 px; verify the reports pass or findings are resolved.

## Workflow follow-up

- Read the assumptions in the proposal and every flagged string in `src/content/modules/c6.ts` (gate G3).
- The user commits, merges and archives; agents do not.
