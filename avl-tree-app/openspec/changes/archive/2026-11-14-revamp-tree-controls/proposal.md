# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Please read these before `/opsx:apply`.

1. **Settled (user, 14 Nov): the goals and the split.** The user asked for one shared control bar, visual polish and keyboard help across the tree controls: step controls, sandbox controls, the tree view's display controls and the tree editor toolbar. The work is split by area. This change, the first of the split, builds the shared parts and moves the **tree editor** onto them, because it is the newest and has one caller. Step controls (`step-replay`) and the sandbox (`sandbox`) follow as their own changes. Display controls wait until `revamp-tree-view` is archived (one change per capability).
2. **Assumed, not blocking: where the bar sits (D136).** The control bar sits directly **below the tree region** on every tree screen. Wireframes 1f (StepControls) and 1h (Undo, Reset) put their controls below the tree, while 1m puts its toolbar above. Majority wins, and ID 8.3 asks for controls "always visible in the same place on every screen". For the editor the order becomes: tree region, rotation menu, control bar, in-order strip, edit log, keyboard help. This changes D135's order.
3. **Assumed, not blocking: the bar is an ARIA toolbar (D137).** It is one tab stop. Left, Right, Home and End move between its buttons, and disabled buttons stay focusable so they can explain themselves. This is the WAI-ARIA toolbar pattern. Today the editor's toolbar has `role="toolbar"` but no arrow keys.
4. **Assumed, not blocking: one shortcut registry (D138).** Every tree shortcut is defined once in `src/ui/controls/shortcuts.ts`, with its keys, its action wording and the screens that use it. `KeyboardHelp` and the buttons' `aria-keyshortcuts` both read from it, so they cannot disagree. The registry already includes the 1f step keys (Space, ← →, [ ]) so the step-controls change only has to use them. Only the editor's keys are active in this change.
5. **Assumed, not blocking: visual polish means the design-system `Button` (D139).** The editor's buttons and the rotation menu move from `module-button` and `practice-button` to the base `Button` from `add-ui-foundation` (variants, states, 44 px). An icon comes before the label (aria-hidden), and the shortcut is shown as a key cap. A toggled button such as Place-while-held uses the secondary pressed look plus `aria-pressed`, so it is not colour alone. `add-ui-foundation` is not archived yet, so this change depends on it. Its `Button` is already in `src/ui/base/`.
6. **Flagged for the user to read:** "Keyboard shortcuts", "Show keyboard shortcuts", the action wording in the registry ("Rotate right at the selected node", "Undo the last edit", "Let go of the key or close the menu", "Move between nodes", "Select a node", "Move between buttons"), and the icons: ＋ Place, − Delete, ↶ Undo, ⟲ Reset, ↻ and ↺ for the rotations. No cross glyph is used anywhere, following the guardrail for wrong answers.

Serves FR-VIS-06, FR-VIS-09, FR-VIS-10, NFR-02, D3, D41; ID 8.3 (consistency, observability, controllability) and ID 11.2 (keyboard); design frames 1f, 1h, 1m (`KeyboardHelp`), design system section 04 (Button).

## Why

The tree screens each have their own buttons: `module-button` in the editor, `practice-button` in the rotation menu, `replay-button` in step controls, and the sandbox's own row. They look and behave a little differently, sit in different places, and their keyboard shortcuts are written in several places or nowhere. `KeyboardHelp` (1h, 1m) is still a stub, so the shortcuts the editor already has (R, L, Esc, Ctrl+Z) are hidden. The design system's `Button` now exists, so the tree controls can use it.

## What Changes

- **Control bar (new).** `ControlBar`, a toolbar shared by the tree screens. It sits below the tree region, puts its groups in a fixed order (main action, other actions, undo and reset, help), has one tab stop with arrow-key movement, and wraps on a phone without page scroll.
- **Control button (new).** `ControlButton` wraps the base `Button`. It has an aria-hidden icon, the label, an optional key cap, `aria-keyshortcuts` from the registry, and a pressed state for toggles.
- **Keyboard help (new).** The real `KeyboardHelp` replaces its stub. It is a disclosure, "Keyboard shortcuts", closed by default, listing the active shortcuts of the screen from the registry. It moves from `STUBBED` to `BUILT`.
- **Shortcut registry (new).** `src/ui/controls/shortcuts.ts`.
- **Tree editor (changed).** The toolbar becomes a `ControlBar` below the tree region, the rotation menu uses `ControlButton`, and `KeyboardHelp` is shown at the end of the editor. The behaviour of every button and key stays the same.

## Out of scope

- Step controls and the sandbox, which are the next changes of the split. They keep their buttons here.
- The tree view's display controls (the Describe tree button and any zoom), which wait for `revamp-tree-view`.
- New tokens, and changes to the base `Button`. `ControlButton` only composes it.
- Lesson frame controls (Next, Back, Show rule), which are not tree controls.

## Capabilities

### New Capabilities
- `tree-controls`: the shared control bar, control buttons, the shortcut registry and keyboard help used by the tree screens.

### Modified Capabilities
- `tree-editor`: "Undo, reset and delete" (the toolbar becomes the control bar below the tree), "The editor works on a phone" (the new order), and "The editor is accessible" (toolbar arrow keys and keyboard help).

## Impact

- New: `src/ui/controls/` (`ControlBar.tsx`, `ControlButton.tsx`, `KeyboardHelp.tsx`, `shortcuts.ts`, `controls.css`), and the controls wording in `src/content/controls.ts`.
- Changed: `src/ui/editor/TreeEditor.tsx`, `TreeEditorToolbar.tsx` and `editor.css`, `src/ui/practice/RotationMenu.tsx`, `src/ui/contracts.ts` (`KeyboardHelp` built), and `src/ui/stubs/` (stub removed).
- Tests: a new `tests/ui/tree-controls.test.tsx`; `tests/ui/tree-editor.test.tsx` updated for the order; contracts counts 22 and 23.
- Decisions: D136 to D139. D125 to D131 are still unrecorded (used by `revamp-question-and-feedback`), so this change skips them.
- Depends on `add-ui-foundation` (base `Button`). There are no new dependencies, no storage change and no network calls.
