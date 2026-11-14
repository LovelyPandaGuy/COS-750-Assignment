# Design

## Context

See proposal.md for why. The current editor is `TreeBuilder` in `src/ui/lesson/questions/Controls.tsx`. It sits on a pure reducer in `builder.ts` (`place`, `select`, `rotate`, `delete`, `undo`, `reset`, with a `log` of `BuilderStep`s and a `history` of snapshots). It draws an interactive `TreeView` with a list of target buttons below it, then `RotationMenu` (`src/ui/practice/`), Undo, Reset and `InOrderStrip`. `QuestionCard` renders it for `build-tree` and `perform-rotation` and marks the answer from the reported tree (`src/live/mark.ts`).

`TreeView` already provides most of what the slots need:
- an `overlay(layout)` render prop drawn inside the SVG above the nodes (not usable for buttons; see decision 2);
- `emptySlots(layout)` in `layout.ts`, which gives every empty child position with its x and y;
- one roving tab stop for the nodes and a horizontally scrolling region for wide trees.

`EditLog` and `TreeEditorToolbar` exist as stubs with contracts in `src/ui/contracts.ts` (wireframe 1m).

## Goals / Non-Goals

**Goals:**
- One editor component used by every build-tree and perform-rotation question, with the reducer still the single source of state.
- The answer, the marking and the stored attempt stay exactly as they are.

**Non-Goals:**
- Changing `TreeView`'s node keyboard model, or adding drag.
- Using the editor in the sandbox.

## Decisions

### 1. The reducer gains a held key and the last rotation

`BuilderState` gets two new fields:
- `held: boolean`, set by the new actions `hold` and `letGo`. `place` now needs `held` and clears it. `select` clears it, so holding a key and selecting a node never happen together.
- `lastRotation: { before: Key[]; after: Key[] } | null`, set by `rotate` from `inOrderKeys` on the trees before and after the rotation, and cleared by every other edit and by undo and reset.

Keeping these in the reducer means the edit log, the strip and the keyboard shortcuts read one state, and the existing reducer tests extend to cover them.

*Alternative:* keep `held` in component state. This was rejected because undo and reset would then need extra code to clear it.

### 2. Slots are a control layer over `TreeView`

`SlotOverlay` draws one `<g role="button">` per empty branch, with the accessible name "Empty branch, left of 30", a dashed circle with the word "empty", and a transparent 44-unit hit rectangle. The positions come from `emptySlots(layout)`, and the order comes from `targetsOf(tree)`, which is in-order. The two are matched by `parent:side`.

The slots cannot sit inside the tree's SVG. That SVG has `role="tree"`, which may only contain tree items (axe aria-required-children). So `TreeView` gains a `layer` prop: a second, labelled SVG with the same size, stacked over the drawing inside the scroll region, so it scrolls with the tree. The existing `overlay` prop and its contract are unchanged. While a key is held, `TreeView` takes `extraHeight` to make room for the slot row under the deepest level. The empty tree has no layout, so `TreeEditor` draws a single root slot in its place.

The slots are one roving tab stop, and the arrow keys move through them in in-order order.

*Alternative:* keep the button list as a hidden fallback. This was rejected because two ways to do one thing doubles the tab stops, and the slots are already keyboard-operable.

### 3. One `TreeEditor` component with a fixed DOM order

`src/ui/editor/TreeEditor.tsx` renders, in this order:

1. `TreeEditorToolbar`: Place, Undo, Reset, and Delete on delete questions.
2. The `TreeView` with `SlotOverlay`.
3. `RotationMenu`, while a node is selected.
4. `InOrderStrip`.
5. `EditLog`.
6. The status line (polite live region).

`TreeBuilder` in `Controls.tsx` becomes a thin wrapper that keeps its props, so `QuestionCard` does not change. `EditLog` and `TreeEditorToolbar` replace their stubs and keep their contracts, and they move from `STUBBED` to `BUILT`. The toolbar contract gains `deleteKey: Key | null` and `onDelete`, and its `nextKey`/`onInsert` pair is the Place action.

### 4. Rotation menu placement is CSS only (D133)

The menu stays in DOM position 3 at every width, so the reading and tab order never depends on the width. From `BREAKPOINTS.tablet` (768 px) the tree region is `position: relative`, and the menu is `position: absolute` at the selected node's drawn `x` and `y`, passed as CSS custom properties (`--menu-x`, `--menu-y`). Below that width the menu stays in normal flow. The menu's buttons and the R/L/Esc handling do not change between widths.

*Alternative:* a portal popover. This was rejected because it moves focus order away from the tree and needs focus-trap code.

### 5. Shortcuts on the editor group

One `onKeyDown` on the editor's `role="group"` handles these keys:
- R and L: rotate the selected node.
- Esc: let go of the held key, or close the menu.
- Ctrl+Z or Cmd+Z: undo.

Shortcuts are ignored when the editor is disabled or the event comes from a text field. The buttons declare `aria-keyshortcuts`.

### 6. Edit log sentences from the step log (D134)

`editLogEntries(log, formatKey)` is a pure function in `src/ui/editor/editLog.ts`. It turns each `BuilderStep` into a sentence using copy functions in `src/content/lesson.ts` (`placedRoot`, `placedChild`, `rotated`, `deleted`). Undo and reset already rewind `log`, so the list follows them for free. The newest entry is announced in the editor's status line.

### 7. Phone layout (D135)

`editor.css` is a single column using `gap` tokens only. The tree region keeps `TreeView`'s own `overflow-x: auto`. When `held` becomes true or the selection changes, `TreeEditor` calls `scrollIntoView({ block: 'nearest', inline: 'center' })` on the first slot or the selected node. jsdom tests check that the call happens. The 360 px check is made in the quality-bar run. The old `.q-targets` and `.q-target` rules are removed from `lesson.css`.

### Decision rows

| ID | Topic | Decision |
| --- | --- | --- |
| D132 | Placing keys | Place keys by "Place <key>", then tapping an empty-branch slot drawn on the tree. Every empty branch is a slot, and a wrong placement is drawn and marked later. Supersedes D110's button list. |
| D133 | Rotation menu | Beside the selected node from 768 px (`BREAKPOINTS.tablet`); below the tree narrower. Shortcuts R, L and Esc. |
| D134 | Edit log | A numbered sentence per edit from the builder's step log; undo removes the last, reset clears; no verdict. |
| D135 | Editor on phones | One column at 360 px: toolbar, tree region, menu, strip, log. The tree scrolls in its own region, and slots and the selected node are scrolled into view. |

## Risks / Trade-offs

- [Selecting "Place" before every key adds a tap per key] → The tap is what D3 asks for, and the toolbar button sits in the same place every time. If the pilot finds it slow, holding the next key automatically after each placement is a one-line reducer change.
- [A slot overlaps a node in a dense tree] → Slots sit half a slot-width from their parent at the next level. This is the layout `emptySlots` already uses, and `layoutTree` gives every key its own column. A test renders `c6-s08-task` and checks that no slot hit area intersects a node's hit area.
- [The menu covers part of the tree on a tablet] → It opens to the side away from the tree's centre, using the node's x against half the layout width, and Esc closes it.
- [Keyboard shortcuts clash with screen-reader keys] → They only work while focus is inside the editor group, and every one also has a button.

## Migration Plan

No data migration. Stored attempts keep the same answer format. Rollback is reverting the change.
