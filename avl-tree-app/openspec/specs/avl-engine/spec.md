# avl-engine Specification

## Purpose
Pure TypeScript engine for BST and AVL operations. It is the single source of truth for animation, pseudocode sync and answer marking. Source: SE requirements FR-ENG-01 to FR-ENG-10, FR-ASM-04.

## Requirements

### Requirement: BST insert, search and delete
The engine SHALL implement BST insert, search and delete on immutable trees.

#### Scenario: Duplicate insert
- **WHEN** a key that is already present is inserted
- **THEN** the tree is unchanged

#### Scenario: Delete cases
- **WHEN** a key is deleted from a leaf, a node with one child and a node with two children
- **THEN** the in-order sequence of the remaining keys is preserved in each case

### Requirement: Rotations preserve order
The engine SHALL implement left and right rotations that preserve the in-order key sequence.

#### Scenario: Any rotation on a random tree
- **WHEN** a rotation is applied to any valid tree
- **THEN** the in-order key sequence is unchanged

### Requirement: Height and balance factor on every node
The engine SHALL compute the height and balance factor of every node using the conventions module.

#### Scenario: Left-heavy and right-heavy trees
- **WHEN** heights are computed for a left-heavy and a right-heavy tree
- **THEN** balance factors have opposite signs and match the conventions module

### Requirement: AVL insert
The engine SHALL insert as in a BST, find the lowest unbalanced node z and its taller child y, and restore balance with a single rotation (LL, RR) or a double rotation (LR, RL).

#### Scenario: Each case
- **WHEN** keys 3, 2, 1 then 1, 2, 3 then 3, 1, 2 then 1, 3, 2 are inserted into empty trees
- **THEN** each result is a balanced three-node tree with the case labelled LL, RR, LR and RL respectively

#### Scenario: At most one rebalancing step
- **WHEN** any key is inserted into any valid AVL tree
- **THEN** every balance factor is -1, 0 or +1 afterwards
- **AND** at most one rebalancing step occurred

### Requirement: AVL delete
The engine SHALL delete as in a BST, then walk back up the path and rebalance at every node whose balance factor is +2 or -2, which can need more than one rotation.

#### Scenario: Delete needing two rebalancing steps
- **WHEN** a hand-worked example that needs two rebalancing steps is deleted
- **THEN** both steps appear in the trace with their case labels
- **AND** every balance factor is -1, 0 or +1 afterwards

### Requirement: Search with a trace
The engine SHALL implement search in loop and recursive forms, record each node visited and each comparison, and report the number of steps for found and not-found keys.

#### Scenario: Found and not found
- **WHEN** a present key and a missing key are searched
- **THEN** the trace matches the hand-worked examples
- **AND** the step count equals the number of nodes visited

### Requirement: Validity check
The engine SHALL report whether a tree is a valid AVL tree and, if not, the first node that breaks the rule.

#### Scenario: Invalid only deep in the tree
- **WHEN** a tree that is invalid only at a deep node is checked
- **THEN** the check names that node

### Requirement: Trace for every operation
The engine SHALL return a trace for every operation with an ordered list of steps, each with the case label where one applies, the nodes involved, and the tree before and after.

#### Scenario: Replay
- **WHEN** a trace is replayed on its starting tree
- **THEN** the final tree is reproduced

### Requirement: Plain BST insert for comparison
The engine SHALL include a plain BST insert with no rebalancing, for comparison.

#### Scenario: Ascending keys
- **WHEN** keys 1 to 15 are inserted in ascending order
- **THEN** plain insert gives a chain of 15 levels and AVL insert gives a perfect tree of 4 levels
