# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/modules/practice-steps.test.ts` and `tests/modules/c5.test.ts` from every non-UI scenario in `module-practice-steps` and `module-c5-rotations`. Cover:
  - rotated sources, including the impossible-rotation source problem
  - rebalance facts and the AVL root
  - case-name wording, `bst` and `same-order` claims
  - the generator property over seeds 0 to 199 for single and double, plus agreement with `rotationsNeeded`
  - the fuller hint for 30, 10 then 20
  - C5 validation, facts and the four distinct cases
  - a source grep of `c5.ts` for typed case names, and the calm-wording scan

  Name each test after the LO or FR it serves. Verify they fail only because the code and content do not exist.
- [x] 1.2 Write `tests/ui/c5-module.test.tsx` from every UI scenario:
  - C5 plays instead of the skeleton
  - the practice step opens unbalanced with the new node marked
  - hints count down, then review
  - New tree resets the problem and the hints
  - nothing is stored
  - Back then Next keeps the rotation and Undo
  - keyboard-only rotation to balanced
  - axe on every C5 step

  Verify they fail only because the code does not exist and that all existing tests still pass.

## 2. Framework logic

- [x] 2.1 Extend `src/modules/schema.ts` and `src/modules/facts.ts`:
  - the `rotated` source and its source problems
  - `inOrder`, `avlRootKey` and `rebalances` facts

  Add `caseName` to `src/content/modules/conventionsWording.ts` (content-author). Verify the facts and wording tests pass, and that `tests/conventions-wording.test.ts` and the C2 and C3 tests still pass.
- [x] 2.2 Extend `src/modules/validate.ts` with `source` problems and the `bst` and `same-order` claims, and add rebalance numbers to the fact numbers. Verify the claim and source tests pass on their fixtures.
- [x] 2.3 Add `generateRotationProblem` and `practiceProblem` to `src/modules/generators.ts`, and `ROTATION_PRACTICE_KEYS` to `src/modules/config.ts`. Add a fixed fallback if a seed finds no problem. Verify the generator property tests pass.

## 3. Content

- [x] 3.1 Write `src/content/modules/c5.ts` (content-author; the ID's C5 bullets and example, each string beyond the ID marked `[beyond ID]`) and register C5 in `src/modules/registry.ts`. Verify the C5 tests and the validator test over all registered modules pass.
- [x] 3.2 Add the rotation practice strings (tree label, two hints) to `src/content/modules/practice.ts` (content-author, flagged). Verify the hint test and the calm-wording scan pass.

## 4. UI

- [x] 4.1 Add `src/ui/module/practice/RotatePractice.tsx`, which wraps `DoItYourself` with hints and New tree, with hint facts from `avlInsertTrace`. Render it from `ModulePlayer` for `rotate` practice steps, and keep visited ones mounted and `hidden`. Verify the C5 UI tests, the module-player tests and the C3 practice tests pass.

## 5. Review

- [x] 5.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`. Verify:
  - all of them pass
  - there are no new `[OPEN]` markers
  - there are no edits under `src/engine/`, `src/practice/`, `src/ui/practice/` or `src/content/practice.ts`
- [ ] 5.2 Run the `reviewer` (fresh context) and `a11y-checker` roles. Then check by hand:
  - a keyboard-only run through C5
  - a greyscale screenshot
  - the colour-vision emulation check (D25)
  - a touch run of both practice steps at 360 px

  Verify the reports pass or their findings are resolved.

## Workflow follow-up

- Read the assumptions in the proposal and every `[beyond ID]` string in `c5.ts` and the rotation hints (gate G3).
- Add assumed rows to `.claude/docs/decisions.md` for proposal items 1, 4, 5, 7 and 8 when this change is archived (D18). Update `next-steps.md` with the three-way split of row 15.
- Next changes: `add-insert-replay`, then `add-module-c6-insertion`.
- The user merges and archives; agents do not.
