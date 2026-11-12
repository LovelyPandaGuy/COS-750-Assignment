# Spec Delta

## Purpose
Lets the student switch from watching to doing: select a node, choose a rotation, see feedback computed from the new tree, and undo or reset. Practice never counts toward readiness.

## ADDED Requirements

### Requirement: Watch or Do it yourself switch
The system SHALL show a switch labelled "Mode" with two options, "Watch" and "Do it yourself", as native radio inputs, with Watch selected at first. Watch SHALL show the content the screen supplies for it; Do it yourself SHALL show the practice area instead. Each time Do it yourself is entered the practice SHALL start fresh, with no history and no selection. (wireframe 1h, FR-VIS-06)

#### Scenario: Default and switching
- **WHEN** the switch is first rendered
- **THEN** Watch is selected and the supplied Watch content is shown and the practice area is not
- **AND WHEN** Do it yourself is chosen **THEN** the practice area is shown and the Watch content is not

#### Scenario: Keyboard
- **WHEN** focus is on the selected radio and an arrow key is pressed
- **THEN** the other option is selected, as for any radio group

#### Scenario: Fresh on each entry
- **GIVEN** the student has made one rotation in Do it yourself
- **WHEN** they switch to Watch and back
- **THEN** the tree is the start tree and Undo is disabled

#### Scenario: Targets
- **WHEN** the switch is rendered
- **THEN** each option's target is at least 44 px high and wide

### Requirement: Practice starts from the unbalanced tree
The practice area SHALL start from the tree as it stands after a plain BST insert of the example key, before any rebalancing, with the inserted node marked "new", and SHALL show a task prompt, "Your turn", saying how many rotations the engine's trace needs: one for LL and RR, two for LR and RL. If the plain insert leaves no node out of balance, the practice area SHALL say that this example needs no rotation and SHALL offer no editing. (wireframe 1h, FR-VIS-06, FR-ENG-04)

#### Scenario: One rotation
- **GIVEN** the base tree 30 with left child 20 and the key 10
- **THEN** the start tree is 30, 20, 10 in a left chain, node 10 is marked new, node 30 shows bf +2, and the task prompt says one rotation

#### Scenario: Two rotations
- **GIVEN** the base tree 30 with left child 10 and the key 20
- **THEN** the task prompt says two rotations

#### Scenario: Nothing to rotate
- **GIVEN** the base tree 20 with children 10 and 30 and the key 5
- **THEN** the practice area says no rotation is needed and there is no rotation menu

### Requirement: Student-performed rotation
The system SHALL let the student rotate left or right at any selected node. A valid rotation SHALL lift the child on that side, keep the in-order sequence, attach the rotated subtree to the same parent on the same side, and leave every stored height correct all the way to the root. A rotation with no child on that side SHALL leave the tree unchanged and give a specific message naming the node and the missing child. (FR-VIS-06, FR-ENG-04, NFR-08)

#### Scenario: Valid rotation below the root
- **GIVEN** the tree 40 (left 20 with a left chain 10, 5; right 60)
- **WHEN** the student rotates right at 20
- **THEN** the tree is 40 with left child 10 (children 5 and 20) and right child 60, and the stored heights are 5:0, 20:0, 10:1, 60:0, 40:2

#### Scenario: No child to lift
- **GIVEN** the tree 30, 20, 10 in a left chain
- **WHEN** the student rotates left at 30
- **THEN** the tree is unchanged, no history entry is added, and the message says node 30 has no right child to lift

#### Scenario: Any rotation keeps order and heights
- **GIVEN** any valid BST and any key in it and either direction (property test)
- **WHEN** a rotation succeeds
- **THEN** the in-order sequence is the same, `analyseTree` reports no height mismatches, and when it is refused the result is the same tree object

### Requirement: Feedback on a rotation
After every rotation the system SHALL show feedback computed from the new tree. It SHALL be "Balanced" if no node is out of balance, whichever node was rotated. Otherwise, if the node now at the top of the rotated subtree is out of balance with the opposite sign to the rotated node's balance factor before, it SHALL say that the subtree now leans the other way, naming that node and its balance factor. Otherwise it SHALL name the lowest node still out of balance and its balance factor. Wording SHALL be "not quite yet", SHALL say the attempt is not counted, and SHALL suggest Undo. (FR-VIS-06, wireframe 1h note 3, design principle 1)

#### Scenario: Balanced
- **GIVEN** the tree 30, 20, 10 in a left chain
- **WHEN** the student rotates right at 30
- **THEN** the feedback is Balanced, the tree has root 20 with children 10 and 30, and the feedback says every node is now between −1 and +1 and that the in-order sequence did not change

#### Scenario: Balanced by another rotation
- **GIVEN** the tree 40 (left 20 with a left chain 10, 5; right 60)
- **WHEN** the student rotates right at 40
- **THEN** the feedback is Balanced, because the new tree has no node out of balance

#### Scenario: Leans the other way
- **GIVEN** the tree 30 with left child 10 whose right child is 20
- **WHEN** the student rotates right at 30
- **THEN** the feedback says the subtree now leans the other way, naming node 10 with balance factor −2

#### Scenario: Still unbalanced
- **GIVEN** the tree 30, 20, 10 in a left chain
- **WHEN** the student rotates right at 20
- **THEN** the feedback names node 30 with balance factor +2 as still out of balance

#### Scenario: Double rotation in two steps
- **GIVEN** the tree 30 with left child 10 whose right child is 20
- **WHEN** the student rotates left at 10, then right at 30
- **THEN** the first feedback names node 30 at +2 as still out of balance, and the second is Balanced

#### Scenario: Wording
- **WHEN** every feedback kind is rendered
- **THEN** none uses red, "wrong", "incorrect" or "fail"; each starts with a distinct word or icon; and the not-balanced kinds say the attempt is not counted against the student and mention Undo

#### Scenario: Announced
- **WHEN** feedback or a refusal message appears
- **THEN** it is in a polite live region, and focus moves to the feedback panel after a rotation

### Requirement: Rotation menu
Selecting a node (click, tap or Enter) SHALL show a menu, labelled "Rotate at node n", with "Rotate right at n (R)", "Rotate left at n (L)" and "Cancel (Esc)". Both rotation buttons SHALL stay enabled so a refusal can explain itself. After a rotation the selection SHALL clear and the menu close. When focus is inside the practice area and a node is selected, R, L and Esc SHALL act as the buttons do; they SHALL ignore key presses with Ctrl, Alt or Meta, and SHALL do nothing when no node is selected. A line of help SHALL list the keys. Every control SHALL have a target of at least 44 px. (FR-VIS-06, FR-VIS-10, D3, wireframe 1h)

#### Scenario: Select then choose, by pointer or touch
- **WHEN** the student taps node 30 and then "Rotate right at 30"
- **THEN** the rotation is performed as in "Student-performed rotation", with no drag

#### Scenario: Keyboard only
- **WHEN** the student tabs into the tree, moves to node 30, presses Enter, then R
- **THEN** the rotation right at 30 is performed

#### Scenario: Cancel
- **WHEN** a node is selected and Esc is pressed, or "Cancel" is activated
- **THEN** the selection clears, the menu closes, the tree is unchanged and focus is back in the tree

#### Scenario: Shortcuts are scoped
- **WHEN** R is pressed with no node selected, or with Ctrl held, or with focus outside the practice area
- **THEN** nothing happens

#### Scenario: Both directions offered
- **WHEN** node 10 in the chain 30, 20, 10 is selected
- **THEN** both rotation buttons are enabled

#### Scenario: Menu is named and axe-clean
- **WHEN** a node is selected
- **THEN** the menu has an accessible name that includes the node's key, and axe reports no violations

### Requirement: In-order strip
The practice area SHALL show the tree's in-order key sequence, computed from the tree, with the sentence "stays identical after any rotation". It SHALL update with the tree and be exposed as a labelled list. (FR-VIS-06, wireframe 1h note 2, LO6)

#### Scenario: Sequence
- **GIVEN** the tree 40 (left 20 with a left chain 10, 5; right 60)
- **THEN** the strip reads 5, 10, 20, 40, 60

#### Scenario: Unchanged by rotation
- **WHEN** any sequence of rotations and undos is performed on the tree
- **THEN** the strip's sequence is identical after each one

### Requirement: Undo and reset
The practice area SHALL have "Undo", which restores the tree before the last successful rotation, and "Reset", which restores the start tree. Both SHALL clear the selection and the feedback and announce what was done. Undo SHALL be disabled with no history; Ctrl+Z and Cmd+Z SHALL undo when focus is inside the practice area. A refused rotation SHALL NOT add to the history. (wireframe 1h, FR-VIS-03 intent)

#### Scenario: Undo restores exactly
- **GIVEN** a rotation was made from tree A to tree B
- **WHEN** Undo is activated
- **THEN** the tree is exactly A, Undo is disabled, and the live region says the rotation was undone

#### Scenario: Undo through several
- **WHEN** three rotations are made and Undo is activated three times
- **THEN** the tree is the start tree after the third

#### Scenario: Reset
- **GIVEN** two rotations and an Undo have been made
- **WHEN** Reset is activated
- **THEN** the tree is the start tree, Undo is disabled and no feedback is shown

#### Scenario: Keyboard undo
- **WHEN** Ctrl+Z is pressed with focus in the tree after one rotation
- **THEN** the rotation is undone, and nothing happens with focus outside the practice area

### Requirement: Practice is not graded
Attempts in Do it yourself SHALL NOT count toward readiness and SHALL NOT be shown as a mark, a count or a pass or fail. The practice SHALL use the shared `TreeView` in interactive mode, so every node shows its height, balance factor and out-of-balance label, and the selected node a rounded-square frame. All wording SHALL come from `src/content/practice.ts`, flagged for the user to read. (wireframe 1h note 3, FR-VIS-09, D8, design principles 1 and 2)

#### Scenario: No marks
- **WHEN** the practice area is rendered after several attempts
- **THEN** it shows no score, attempt count or pass/fail, and no callback reports readiness

#### Scenario: Tree view reuse
- **WHEN** the practice area is rendered
- **THEN** its tree is an interactive `TreeView` with role tree, and the style scan over `src/` still passes with the new stylesheet

#### Scenario: Phone width
- **WHEN** the practice area is rendered in a 360 px wide container
- **THEN** it has no horizontal page scroll (the tree scrolls inside its own region) and every control is at least 44 px
