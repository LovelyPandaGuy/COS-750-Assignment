# Tasks

Roles as in `.claude/CLAUDE.md`. No task commits; the user commits. Step 2 of the tree-controls split (after `revamp-tree-controls`).

## 1. Red tests

- [x] 1.1 (test-writer) Write `tests/ui/sandbox-layout.test.tsx` for the new `sandbox` requirements and the modified `tree-controls` "The control bar": tree column first with the replay inside it, the 768 px grid rule matching `BREAKPOINTS.tablet` and single column outside it, headings in order and regions named by them, bar order with no primary, Enter inserts, keyboard help listing only sandbox keys, axe with help open. Verify they fail only because the layout does not exist (D140, D141, FR-VIS-08).
- [x] 1.2 (test-writer) Update `tests/ui/sandbox.test.tsx` for the modified "Fifteen-node cap" (`aria-disabled`, activating Insert at 15 does nothing) and any lookups of the old `Statistics` and `Event log` labels. Verify the changed tests fail and the others still pass.

## 2. Build

- [x] 2.1 (content-author) Add the section headings to `src/content/sandbox.ts` and the "Insert the key in the field" action to `src/content/controls.ts`. Verify `npm run typecheck` passes.
- [x] 2.2 (implementer) Add `SandboxSection`, the `fieldInsert` entry and `'sandbox'` screens in `shortcuts.ts`, and move `InsertControl` onto `ControlBar` and `ControlButton` (design 2 to 4). Verify the bar, Enter and help scenarios pass.
- [x] 2.3 (implementer, then ui-polisher) Rearrange `Sandbox.tsx` into the two columns and sections, with `TreeStats` and `EventLog` inside sections, and write the grid in `sandbox.css` using tokens only (design 1, 2). Verify every task 1.1 and 1.2 test passes, and `npm test` and `npm run lint` are green.

## 3. Records and review

- [x] 3.1 Add D140 and D141 to `.claude/docs/decisions.md`, note on D136 that the sandbox shows its bar in a side column from 768 px, and note in `.claude/docs/design/INDEX.md` that the sandbox follows 1n's two columns and its phone order is built. Verify `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all` pass.
- [ ] 3.2 Run the reviewer and a11y-checker roles, including the tab order on a wide screen (D140 risk). Then by hand: the sandbox at 360, 768 and 1366 px, keyboard only, a chain of 15 with rebalancing off, and the replay. Verify the reports pass or findings are resolved.

## Workflow follow-up

- Next change of the split: step controls (`step-replay`) on the control bar; display controls after `revamp-tree-view` is archived.
- The user commits, merges and archives; agents do not.
