# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
