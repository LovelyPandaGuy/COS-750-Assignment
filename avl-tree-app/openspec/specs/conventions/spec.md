# conventions Specification

## Purpose
One place defines how heights, balance factors and case names are counted, so code, labels, tests and feedback cannot disagree. Source: decision D2 and FR-ENG-03, FR-ENG-10.

## Requirements

### Requirement: Height is counted in edges
The system SHALL count the height of a node in edges, so a leaf has height 0 and an empty tree has height -1.

#### Scenario: Leaf and empty tree
- **WHEN** the height of a single node is requested
- **THEN** the result is 0
- **AND** the height of an empty tree is -1

### Requirement: Balance factor is right minus left
The system SHALL define the balance factor of a node as the height of its right subtree minus the height of its left subtree, as `conventions.json` states (`"balanceFactor": "height(right) - height(left)"`). A negative balance factor means the left branch is taller. (ID 7.3, supersedes D2's sign)

#### Scenario: Left-heavy node
- **WHEN** a node has a left subtree of height 1 and an empty right subtree
- **THEN** its balance factor is −2

#### Scenario: Right-heavy chain
- **WHEN** the plain BST from 10, 20, 30, 40, 50 is analysed
- **THEN** node 10 has balance factor +4 (3 − (−1)), as in ID 10.1

### Requirement: One conventions module
The system SHALL read the height convention, the balance-factor definition, the valid balance factors, the case names and fixes, the labels, the captions and the pseudocode from `src/live_content/conventions.json` through a single conventions module, and no other file SHALL hard-code them. (ID 7.3, ID 12.1 "the single source for every label and message")

#### Scenario: Values come from the file
- **WHEN** the conventions module is read
- **THEN** the leaf height is 0, the empty-tree height is −1, the valid balance factors are −1, 0 and +1, and the four case labels are "Case 1 (LL)", "Case 2 (LR)", "Case 3 (RL)" and "Case 4 (RR)", each equal to the value in `conventions.json`

#### Scenario: Changing the convention
- **GIVEN** a conventions file whose balance factor is `height(left) - height(right)`
- **WHEN** the conventions module is built from it
- **THEN** `balanceFactor` and every label and caption that depends on the sign change with it, with no other edit

#### Scenario: An unknown formula is an error
- **GIVEN** a conventions file whose balance factor is `height(right) + height(left)`
- **WHEN** the content is validated
- **THEN** there is a content error naming `conventions.json` and `balanceFactor`

### Requirement: Out-of-balance test
The conventions module SHALL export `isOutOfBalance(balanceFactor)`, true when the balance factor is below -1 or above +1. UI code SHALL use it instead of comparing balance factors itself. (D2, FR-ENG-10)

#### Scenario: Range
- **WHEN** `isOutOfBalance` is called with -2, -1, 0, 1 and 2
- **THEN** it returns true, false, false, false and true

#### Scenario: Agrees with the engine check
- **GIVEN** any tree whose stored heights are correct
- **WHEN** each node's balance factor is passed to `isOutOfBalance`
- **THEN** the nodes it flags are exactly the nodes in `analyseTree(tree).balanceViolations`

### Requirement: Balance-factor order and range are exported
The conventions module SHALL export which subtree's height comes first in the balance factor (the minuend) and which second, and the allowed balance factors, read from `conventions.json`. These SHALL agree with `balanceFactor` and `isOutOfBalance`. Under the ID the order is right then left and the range is −1, 0, +1. (ID 7.3)

#### Scenario: Order agrees with the function
- **WHEN** the exported order is read and `balanceFactor` is called with a right-subtree height of 1 and a left-subtree height of −1
- **THEN** the order is right then left and the result is +2

#### Scenario: Range agrees with the test
- **WHEN** every whole number from −3 to 3 is checked
- **THEN** it is in the exported range exactly when `isOutOfBalance` is false

### Requirement: Labels and captions come from the conventions file
Every case name, rotation name, branch word, verdict word, progress line and step caption shown to a student SHALL come from `conventions.json` (`labels`, `captions`, `feedback`), with its placeholders filled from engine values. Numbers SHALL use a true minus sign, and a negative height inside a subtraction SHALL be bracketed, as `captions.format` says. (ID 7.3, ID 12.1)

#### Scenario: Update caption
- **WHEN** the update caption is built for node 10 with right height 3 and left height −1
- **THEN** the text is "Node 10: bf = 3 − (−1) = +4."

#### Scenario: Case label
- **WHEN** the imbalance caption is built for node 3 with balance factor −2 in the left-left case
- **THEN** the text is "Node 3 has balance factor −2: it is the first unbalanced node, n. Case 1 (LL)."

#### Scenario: Progress label
- **WHEN** the progress label is built for lesson 3
- **THEN** the text is "Lesson 3 of 9"

#### Scenario: Wording follows the order
- **WHEN** the conventions module is built from `conventions.json`
- **THEN** the exported order (right, then left) matches the order of `{hr}` and `{hl}` in `captions.update`, and a conventions file where they disagree is a content error

#### Scenario: Lean follows leanOf
- **WHEN** the lean is read for +2 and for −2
- **THEN** +2 leans to the right branch and −2 to the left branch, named by `labels.branch.right` and `labels.branch.left`
