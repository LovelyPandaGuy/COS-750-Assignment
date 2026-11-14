# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Please read these before `/opsx:apply`.

1. **Settled (D3, user 14 Nov): tap to select, then tap to place.** D3 asks for "tap-to-select then tap-to-place" on phones, and the lesson content already says "click the empty branch where it belongs" (`c2-s01-task`). This replaces D110's list of "Put 22 left of 30" buttons under the tree. New row D132 supersedes D110's placement method; its "a wrong placement is drawn and then marked, not prevented" stays.
2. **Assumed, not blocking: what is selected first.** The student selects the next key with "Place 22" in the toolbar (the `TreeEditorToolbar` "Place key" action of wireframe 1m). While the key is held, every empty branch is drawn on the tree as a slot, and tapping a slot places it. Esc or tapping "Place 22" again lets go of the key. Keys are placed in the question's order, so only the next key can be selected. Recorded in D132.
3. **Assumed, not blocking: where the rotation menu opens (D133).** From 768 px wide it opens next to the selected node, over the tree, as in wireframe 1h. Narrower than that it is a panel directly below the tree, so it never covers the tree on a phone. The 768 px value is `BREAKPOINTS.tablet` in `src/ui/breakpoints.ts`, so changing it changes one place.
4. **Assumed, not blocking: the edit log (D134).** A numbered list of every edit in words ("1. Placed 35 as the left child of 40", "2. Rotated right at 40"), as in wireframe 1m note 2. It is the text equivalent of the edited tree. Undo removes the last line and Reset clears the list. It shows no verdict, so it gives nothing away in a check.
5. **Settled by the ID (7.2 C5 activity, 9.6 misconceptions): in-order strip before and after.** After each rotation the strip shows the in-order sequence before and after it, and says in words that the order is the same. The engine computes both sequences. After a placement it marks the new key with a word, not only colour.
6. **Assumed, not blocking: phone layout (D135).** At 360 px there is no horizontal page scroll. Top to bottom: the toolbar, the tree in its own scroll region, the rotation menu when it is open, the in-order strip and the edit log. A held key's slots and a selected node are scrolled into view. Every target is at least 44 px.
7. **Flagged for the user to read:** the new labels ("Place 22", "Let go of 22", "Empty branch, left of 30", "Placed by you", "Your edits", "No edits yet", "In-order before", "In-order after", "Same order: a rotation keeps the keys in order", the edit-log sentences). Screen and question text is unchanged.

Serves FR-VIS-06 (do it yourself), FR-VIS-07 (text equivalent), FR-VIS-09 and FR-VIS-10 (keyboard and touch), FR-ASM-02 (tree answers), NFR-02, D3; LO4 (perform rotations; verify BST order), LO5 (insertion) and LO7 (deletion, optional) through the build-tree and perform-rotation questions; ID 8.3 (direct manipulation, forgiving design) and ID 11.2.

## Why

The tree builder is the only place a student builds a tree by hand. It is used by `build-tree` and `perform-rotation` questions in C2, C5, C6, C7 and C9. At the moment, keys are placed by choosing from a growing list of text buttons under the tree, which is slow on a phone and unlike the "click the empty branch" the content asks for. The rotation menu sits away from the node it acts on. There is no record of what the student did, and the in-order strip does not show the before and after comparison the ID uses against the "a rotation breaks the BST order" misconception. Wireframes 1h and 1m and D3 describe the intended editor, and their phone version was never drawn.

## What Changes

- **Tap to select, then tap to place (changed).** "Place 22" selects the next key. Every empty branch then appears on the tree as a slot that can be tapped or clicked, or reached with Tab and arrow keys and used with Enter. The list of target buttons is removed. Wrong placements are still drawn and marked later.
- **Rotation menu (changed).** It opens beside the selected node on wide screens and below the tree on narrow screens. It has keys R and L to rotate and Esc to cancel. Both directions stay enabled, and an impossible rotation is explained, not hidden.
- **Edit log (new).** A numbered text list of the student's edits, built from the builder's own log of steps. It replaces the `EditLog` stub.
- **In-order strip (changed).** Shows the sequence before and after the last rotation, says the order is the same, and marks a newly placed key.
- **Toolbar (new).** It replaces the `TreeEditorToolbar` stub: Place key, Undo (also Ctrl+Z or Cmd+Z), Reset, and Delete on delete questions. None of these is the primary button, so "Check answer" stays the one primary action (D41).
- **Phone layout (new).** One column at 360 px, with no page scroll sideways, 44 px targets, and the menu below the tree.

## Out of scope

- Dragging nodes or keys. D3 makes tapping the alternative to dragging, and dragging is a later change.
- The live balance readout of wireframe 1m. In a check it would show which nodes are unbalanced and give away part of the answer.
- `KeyboardHelp`, which stays a stub. The keys are announced through `aria-keyshortcuts` and button labels.
- The sandbox, which keeps its insert field (D56). Watch mode and the replay are also unchanged.
- Animated rotations (D32): the tree still snaps to its new shape.

## Capabilities

### New Capabilities
- `tree-editor`: editing a tree by hand. It covers selecting and placing keys, slots, the rotation menu, the toolbar, undo and reset, the edit log, the in-order strip and the editor's phone layout.

### Modified Capabilities
- `lesson-questions`: "The tree builder" now uses the tree editor for build-tree and perform-rotation questions, and its scenarios change from target buttons to slots.

## Impact

- New: `src/ui/editor/` (`TreeEditor.tsx`, `SlotOverlay.tsx`, `editor.css`), and real `EditLog` and `TreeEditorToolbar` components that replace the stubs and keep their contracts in `src/ui/contracts.ts` (they move from `STUBBED` to `BUILT`).
- Changed: `src/ui/lesson/questions/builder.ts` (held key, last rotation's before and after), `Controls.tsx` (`TreeBuilder` hands over to `TreeEditor`), `src/ui/practice/RotationMenu.tsx` and `InOrderStrip.tsx`, the editor copy in `src/content/lesson.ts`, and `src/ui/lesson/lesson.css` (the old target-list rules are removed).
- Decisions: D132 to D135 added to `.claude/docs/decisions.md`, and D110 marked superseded in part.
- Tests: `tests/ui/tree-builder.test.ts` is extended, and a new `tests/ui/tree-editor.test.tsx` is added.
- There are no new dependencies, no storage change and no network calls. How answers are marked is unchanged, because the answer is still the tree on screen.
