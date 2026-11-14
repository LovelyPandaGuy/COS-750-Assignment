# Spec Delta

## ADDED Requirements

### Requirement: Two-column layout
The sandbox SHALL have a tree column (the tree, its description, "What happened" and "Replay last insert") and a control column, tree column first in the DOM. From 768 px the control column SHALL be shown on the left, beside the tree column, two parts to three with a wide gap; below 768 px they SHALL stack, tree first. There SHALL be no horizontal page scroll at any width; a wide tree SHALL scroll in its own region. (Wireframe 1n, ID 8.2, D3, D140, NFR-04)

#### Scenario: Tree first in the DOM
- **WHEN** the sandbox is rendered with keys
- **THEN** the tree column precedes the control column, and "Replay last insert" is inside the tree column

#### Scenario: Columns from 768 px
- **WHEN** the sandbox stylesheet is read
- **THEN** a `@media (min-width: 768px)` rule makes the layout a grid with the control column (two fifths, at least 18rem) in the first grid column and the tree column (three fifths) in the second, `--space-8` apart, and outside it the layout is a single column

#### Scenario: No page scroll on a phone
- **WHEN** 15 keys are inserted with rebalancing off, at 360, 768 and 1366 px
- **THEN** the tree sits in its scroll region and the layout sets no fixed width wider than 360 px

### Requirement: Named sections
The control column SHALL hold, in order, sections headed "Change the tree" (the key field, its message and the control bar), "Rebalancing" (the switch and its hint) and "Numbers" (the statistics), followed by keyboard help. "What happened" (the event log) SHALL sit in the tree column directly under the tree, before "Replay last insert", in its own scrolling box. Each section SHALL be a region named by its level-2 heading. (ID 8.1, UDL, D141)

#### Scenario: Control column headings in order
- **WHEN** the sandbox is rendered
- **THEN** the level-2 headings in the control column are "Change the tree", "Rebalancing" and "Numbers", in that order

#### Scenario: What happened under the tree
- **WHEN** keys are inserted
- **THEN** the "What happened" section is in the tree column, after the tree and before "Replay last insert"

#### Scenario: A long log scrolls in its box
- **WHEN** the sandbox stylesheet and log are read
- **THEN** the log has a maximum height with vertical scrolling, and it is focusable so it can be scrolled by keyboard

#### Scenario: Regions are named by their headings
- **WHEN** the sandbox is rendered
- **THEN** each of the four sections is a region whose accessible name is its heading

### Requirement: Sandbox controls are the shared control bar
Insert, Delete, "Insert 1 to 7 in order", Random key and Clear SHALL be one control bar (`tree-controls`) in that order, below the labelled key field, with icons and no primary button. Enter in the key field SHALL insert. Keyboard help SHALL list the sandbox's keys from the shortcut registry: the tree's arrows and Enter, the bar's arrows, and Enter in the key field. (D137, D138, D139, FR-VIS-10)

#### Scenario: Bar order
- **WHEN** the sandbox is rendered
- **THEN** the control bar's buttons are Insert, Delete, "Insert 1 to 7 in order", Random key and Clear, in that order, and none has `btn-primary`

#### Scenario: Enter inserts
- **WHEN** 42 is typed in the key field and Enter is pressed
- **THEN** 42 is in the tree

#### Scenario: Sandbox keys in the help
- **WHEN** keyboard help is opened on the sandbox
- **THEN** it lists moving between nodes, selecting a node, moving between buttons and inserting the key in the field, and no rotation or step key

## MODIFIED Requirements

### Requirement: Fifteen-node cap
The tree SHALL hold at most 15 nodes. At 15, Insert, "Insert 1 to 7 in order" and Random key SHALL be unavailable (`aria-disabled`, still focusable, activating them does nothing) and a message SHALL say the tree is full and how to make room. Delete SHALL stay available. (FR-VIS-08, wireframe 1n note 2, D137)

#### Scenario: Full tree
- **GIVEN** a sandbox holding 15 keys
- **WHEN** the screen is shown
- **THEN** Insert, "Insert 1 to 7 in order" and Random key have `aria-disabled="true"`, the full message is shown, and Delete still works

#### Scenario: Unavailable does nothing
- **GIVEN** a sandbox holding 15 keys
- **WHEN** Insert is activated with 50 in the key field
- **THEN** the tree still holds 15 keys

### Requirement: Nothing saved, accessible
The sandbox SHALL write nothing to the learner state. Every control SHALL be at least 44 px, usable by keyboard and touch, and the screen SHALL keep "← Back to path" to the hub. The screen SHALL have no axe violations at every width and in every state. (NFR-02, D3, wireframe 1n)

#### Scenario: Nothing stored
- **WHEN** the learner inserts, deletes, toggles and clears, then leaves
- **THEN** the stored learner state is byte for byte the same as before

#### Scenario: Back to path
- **WHEN** the sandbox is shown
- **THEN** it has a link "← Back to path" to `/path`

#### Scenario: Axe
- **WHEN** the sandbox is rendered empty, with a chain, full, with the replay open, and with keyboard help open
- **THEN** axe reports no violations
