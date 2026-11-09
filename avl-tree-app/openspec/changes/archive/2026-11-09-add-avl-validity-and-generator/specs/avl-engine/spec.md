# Spec Delta

## ADDED Requirements

### Requirement: Tree analysis report
The engine SHALL provide a report on any tree that lists every BST-order violation, every node whose balance factor is outside -1 to +1 with its balance factor and which way it is heavy, and every node whose stored height differs from its real height. It SHALL state separately whether the tree is a BST and whether it is a valid AVL tree. Lists SHALL be in post-order, left before right. (FR-ENG-05 extended, FR-ASM-04)

#### Scenario: Valid AVL tree
- **WHEN** the empty tree, a single node and a balanced hand-built tree are analysed
- **THEN** each is a BST and a valid AVL tree and all three lists are empty

#### Scenario: Every offending balance node
- **GIVEN** keys 1, 2, 3, 4, 5 inserted into a plain BST
- **WHEN** the tree is analysed
- **THEN** the balance violations are for keys 3, 2 and 1 in that order, each with its balance factor, and the tree is a BST but not a valid AVL tree

#### Scenario: First balance violation agrees with the validity check
- **WHEN** any tree that is not a valid AVL tree is analysed
- **THEN** the first balance violation names the same node that the validity check reports

#### Scenario: Violation kind comes from the conventions module
- **WHEN** a node with balance factor +2 and a node with balance factor -2 are reported
- **THEN** they are labelled heavy on opposite sides, with the labels defined in the conventions module and no other file

#### Scenario: BST-order violation
- **GIVEN** a hand-built tree with root 10, left child 5, and 12 as the right child of 5
- **WHEN** the tree is analysed
- **THEN** it is not a BST and the order violations name key 12

#### Scenario: Duplicate key counts as an order violation
- **GIVEN** a hand-built tree whose left child has the same key as its parent
- **WHEN** the tree is analysed
- **THEN** the order violations name that child

#### Scenario: Stored height mismatch
- **GIVEN** a hand-built balanced tree with a wrong stored height on one node
- **WHEN** the tree is analysed
- **THEN** the height mismatches name that node with its stored and real heights, and the tree is still a valid AVL tree

#### Scenario: Analysis does not modify the tree
- **WHEN** a tree is analysed
- **THEN** the original tree equals a deep copy taken beforehand

## MODIFIED Requirements

### Requirement: Validity check
The engine SHALL report whether a tree is a valid AVL tree and, if not, the first node that breaks the rule. The check SHALL use real subtree heights, not stored ones, and SHALL name the lowest offending node when several break the rule.

#### Scenario: Invalid only deep in the tree
- **WHEN** a tree that is invalid only at a deep node is checked
- **THEN** the check names that node

#### Scenario: Stored heights are not trusted
- **GIVEN** a tree whose stored heights are wrong but whose real shape is balanced
- **WHEN** the tree is checked
- **THEN** it is reported valid

#### Scenario: Lowest offender
- **GIVEN** an ancestor and one of its descendants both break the rule
- **WHEN** the tree is checked
- **THEN** the descendant is reported
