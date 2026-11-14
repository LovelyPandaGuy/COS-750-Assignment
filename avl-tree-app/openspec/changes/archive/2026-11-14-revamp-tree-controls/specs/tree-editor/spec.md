# Spec Delta

## MODIFIED Requirements

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
