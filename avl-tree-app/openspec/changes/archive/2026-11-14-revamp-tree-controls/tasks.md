# Tasks

Roles as in `.claude/CLAUDE.md`. No task commits; the user commits. Apply after `add-ui-foundation` (base `Button`). Change 1 of the tree-controls split: step controls and the sandbox follow; display controls wait for `revamp-tree-view`.

## 1. Red tests

- [x] 1.1 (test-writer) Write `tests/ui/tree-controls.test.tsx` for every `tree-controls` scenario: bar below the tree and group order, wrapping CSS, one tab stop, Left/Right/Home/End with wrap, focusable `aria-disabled` that does not act, base `btn` classes and no `module-button`/`practice-button`, icon, key cap and `aria-keyshortcuts`, pressed with a dashed border, registry agreeing with help and listing the 1f step keys, keyboard help closed by default and listing only editor keys, and axe closed, open and with the menu. Verify they fail only because the controls do not exist (D136 to D139, NFR-02).
- [x] 1.2 (test-writer) Update `tests/ui/tree-editor.test.tsx` and `tests/ui/lesson-questions.test.tsx` for the modified `tree-editor` scenarios: the new DOM order with keyboard help last, the bar order on `chk7-03`, `aria-disabled` in place of `toBeDisabled()` (all placed, locked), help in the axe states, and arrow movement in the bar in the keyboard-only test. Verify the changed tests fail and the others still pass.

## 2. Controls

- [x] 2.1 (content-author) Add `src/content/controls.ts`: the help heading and button label, the action wording for every registry entry, and the control icons. Verify `npm run typecheck` passes.
- [x] 2.2 (implementer) Build `shortcuts.ts` (registry, `shortcutsFor`, `matches`), `ControlButton`, `ControlBar` and `controls.css` (design 1 to 3). Verify the bar, button and registry scenarios of task 1.1 pass and `npm run lint` passes.
- [x] 2.3 (implementer) Build `KeyboardHelp` to its contract (design 4), remove its stub, and move it from `STUBBED` to `BUILT` with the contracts counts at 22 and 23. Verify the help scenarios and `tests/ui/contracts.test.tsx` pass.

## 3. Editor and records

- [x] 3.1 (implementer) Move the editor onto the controls (design 5): `TreeEditorToolbar` through `ControlBar` and `ControlButton`, `RotationMenu` through `ControlButton`, the new order with `KeyboardHelp`, the key handler through `matches`, and the old button rules removed from `editor.css` and `practice.css` where unused. Verify every test of tasks 1.1 and 1.2 passes and `npm test` is green.
- [x] 3.2 Add D136 to D139 to `.claude/docs/decisions.md`, note in D135 that D136 changed its order, and update `.claude/docs/design/INDEX.md` (KeyboardHelp built). Verify `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all` pass.
- [ ] 3.3 Run the reviewer and a11y-checker roles. Then by hand: the editor by keyboard only (Tab into the bar, arrows, help), on a phone at 360 px, and a greyscale check of the pressed Place and the disabled buttons. Verify the reports pass or findings are resolved.

## Workflow follow-up

- Next changes of the split: step controls (`step-replay`) and the sandbox (`sandbox`) adopt `ControlBar`, `ControlButton` and the registry; display controls after `revamp-tree-view` is archived.
- The user commits, merges and archives; agents do not.
