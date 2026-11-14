# Spec Delta

## MODIFIED Requirements

### Requirement: The tree builder
A `build-tree` or `perform-rotation` question SHALL start from its tree and be answered in the tree editor (`tree-editor`): the keys still to insert are placed one at a time by selecting the next key and then an empty branch on the tree; a selected node can be rotated left or right with the rotation menu, and a delete operation offers Delete for its key. Undo, Reset, the edit log and the in-order sequence SHALL always be shown, and every action SHALL work by touch, pointer and keyboard. The answer is the tree on screen. (ID 8.3, D3, D132)

#### Scenario: Place a key by its branch
- **WHEN** `c2-s01-task` is shown
- **THEN** "Place 10" is offered; once it is held there is one slot (the empty tree), and after placing 10, "Place 20" is offered and holding it shows two slots (left and right of 10)

#### Scenario: Rotate and undo
- **GIVEN** `chk5-03` after 35 is placed
- **WHEN** a right rotation about 40 is chosen and then Undo
- **THEN** the tree is back to the tree before the rotation

#### Scenario: Keyboard
- **WHEN** `chk6-04` is answered with the keyboard only
- **THEN** Place, every slot, the rotation menu, Undo, Reset and Check answer can be reached and used

#### Scenario: No target button list
- **WHEN** a build-tree question is shown with a key still to place
- **THEN** there are no "Put <key> left of <node>" buttons under the tree
