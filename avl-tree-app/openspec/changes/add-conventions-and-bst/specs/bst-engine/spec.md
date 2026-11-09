# Spec Delta

## Purpose

Provides pure, immutable binary search tree operations, rotation primitives and an AVL validity check as the base that AVL rebalancing, traces and the tree view build on.

## ADDED Requirements

### Requirement: Immutable operations
Every engine operation SHALL return a new tree and SHALL NOT modify its input or any node it shares with the input. (SE §6.4)

#### Scenario: Input tree unchanged
- **GIVEN** a tree and a deep copy of it
- **WHEN** insert, delete or a rotation is applied to the tree
- **THEN** the original tree still equals the copy

### Requirement: BST insert
The engine SHALL insert a key into a BST without rebalancing, so that smaller keys go left and larger keys go right. (FR-ENG-01)

#### Scenario: Insert into empty tree
- **WHEN** key 10 is inserted into the empty tree
- **THEN** the result is a single node with key 10 and `inserted` is true

#### Scenario: Typical insert keeps order
- **WHEN** keys 20, 10, 30, 5 are inserted in order
- **THEN** the in-order key sequence is 5, 10, 20, 30

#### Scenario: Duplicate key
- **GIVEN** a tree containing key 10
- **WHEN** key 10 is inserted
- **THEN** the tree is unchanged and `inserted` is false

#### Scenario: Ascending inserts form a chain
- **WHEN** keys 1 to 15 are inserted in ascending order
- **THEN** the tree has height 14 (15 levels)

### Requirement: BST search
The engine SHALL report whether a key is present in a BST. Step counting and traces are out of scope here. (FR-ENG-01; FR-ENG-09 is `add-operation-trace`)

#### Scenario: Present key
- **GIVEN** a tree containing 5, 10, 20
- **WHEN** key 5 is searched
- **THEN** the result is found

#### Scenario: Missing key
- **WHEN** key 99 is searched in the same tree
- **THEN** the result is not found

#### Scenario: Empty tree
- **WHEN** any key is searched in the empty tree
- **THEN** the result is not found

### Requirement: BST delete
The engine SHALL delete a key from a BST without rebalancing: a leaf is removed, a node with one child is replaced by that child, and a node with two children takes the key of its in-order successor and the successor is removed. (FR-ENG-01, SE §6.4)

#### Scenario: Delete a leaf
- **WHEN** a leaf key is deleted
- **THEN** that key is absent, all other keys remain in order, and `deleted` is true

#### Scenario: Delete a node with one child
- **WHEN** a node with exactly one child is deleted
- **THEN** its child takes its place and the in-order sequence without the key is preserved

#### Scenario: Delete a node with two children
- **GIVEN** a tree with root 20, left 10, right 30 and 25 as left child of 30
- **WHEN** key 20 is deleted
- **THEN** the root key is 25 and the in-order sequence is 10, 25, 30

#### Scenario: Delete a missing key
- **WHEN** a key not in the tree is deleted
- **THEN** the tree is unchanged and `deleted` is false

#### Scenario: Delete from the empty tree
- **WHEN** any key is deleted from the empty tree
- **THEN** the result is the empty tree and `deleted` is false

### Requirement: Rotation primitives
The engine SHALL provide a left rotation and a right rotation at a node that preserve the in-order key sequence and update heights. (FR-ENG-02) [OPEN] whether this belongs here or in `add-avl-rebalancing` (see proposal, question 1).

#### Scenario: Right rotation
- **GIVEN** a node 30 with left child 20 whose left child is 10
- **WHEN** a right rotation is applied at 30
- **THEN** the root is 20 with children 10 and 30, and the in-order sequence is unchanged

#### Scenario: Left rotation
- **GIVEN** a node 10 with right child 20 whose right child is 30
- **WHEN** a left rotation is applied at 10
- **THEN** the root is 20 with children 10 and 30, and the in-order sequence is unchanged

#### Scenario: Rotation not possible
- **WHEN** a left rotation is applied at a node with no right child
- **THEN** the tree is returned unchanged

#### Scenario: Property — in-order preserved
- **GIVEN** random BSTs (fast-check)
- **WHEN** a rotation is applied at any node where it is possible
- **THEN** the in-order sequence is unchanged and stored heights are correct

### Requirement: AVL validity check
The engine SHALL report whether a tree is a valid AVL tree and, if not, the first node that breaks the rule. A tree is valid when every node's balance factor is -1, 0 or +1, computed from the actual subtree heights rather than stored ones. (FR-ENG-05)

#### Scenario: Valid trees
- **WHEN** the empty tree, a single node, and a hand-built balanced tree are checked
- **THEN** each is reported valid

#### Scenario: Invalid at the root
- **GIVEN** keys 1, 2, 3 inserted into a plain BST
- **WHEN** the tree is checked
- **THEN** it is invalid and the reported node is key 1

#### Scenario: Invalid only deep in the tree
- **GIVEN** a hand-built tree whose root has balance factor within range but a node several levels down has balance factor +2
- **WHEN** the tree is checked
- **THEN** it is invalid and the reported node is that deep node

#### Scenario: More than one offender
- **GIVEN** a tree where an ancestor and one of its descendants both break the rule
- **WHEN** the tree is checked
- **THEN** [OPEN] which one is reported (recommended: the lowest, see proposal, question 3)

#### Scenario: Stored heights are not trusted
- **GIVEN** a tree whose stored heights are wrong but whose real shape is balanced
- **WHEN** the tree is checked
- **THEN** it is reported valid
