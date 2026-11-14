# tree-editor Specification

## Purpose
Lets a student edit a tree by hand, by touch, pointer or keyboard: select the next key and tap an empty branch to place it, rotate at a node from the rotation menu, delete a leaf, undo and reset, with an edit log and an in-order strip as text equivalents, and a layout that works on a 360 px phone.

## Requirements

### Requirement: Select the next key, then place it
The control bar SHALL offer "Place <key>" for the next key still to place, in the question's order. Activating it SHALL hold that key and announce it; activating it again or pressing Esc SHALL let go. While a key is held, every empty branch of the tree SHALL be drawn as a slot. Activating a slot SHALL place the held key there. An empty tree SHALL have one slot, the root. With no key left, "Place" SHALL be disabled and the editor SHALL say every key is placed. (D3, D132, D137, ID 8.3, FR-VIS-06)

#### Scenario: Place by tapping a slot
- **GIVEN** `c2-s01-task` (keys 10, 20, 30, 40, 50 into an empty BST)
- **WHEN** "Place 10" is activated and the one slot is activated, then "Place 20" and the slot right of 10
- **THEN** the tree is `10(·, 20)` and the control bar offers "Place 30"

#### Scenario: No slots until a key is held
- **WHEN** `chk6-04` is shown and no key is held
- **THEN** no slot is drawn; after "Place 27" every empty branch of the tree has one slot

#### Scenario: Let go
- **WHEN** a key is held and Esc is pressed
- **THEN** no key is held, the slots are gone and the tree is unchanged

#### Scenario: All placed
- **WHEN** the last key has been placed
- **THEN** the Place button has `aria-disabled="true"`, activating it does nothing, and the status reads that every key is placed

### Requirement: Wrong placements are drawn, not prevented
Every empty branch SHALL be a slot, whether or not the key belongs there, and a placement SHALL be drawn as made; the answer is marked only when the student checks it. The placed node SHALL be marked with the words "Placed by you" and a ring that is not colour alone. (D110, D132, ID 8.3 "forgiving")

#### Scenario: A wrong branch is accepted
- **GIVEN** the tree `20(10, 30)` and the key 25 to place
- **WHEN** 25 is placed in the slot left of 10
- **THEN** the tree is `20(10(25, ·), 30)` and no verdict is shown

#### Scenario: Placed node is marked
- **WHEN** a key is placed
- **THEN** that node carries the text "Placed by you" in its accessible name and a ring style different from the other nodes

### Requirement: Slots are targets for touch, pointer and keyboard
Each slot SHALL have a hit area of at least 44 by 44 px, be drawn as a dashed circle with the text "empty", and have the accessible name "Empty branch, left of 30" (or "Empty tree, root"). The slots SHALL be one tab stop after the tree's nodes: Left and Right (and Up and Down) move between slots in in-order order, Enter or Space places the held key. (FR-VIS-09, FR-VIS-10, NFR-02, D3)

#### Scenario: Slot names and size
- **WHEN** a key is held over `20(10, 30)`
- **THEN** there are four slots named "Empty branch, left of 10", "Empty branch, right of 10", "Empty branch, left of 30" and "Empty branch, right of 30", each with a hit area at least 44 units wide and high

#### Scenario: Keyboard placement
- **WHEN** a key is held, Tab moves into the slots, Right is pressed twice and Enter is pressed
- **THEN** the key is placed in the third slot in in-order order

#### Scenario: Not colour alone
- **WHEN** slots are shown
- **THEN** each slot has a dashed outline and the visible text "empty"

### Requirement: The rotation menu at the selected node
Selecting a node SHALL open the rotation menu with Rotate right, Rotate left and Cancel, and SHALL let go of a held key. From 768 px wide the menu SHALL sit beside the selected node; narrower, directly below the tree. R, L and Esc SHALL rotate right, rotate left and cancel while the editor has focus. Both directions SHALL stay enabled; a rotation with no child to lift SHALL change nothing and say why. (ID 8.3, wireframe 1h, D133, FR-VIS-06)

#### Scenario: Rotate from the menu
- **GIVEN** `chk5-03` (35 just inserted)
- **WHEN** node 40 is selected and "Rotate right at 40" is activated
- **THEN** the tree is the engine's right rotation at 40, the menu closes and no node is selected

#### Scenario: Keys
- **WHEN** node 20 of `20(10, 30)` is selected and R is pressed
- **THEN** the tree is `10(·, 20(·, 30))`

#### Scenario: Impossible rotation explained
- **WHEN** leaf 30 is selected and L is pressed
- **THEN** the tree is unchanged and the status reads "30 has no right child to rotate up."

#### Scenario: Menu labels
- **WHEN** node 40 is selected
- **THEN** the menu offers "Rotate right at 40", "Rotate left at 40" and "Cancel"

#### Scenario: Placement by width
- **WHEN** the editor stylesheet is read
- **THEN** below 768 px the menu is in normal flow after the tree region, and from 768 px it is positioned over the tree next to the selected node

### Requirement: Undo, reset and delete
The editor's control bar (`tree-controls`) SHALL sit below the tree region and hold Place, Delete (on a delete question), Undo and Reset, in that order. Undo and Reset SHALL be disabled when there is nothing to undo; Ctrl+Z (Cmd+Z on Apple) SHALL undo while the editor has focus. Undo SHALL step back one edit (placement, rotation or delete); Reset SHALL return to the question's start tree and keys. "Delete <key>" SHALL be enabled only while that key is a leaf. None of these buttons SHALL be styled as primary. (ID 8.3 "invalid moves can be undone", D41, D136)

#### Scenario: Rotate and undo
- **GIVEN** `chk5-03` after 35 is placed
- **WHEN** a right rotation about 40 is chosen and then Ctrl+Z is pressed
- **THEN** the tree is back to the tree before the rotation

#### Scenario: Reset
- **WHEN** two keys are placed in `c2-s01-task` and Reset is activated
- **THEN** the tree is empty and "Place 10" is offered

#### Scenario: Delete a leaf
- **GIVEN** `chk7-03` (delete 10)
- **WHEN** "Delete 10" is activated
- **THEN** 10 is gone from the tree and the Delete button is no longer shown

#### Scenario: Bar order
- **WHEN** `chk7-03` is shown
- **THEN** the control bar's buttons are Place key, Delete 10, Undo and Reset, in that order

#### Scenario: One primary action
- **WHEN** a build-tree question is shown
- **THEN** inside the question card the only element styled as primary is "Check answer" (the lesson frame's Next is outside the card)

### Requirement: The edit log
The editor SHALL show "Your edits", a numbered list with one sentence per edit (placement, rotation or delete), in order, built from the builder's step log with keys formatted as the question writes them; with no edits it SHALL show "No edits yet". Undo SHALL remove the last sentence and Reset SHALL clear the list. A new sentence SHALL be announced politely. The log SHALL contain no verdict. (wireframe 1m note 2, FR-VIS-07, D134)

#### Scenario: Sentences in order
- **WHEN** in `c2-s01-task` 10 is placed at the root and 20 right of 10
- **THEN** the log lists "1. Placed 10 at the root" and "2. Placed 20 as the right child of 10"

#### Scenario: Undo removes the last line
- **WHEN** a rotation is made and undone
- **THEN** the log no longer lists the rotation

#### Scenario: Rotation and delete sentences
- **WHEN** a right rotation at 40 is made, and in `chk7-03` 10 is deleted
- **THEN** the logs read "Rotated right at 40" and "Deleted 10"

#### Scenario: Empty log
- **WHEN** no edit has been made
- **THEN** the log reads "No edits yet"

#### Scenario: Letter keys
- **WHEN** a question with letter keys is edited
- **THEN** the log writes the keys as letters

#### Scenario: No verdict
- **WHEN** a key is placed in the wrong branch
- **THEN** the log sentence only states where it was placed

### Requirement: The in-order strip shows before and after
The editor SHALL show the in-order sequence of the tree on screen after every edit. After a rotation it SHALL show the sequence before and after the rotation, both computed by the engine, and the line "Same order: a rotation keeps the keys in order" when they are equal. After a placement it SHALL mark the new key in the strip with the words "new" as well as a style. (ID 7.2 C5 activity, ID 9.6 "In-order check before and after each rotation", LO4)

#### Scenario: Before and after a rotation
- **WHEN** a rotation is made in `chk5-03`
- **THEN** the strip lists "In-order before" and "In-order after" with the same keys and the "Same order" line

#### Scenario: New key marked
- **WHEN** 35 is placed
- **THEN** 35 in the strip carries the word "new"

#### Scenario: After undo
- **WHEN** a rotation is undone
- **THEN** the strip shows a single in-order sequence of the current tree

### Requirement: The editor works on a phone
At 360 px wide the editor SHALL lay out in one column — tree region, rotation menu (when open), control bar, in-order strip, edit log, keyboard help — with no horizontal page scroll; a wide tree SHALL scroll inside its own region. When a key is held or a node is selected, the first slot or the selected node SHALL be scrolled into view in the tree region. Every button, node and slot SHALL be at least 44 px. (D3, D135, D136, NFR-02, NFR-04)

#### Scenario: No page scroll at 360 px
- **WHEN** `c6-s08-task` (a 14-node start tree) is rendered at 360 px wide
- **THEN** the document is no wider than the viewport and the tree region scrolls horizontally

#### Scenario: Order on a phone
- **WHEN** the editor is rendered below 768 px with a node selected
- **THEN** the DOM order is tree region, rotation menu, control bar, in-order strip, edit log, keyboard help

#### Scenario: Targets
- **WHEN** the editor and controls stylesheets are read
- **THEN** control buttons, menu buttons, node hit areas and slot hit areas are at least 44 px

### Requirement: The editor is accessible
The editor SHALL have no axe violations with no key held, with a key held, with the menu open, with keyboard help open, and after an answer is checked. Every action SHALL be usable by keyboard alone, and its shortcuts SHALL be listed in keyboard help. Colour SHALL never be the only signal of a held key, a slot, a selected node or a placed node. Disabled after an answer is checked, the editor SHALL take no edits. (NFR-02, ID 11, FR-VIS-10)

#### Scenario: Axe in each state
- **WHEN** a build-tree question is rendered, a key held, a node selected, keyboard help opened, then the answer checked
- **THEN** axe reports no violations in any state

#### Scenario: Keyboard only
- **WHEN** `chk6-04` is answered with the keyboard only
- **THEN** Place, every slot, every node, the rotation menu, Undo, Reset and Check answer can be reached and used, moving within the control bar by arrow keys

#### Scenario: Locked after checking
- **WHEN** the answer is checked
- **THEN** Place, Undo, Reset and Delete have `aria-disabled="true"`, and Place, slots, the menu, Undo, Reset and Delete take no action

### Requirement: Tree editor states are in the state matrix and meet the quality bar
Each state of the tree editor SHALL have a state-matrix entry, and each entry SHALL pass the ui-foundation quality-bar requirements: three widths in light and dark, axe, the keyboard walk, the colour simulations and forced colours, targets and text size, reduced motion, and calm wording. (Quality bar 1 to 10, ui-quality-sweep)

#### Scenario: States listed
- **WHEN** the state-matrix manifest is read
- **THEN** it has an entry for each of these states: empty, a node selected, an empty slot targeted, a rotation offered, after an undo, keyboard mode with the instructions shown

#### Scenario: Entries pass
- **WHEN** the matrix spec and the quality checks run on those entries
- **THEN** each has a matching baseline at 390, 768 and 1366 px in light and dark, and each quality-bar check passes or is recorded as a deferred finding in the change that deferred it
