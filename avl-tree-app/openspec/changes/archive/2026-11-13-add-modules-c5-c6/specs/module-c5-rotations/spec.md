# Spec Delta

## Purpose

Module C5 Rotations (LO6): single and double rotations, why they keep the BST order, and the four ways 10, 20, 30 can unbalance a tree, with practice on seeded trees.

## ADDED Requirements

### Requirement: C5 follows the module order
Module C5 SHALL be registered and SHALL play in the step player: Explore with a hook, goals, recall and content steps; Worked example with the four-cases example and two rotation practice steps (single, then double); Check with the check placeholder and a summary. The content validator SHALL report no problem for C5. (LO6, FR-LRN-01, FR-LRN-05, D10, D20)

#### Scenario: C5 is valid
- **WHEN** the validator checks module C5
- **THEN** it reports no problems

#### Scenario: C5 plays instead of the skeleton
- **WHEN** the student opens the C5 Explore activity
- **THEN** the step player shows "Step 1 of" the Explore step count, not the skeleton

#### Scenario: Goals state LO6
- **WHEN** the C5 goals step is rendered
- **THEN** its text contains "do single and double rotations"

### Requirement: C5 opens with a tree that breaks the rule
The hook SHALL show keys 10, 20, 30 inserted into a plain BST and state, from the engine, a node whose balance factor is out of the allowed range. A claim SHALL confirm the tree is not AVL. (ID C5, LO6)

#### Scenario: Hook facts
- **WHEN** the C5 hook is rendered
- **THEN** it draws the plain BST from 10, 20, 30, its claim "not AVL" passes, and the balance factor it states for node 10 equals the engine's

### Requirement: C5 teaches single rotations
A content step SHALL show a single left rotation and a single right rotation, each as a before figure (a plain BST) and an after figure (the same keys with one rotation). The text SHALL name the rotation's direction and node and the new root, all from facts. Each after figure SHALL be claimed to be AVL. (ID C5: "Single left and right rotations")

#### Scenario: Left rotation shown
- **WHEN** the single-rotation step is rendered
- **THEN** it has a figure of 10, 20, 30 into a plain BST, a figure of the same keys rotated left at 10, and its text names root 20 for the rotated figure

#### Scenario: Right rotation shown
- **WHEN** the single-rotation step is rendered
- **THEN** it has a figure of 30, 20, 10 into a plain BST and a figure of the same keys rotated right at 30, with root 20

### Requirement: C5 teaches double rotations as two singles
A content step SHALL show a double rotation as three figures: keys 30, 10, 20 into a plain BST, then rotated left at 10, then also rotated right at 30. The text SHALL say a double rotation is two single rotations and SHALL name each rotation from the figures. (ID C5: "Double rotations (LR, RL) are just two singles")

#### Scenario: Double rotation figures
- **WHEN** the double-rotation step is rendered
- **THEN** the second figure's root is 30 and the third figure's root is 20, and the third figure is claimed to be AVL

### Requirement: C5 shows that rotations keep the BST order
A content step SHALL show a tree before and after a rotation with the in-order key sequence of each, from facts, and SHALL claim that the after figure is a BST with the same in-order sequence as the before figure. (ID C5: "Rotations never break the BST order")

#### Scenario: Order claim passes
- **WHEN** the validator checks the order step
- **THEN** its "is a BST" and "same in-order sequence" claims pass and its text lists the in-order keys

### Requirement: C5 example: four orders, one result
A worked-example step SHALL show keys 10, 20 and 30 in the four orders that unbalance a tree: 30, 20, 10; 10, 20, 30; 30, 10, 20; and 10, 30, 20. For each order the text SHALL name the case of its rebalance through the conventions wording and say whether it uses one or two rotations, and SHALL give the root of the resulting AVL tree, all from facts. Every case SHALL end with 20 at the root. (ID C5 example, D19)

#### Scenario: Four distinct cases
- **WHEN** the four-cases step's facts are computed
- **THEN** each of its four figures has exactly one rebalance, the four cases are all different, two use one rotation and two use two rotations

#### Scenario: Same root every time
- **WHEN** the four orders are inserted into AVL trees
- **THEN** every resulting tree has root 20, and the rendered text gives that root from the facts

#### Scenario: Case names from the conventions
- **WHEN** the four-cases step is rendered
- **THEN** each of the conventions module's case names appears in the text, and the C5 content source contains none of them typed

### Requirement: C5 practice on seeded trees
The Worked example activity SHALL end with a rotation practice step needing a single rotation, then one needing a double rotation, each on a seeded problem with hints, New tree and Review the rule (D21). (LO6, FR-VIS-06)

#### Scenario: Single then double
- **WHEN** the student reaches the first C5 practice step and then the second
- **THEN** the first problem needs one rotation and the second needs two, as the engine counts them

#### Scenario: Practice by keyboard
- **GIVEN** the first C5 practice step
- **WHEN** the student uses only the keyboard to select the unbalanced node and rotate in the direction the engine's rebalance uses
- **THEN** the feedback says the tree is balanced and the in-order sequence is unchanged

#### Scenario: Calm wording
- **WHEN** every C5 string and every rotation practice hint is scanned
- **THEN** none contains "wrong", "incorrect", "fail" or a cross glyph

### Requirement: C5 accessibility
Every C5 step SHALL pass the automated accessibility check, and every tree SHALL have an accessible name and text description. (NFR-02, FR-VIS-07)

#### Scenario: Axe on every C5 step
- **WHEN** each step of each C5 activity is rendered in turn
- **THEN** axe reports no violations
