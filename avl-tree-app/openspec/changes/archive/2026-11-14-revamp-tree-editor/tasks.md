# Tasks

Roles as in `.claude/CLAUDE.md`. No task commits; the user commits.

## 1. Red tests

- [x] 1.1 (test-writer) Extend `tests/ui/tree-builder.test.ts` for the reducer: `hold`/`letGo`, `place` only while held, `select` lets go, `lastRotation` before and after (equal in-order) and cleared by other edits, undo and reset; add `editLogEntries` sentences (numbers and letter keys) and a check that the overlay's slots equal `targetsOf` by `parent:side`. Verify they fail only because the new actions and functions do not exist (D132, D134, LO4).
- [x] 1.2 (test-writer) Write `tests/ui/tree-editor.test.tsx` for every `tree-editor` scenario and the modified `lesson-questions` "The tree builder" scenarios: placing on `c2-s01-task`, slots only while held, Esc, wrong branch drawn, slot names and 44 px hit areas, keyboard placement, menu rotation on `chk5-03`, R/L/Esc and Ctrl+Z, the refusal line, delete on `chk7-03`, the edit log, the strip before and after, DOM order, `scrollIntoView`, axe in four states, locked after checking, one primary button, no "Put … left of …" buttons, and CSS rules for 768 px and 44 px. Verify they fail only because the editor does not exist (FR-VIS-06, FR-VIS-07, FR-VIS-10, NFR-02).

## 2. Editor

- [x] 2.1 (implementer) Add `held`, `hold`, `letGo` and `lastRotation` to `builder.ts` (design 1), and `editLogEntries` in `src/ui/editor/editLog.ts` (design 6). Verify task 1.1 passes and the existing builder tests still pass.
- [x] 2.2 (content-author) Add the editor copy to `src/content/lesson.ts`: Place and Let go, slot names, "empty", "Placed by you", "Your edits", "No edits yet", the four edit-log sentences, "In-order before", "In-order after", the "Same order" line, "new", and the "every key is placed" status. Remove the `target`, `root` and `targetsLabel` builder strings once nothing uses them. Verify `npm run typecheck` passes.
- [x] 2.3 (implementer) Build `TreeEditorToolbar` and `EditLog` to their contracts (adding `deleteKey`/`onDelete`), move them from `STUBBED` to `BUILT` in `src/ui/contracts.ts`, and update `RotationMenu` (aria-keyshortcuts) and `InOrderStrip` (before/after, "new" mark). Verify `tests/ui/contracts.test.tsx` and the component scenarios in task 1.2 pass.
- [x] 2.4 (implementer) Build `SlotOverlay` and `TreeEditor` (design 2, 3, 5), make `TreeBuilder` in `Controls.tsx` a wrapper around it, and remove the target button list. Verify every task 1.2 behaviour scenario passes and `QuestionCard` is unchanged.

## 3. Layout and records

- [x] 3.1 (implementer, then ui-polisher) Add `src/ui/editor/editor.css` for the one-column order, the menu beside the node from `BREAKPOINTS.tablet`, 44 px targets and the slot style using tokens only, plus the `scrollIntoView` calls (design 4, 7). Remove `.q-targets` and `.q-target` from `lesson.css`. Verify the CSS scenarios in task 1.2 pass and `npm run lint` (token rule) passes.
- [x] 3.2 Add D132 to D135 to `.claude/docs/decisions.md` and mark D110 superseded in part by D132. Update the 1h and 1m entries in `.claude/docs/design/INDEX.md`, item 4 "Phones": tap-to-place is built, and phone frames are still to draw. Verify `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all` pass.
- [ ] 3.3 Run the reviewer and a11y-checker roles. Then by hand: `chk6-04` keyboard only, `c2-s01-task` and `chk5-03` by touch on a phone at 360 px and on a laptop, `chk7-03` delete, a greyscale check of slots, the held key, selection and the "Placed by you" mark. Verify the reports pass or findings are resolved.

## Workflow follow-up

- The user commits, merges and archives; agents do not.
- One change in flight per capability: `lesson-questions` is touched only by this change.
