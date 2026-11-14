# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Please read these before `/opsx:apply`.

1. **Settled (user, 14 Nov): two columns, as wireframe 1n.** On a wide screen the sandbox has a control column on the left and the tree filling the right. On a phone the tree comes first, then the column. The user also chose to move the sandbox's buttons onto the shared control bar in this change, which is step 2 of the tree-controls split.
2. **Assumed, not blocking: DOM order and breakpoint (D140).** In the DOM the tree column comes first, then the control column. From `BREAKPOINTS.tablet` (768 px), a CSS grid shows the control column on the left, as in 1n, and the tree column on the right, in a balanced two to three split (controls at least 18rem; user, 14 Nov). Below that width there is one column: tree, then controls. Keeping the tree first in the DOM keeps D136 (the control bar follows the tree) on every width and keeps the phone order natural. The cost is that on a wide screen Tab reaches the tree before the controls on its left. The a11y check in task 3.3 looks at this. If it fails, swapping the DOM order is a one-line change.
3. **Assumed, not blocking: the column is split into named sections (D141).** In this order: "Change the tree" (key field and control bar), "Rebalancing" (the switch and its hint), "Numbers" (statistics), then keyboard help. "What happened" (event log) sits under the tree, so each result appears beside the change it describes, in its own scrolling box (user, 14 Nov). Each section has a level-2 heading, so a reader can jump between them and a screen reader lists them. The tree column holds the tree, its "Describe tree" text, "What happened" and "Replay last insert". The intro line stays above both columns.
4. **Assumed, not blocking: no primary button.** Wireframe 1n makes Insert primary. D139 keeps control bars free of primary buttons so every tree screen looks the same. Insert stays the first button in the bar, and Enter in the key field still inserts.
5. **Assumed, not blocking: unavailable buttons stay focusable.** At 15 nodes, Insert, "Insert 1 to 7 in order" and Random key use `aria-disabled` (D137), not native `disabled`. They stay focusable and do nothing, and the full message explains why. This changes "Fifteen-node cap".
6. **Assumed, not blocking: sandbox shortcuts in the registry (D138).** The tree's arrow keys and Enter, the bar's arrow keys, and Enter in the key field to insert are registered for the sandbox, and keyboard help lists them. No new shortcuts are added.
7. **Flagged for the user to read:** the section headings "Change the tree", "Rebalancing", "Numbers" and "What happened", and the help action "Insert the key in the field". All other sandbox wording is unchanged.

How the layout serves different learners (ID 8.1, ID 8.2, UDL in ID 11). It changes the arrangement, and no representation is added or removed:

| Learner (ID 8.1) | What the layout gives them |
| --- | --- |
| Visual / Reflector | The tree is the largest region and is never pushed below the controls on a wide screen. The replay sits beside it. |
| Read/write / Theorist | Named sections for Numbers and What happened, the switch hint in words, and "Describe tree" under the tree. |
| Kinesthetic / Activist | Tap a node to fill the key field, one control bar with the same buttons and keys as the tree editor, and Enter to insert. |
| Pragmatist | "Insert 1 to 7 in order" and Rebalancing ON/OFF side by side in one column, to compare the shapes quickly. |
| Keyboard and screen-reader users (UDL) | Headings to jump between sections, a toolbar with one tab stop, and keyboard help listing every key. |

Serves FR-VIS-08, FR-VIS-09, FR-VIS-10, FR-MOT-04, NFR-02, NFR-04, D3; LO1; ID 8.1, 8.2, 8.3; UDL; wireframe 1n.

## Why

The sandbox is one long column: intro, key field, two button rows, switch, statistics, tree, replay and log. The tree, its main representation (ID 8.2), is in the middle of the page, below six controls. On a laptop the student scrolls past the controls to see the effect of a button, and back up to press the next one. Statistics and the log have no headings, so they are hard to find and to tell apart. The sandbox buttons are also the last tree controls outside the shared control bar.

## What Changes

- **Two-column layout (new).** From 768 px: a control column on the left and the tree column on the right, two to three, with the page at most 75rem wide. Below 768 px: the tree, then the controls. There is no horizontal page scroll at 360, 768 or 1366 px with 15 nodes.
- **Named sections (new).** "Change the tree", "Rebalancing", "Numbers" and "What happened" are level-2 headings in the control column. Keyboard help comes last.
- **Control bar (changed).** Insert, Delete, "Insert 1 to 7 in order", Random key and Clear move to the shared `ControlBar` and `ControlButton`, with icons. The key field stays a labelled field above the bar, and Enter submits.
- **Full tree (changed).** Unavailable buttons use `aria-disabled`.
- **Keyboard help (new on this screen).** It lists the sandbox's keys from the registry.

## Out of scope

- Any change to what the sandbox does: the engine operations, messages, statistics, log wording, the 15-node cap and the replay.
- Step controls inside the replay, which are the next change of the split.
- Text-to-speech narration (D26).
- Saving the sandbox (D59 stands).

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `sandbox`: a new layout requirement and a new keyboard help requirement; "Fifteen-node cap" (`aria-disabled`); "Nothing saved, accessible" (sections, control bar, three widths).
- `tree-controls`: "The control bar" (below the tree in the DOM and on a phone; a screen may show it in a side column from 768 px).

## Impact

- Changed: `src/pages/Sandbox.tsx` (columns and sections), `src/ui/sandbox/InsertControl.tsx` (control bar), `src/ui/sandbox/TreeStats.tsx` and `src/ui/sandbox/EventLog.tsx` (section headings), `src/ui/sandbox/sandbox.css` (grid), `src/ui/controls/shortcuts.ts` (sandbox screen), `src/content/sandbox.ts` and `src/content/controls.ts` (headings, one help action).
- Tests: `tests/ui/sandbox.test.tsx` updated (`aria-disabled`, sections), and a new `tests/ui/sandbox-layout.test.tsx`.
- Decisions: D140, D141, and a note on D136.
- There are no new dependencies, no storage change and no network calls.
