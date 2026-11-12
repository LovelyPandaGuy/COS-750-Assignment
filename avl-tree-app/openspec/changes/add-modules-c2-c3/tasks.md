# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/modules/framework.test.ts`, `tests/modules/c2.test.ts`, `tests/modules/c3.test.ts` and `tests/conventions-wording.test.ts` from every non-UI scenario in `module-framework` (order, activities, facts, claims, numbers, wording), `module-c2-lopsided-bsts`, `module-c3-avl-property` (facts, claims, generator property over seeds 0 to 199, marking incl. sign slip, calm-wording scan) and the `conventions` delta, each test named after the LO or FR it serves; verify they fail only because the modules do not exist.
- [x] 1.2 Write `tests/ui/module-player.test.tsx`, `tests/ui/c3-practice.test.tsx` and add the hidden-balance scenarios to `tests/ui/tree-view.test.tsx` from every UI scenario (navigation, focus, control strip, skip, check placeholder, practice by keyboard, hints countdown, nothing stored, new tree, axe on every C2 and C3 step); verify they fail only because the code does not exist and all existing tests still pass.

## 2. Conventions and framework logic

- [x] 2.1 Add `BALANCE_FACTOR_ORDER` and `BALANCE_RANGE` to `src/engine/conventions.ts` (no behaviour change) and `src/content/modules/conventionsWording.ts` (content-author); verify the `conventions` tests pass and `tests/engine/conventions-single-source.test.ts` still passes.
- [x] 2.2 Add `src/modules/schema.ts` (events, `EVENT_ACTIVITY`, step and figure types), `src/modules/config.ts` (`PRACTICE_HINTS`) and `src/modules/facts.ts` (tree building, facts, `searchBounds`, `isPerfect`); verify the facts and bounds tests pass.
- [x] 2.3 Add `src/modules/validate.ts` (order, activity, claim, number, wording problems) and `src/modules/registry.ts`; verify the validator tests pass on the bad-module fixtures.
- [x] 2.4 Add `src/modules/generators.ts` (`generateRootLooksFine`, fill-in tree) and `src/modules/practice.ts` (marking to `right | sign-slip | not-yet` with engine facts); verify the generator property test and marking tests pass.

## 3. Content

- [x] 3.1 Write `src/content/modules/c2.ts` (content-author; ID C2 bullets, every string beyond the ID flagged in a comment); verify the C2 tests and the validator test over all registered modules pass.
- [x] 3.2 Write `src/content/modules/c3.ts`, `src/content/modules/practice.ts` and `src/content/modules/player.ts` (content-author; hints, feedback, player labels, all flagged); verify the C3 tests, the calm-wording scan and the validator test pass.

## 4. UI

- [x] 4.1 Add the hidden-balance mode to `TreeView` and `describe.ts`, with new strings in `src/content/treeView.ts`; verify the hidden-balance tests and every existing tree-view test pass.
- [x] 4.2 Add `ModulePlayer` and `ControlStrip` in `src/ui/module/` (tokens only, 44 px targets) and render the player from `src/pages/Activity.tsx` when module content exists; verify the module-player tests pass and C4 still shows the skeleton.
- [x] 4.3 Add `BalanceFactorFill`, `SpotTheProblem` and the practice feedback panel in `src/ui/module/practice/`; verify the C3 practice tests pass.

## 5. Review

- [x] 5.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; verify all pass, no new `[OPEN]` markers, and no edits to `src/engine/` other than the two conventions exports.
- [ ] 5.2 Run the `reviewer` (fresh context) and `a11y-checker` roles; then by hand: keyboard-only run through C2 and C3, greyscale screenshot, the colour-vision emulation check (D25), a touch run of both practice steps at 360 px; verify the reports pass or findings are resolved.

## Workflow follow-up

- Archive `add-routing-and-screen-skeleton` before applying this change (proposal item 10).
- Read the assumptions in the proposal and every flagged string in `src/content/modules/` (gate G3).
- Add assumed rows to `.claude/docs/decisions.md` for proposal items 2, 3, 6 and 7 when this change is archived (D18).
- Change 12 `add-module-framework` then adds reordering, path mode, entry policy and route events on this schema.
- The user merges and archives; agents do not.
