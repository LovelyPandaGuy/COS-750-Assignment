# Design

## Context

See proposal.md for why. Today:
- The tree editor's toolbar (`src/ui/editor/TreeEditorToolbar.tsx`) is a `role="toolbar"` div of `module-button`s above the tree, with no arrow-key movement.
- The rotation menu uses `practice-button`s.
- Step controls use `replay-button`s, and the sandbox uses `module-button`s.
- The base `Button` (`src/ui/base/Button.tsx`, add-ui-foundation) has primary, secondary and quiet variants, the design-system states, a 44 px minimum and an optional disabled reason. It only knows native `disabled`.
- `KeyboardHelp` is a stub with the contract `{ heading, keys: { keys, action }[] }` in `src/ui/contracts.ts`.
- The editor's shortcuts live in `TreeEditor`'s `onKeyDown`, plus `aria-keyshortcuts` strings typed in two components.

## Goals / Non-Goals

**Goals:**
- Pieces that step controls and the sandbox can adopt later without changing them: `ControlBar`, `ControlButton`, `KeyboardHelp` and the registry.
- The editor's behaviour unchanged except for placement, focus movement in the bar, and the help.

**Non-Goals:**
- Moving step controls or the sandbox in this change.
- Changing the base `Button` or adding tokens.

## Decisions

### 1. `ControlBar` owns roving focus (D137)

`ControlBar` takes a label and children and renders `role="toolbar"`, `aria-label` and `aria-orientation="horizontal"`. It finds its buttons with `querySelectorAll('button')` after each render and keeps one at `tabIndex=0`: the last one focused, otherwise the first. Left and Right wrap around, and Home and End jump to the ends.

The bar sets `tabIndex` on the DOM directly in an effect rather than through props, so callers only render `ControlButton`s. The stored index is clamped when the button count changes, for example when Delete disappears.

*Alternative:* a context that each button registers with. This was rejected because it is more code for the same result with a handful of buttons.

### 2. `ControlButton` composes `Button`, and disabled means `aria-disabled` (D137, D139)

`ControlButton` renders the base `Button` with:
- `variant` set to secondary or quiet (primary is not accepted by its type);
- an `icon` in an aria-hidden span, then the label;
- an optional `shortcut` id, which looks up the registry for `aria-keyshortcuts` and the key cap.

For disabled it passes `aria-disabled="true"` rather than native `disabled`, and its click handler returns early, so the button stays focusable in the toolbar. `controls.css` gives `.btn[aria-disabled='true']` the same `--disabled-*` tokens as the base `:disabled` rule.

A toggle passes `pressed`, which becomes `aria-pressed`. Its style is the secondary pressed background (`--action-primary-tint`), and `border-style: dashed` as the non-colour cue.

*Alternative:* add `aria-disabled` support to the base `Button`. This was rejected because that is `add-ui-foundation`'s capability, which is still in flight. If it later supports this, `ControlButton` can pass it through.

### 3. The registry is data (D138)

`shortcuts.ts` exports `SHORTCUTS`, a record of ids such as `rotateRight`, `rotateLeft`, `cancel`, `undo`, `treeMove`, `treeSelect`, `barMove`, `stepPlay`, `stepBack`, `stepForward` and `stepSpeed`. Each entry has:
- `aria`, the `aria-keyshortcuts` value;
- `caps`, the visible key caps;
- `action`, the wording, which comes from `src/content/controls.ts`;
- `screens`, a subset of `'editor' | 'replay' | 'sandbox'`.

`shortcutsFor(screen)` returns the list for `KeyboardHelp`. `TreeEditor`'s key handler keeps its logic but checks keys through `matches(id, event)` from the same module, so the handler and the help cannot drift apart.

### 4. `KeyboardHelp` is a disclosure

`KeyboardHelp` keeps its contract: a `heading` and `keys`. It is a quiet `Button` with `aria-expanded` and `aria-controls`, "Show keyboard shortcuts", opening a `<dl>` of `<kbd>` caps and actions. Closed is the default and is not stored. It replaces the stub and moves from `STUBBED` to `BUILT`, bringing the contracts counts to 22 and 23.

### 5. Editor layout (D136)

`TreeEditor` renders, in this order:

1. the tree region;
2. the rotation menu (in normal flow below 768 px, beside the node from 768 px, as before);
3. the `ControlBar` (Place, Delete, Undo, Reset);
4. the in-order strip;
5. the edit log;
6. `KeyboardHelp` with `shortcutsFor('editor')`;
7. the status line.

`TreeEditorToolbar` keeps its props but renders through `ControlBar` and `ControlButton`. `RotationMenu` uses `ControlButton` with the `rotateRight`, `rotateLeft` and `cancel` shortcuts. `editor.css` drops its own button rules.

### Decision rows

| ID | Topic | Decision |
| --- | --- | --- |
| D136 | Control bar placement | A tree screen's control bar sits directly below the tree region, groups ordered main action, other actions, undo and reset (1f, 1h; ID 8.3). Changes D135's editor order. |
| D137 | Control bar keyboard | WAI-ARIA toolbar: one tab stop, Left and Right wrap, Home and End; disabled buttons use `aria-disabled` and stay focusable. |
| D138 | Shortcut registry | Every tree shortcut is defined once in `src/ui/controls/shortcuts.ts` (keys, caps, action wording, screens); `aria-keyshortcuts`, the key handlers and `KeyboardHelp` read it. |
| D139 | Tree control buttons | Tree controls use the base `Button` through `ControlButton`: secondary or quiet, aria-hidden icon then label, key cap; toggles use `aria-pressed` with a dashed border. |

## Risks / Trade-offs

- [`aria-disabled` buttons can still be clicked] → `ControlButton` ignores the click, and a test activates each disabled control by click and by Enter.
- [Existing tests assert `toBeDisabled()`] → The tree-editor tests are updated to check `aria-disabled` in the red-test task, following the modified scenarios.
- [Moving the bar below a tall tree pushes it down on a phone] → The tree region keeps its height and scrolls only sideways. The pilot will show whether a pinned bar is needed. That would be a CSS change in `controls.css`.
- [Depends on `add-ui-foundation`, which is not archived] → Its `Button` is already in the code and covered by its tests. Archive `add-ui-foundation` before this change.

## Migration Plan

No data migration. Rollback is reverting the change.
