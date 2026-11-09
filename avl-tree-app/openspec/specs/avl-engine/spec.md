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
The engine SHALL insert as in a BST, find the lowest unbalanced node z and its taller child y, and restore balance with a single rotation (LL, RR) or a double rotation (LR, RL). It SHALL perform at most one rebalancing step per insert and SHALL report whether the key was inserted and, if a rebalance happened, its case and the key of z. (FR-ENG-04, NFR-08)

#### Scenario: Each case
- **WHEN** keys 3, 2, 1 then 1, 2, 3 then 3, 1, 2 then 1, 3, 2 are inserted into empty trees
- **THEN** each result is a balanced three-node tree with the case labelled LL, RR, LR and RL respectively

#### Scenario: At most one rebalancing step
- **WHEN** any key is inserted into any valid AVL tree
- **THEN** every balance factor is -1, 0 or +1 afterwards
- **AND** at most one rebalancing step occurred

#### Scenario: Hand-worked example
- **WHEN** keys 10, 20, 30, 40, 50, 25 are inserted in order into an empty tree
- **THEN** the final in-order sequence is 10, 20, 25, 30, 40, 50 and the root is 30

#### Scenario: Duplicate key
- **GIVEN** a tree containing key 20
- **WHEN** key 20 is inserted
- **THEN** the tree is unchanged, `inserted` is false and no rebalance is reported

#### Scenario: Empty tree and single node
- **WHEN** a key is inserted into the empty tree and then a second key into the result
- **THEN** both results are valid AVL trees with no rebalance reported

#### Scenario: Input tree unchanged
- **WHEN** AVL insert is applied to a tree
- **THEN** the original tree equals a deep copy taken beforehand

#### Scenario: Property: invariants after any insertion sequence
- **GIVEN** random sequences of distinct keys (fast-check)
- **WHEN** they are inserted one by one
- **THEN** after each insert the validity check passes, the in-order sequence is the sorted inserted keys, stored heights match actual heights, and at most one rebalance was reported for that insert

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

### Requirement: Imbalance detection on insert
After inserting a key, the engine SHALL find the lowest node on the insert path whose balance factor is +2 or -2, or report that there is none. (FR-ENG-04, SE §6.4)

#### Scenario: No imbalance
- **WHEN** key 20 is inserted into the AVL tree built from 10, 30
- **THEN** no node is unbalanced and no rebalancing occurs

#### Scenario: Lowest unbalanced node
- **GIVEN** an AVL tree where inserting a key would unbalance both a node and one of its ancestors
- **WHEN** the key is inserted
- **THEN** the rebalanced node is the lowest unbalanced node on the path

### Requirement: Rebalancing case classification
The engine SHALL classify an imbalance as LL, RR, LR or RL, using the case names from the conventions module. The case is LL or RR when the taller child leans the same way as the unbalanced node, and LR or RL when it leans the opposite way. (FR-ENG-04, FR-ENG-10)

#### Scenario: Four cases at the root
- **WHEN** keys are inserted into empty trees in the orders 3, 2, 1 then 1, 2, 3 then 3, 1, 2 then 1, 3, 2
- **THEN** the cases reported are LL, RR, LR and RL respectively

#### Scenario: Four cases deeper in the tree
- **GIVEN** each of the four three-key patterns placed under a parent, once as a left child and once as a right child
- **WHEN** the unbalancing key is inserted
- **THEN** the same case is reported and the node reported is the unbalanced node, not the root

### Requirement: Single and double rotations
The engine SHALL restore balance with one right rotation for LL, one left rotation for RR, a left rotation on the child then a right rotation on the node for LR, and a right rotation on the child then a left rotation on the node for RL. The rotated subtree SHALL reattach to the node's parent on the correct side. (FR-ENG-04, SE §6.4)

#### Scenario: Balanced result for each case
- **WHEN** each of the four case insertions at the root is performed
- **THEN** the result is a three-node tree with the middle key at the root and the other two as its children

#### Scenario: Reattached to the parent
- **GIVEN** a rebalance happens at a node that is the left child of its parent, and another at a node that is the right child
- **WHEN** the insert completes
- **THEN** the rotated subtree sits on the same side of the parent as the original node and the in-order sequence is unchanged

### Requirement: AVL versus plain insert comparison
With AVL insert, keys 1 to 15 inserted in ascending order SHALL give a perfect tree of 4 levels, while the plain BST insert gives a chain of 15 levels. (FR-ENG-07)

#### Scenario: Ascending 1 to 15
- **WHEN** keys 1 to 15 are inserted in ascending order using AVL insert and, separately, plain insert
- **THEN** the AVL tree has height 3 (4 levels) and every internal node has two children
- **AND** the plain tree has height 14 (15 levels)

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
