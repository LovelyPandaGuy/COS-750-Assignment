# Spec Delta

## MODIFIED Requirements

### Requirement: AVL insert
The engine SHALL insert as in a BST, find the lowest unbalanced node z and its taller child y, and restore balance with a single rotation (LL, RR) or a double rotation (LR, RL).

#### Scenario: Each case
- **WHEN** keys 3, 2, 1 then 1, 2, 3 then 3, 1, 2 then 1, 3, 2 are inserted into empty trees
- **THEN** each result is a balanced three-node tree with the case labelled LL, RR, LR and RL respectively

#### Scenario: At most one rebalancing step
- **WHEN** any key is inserted into any valid AVL tree
- **THEN** every balance factor is -1, 0 or +1 afterwards
- **AND** at most one rebalancing step occurred

#### Scenario: Each case with z deeper on the left of its parent
- **WHEN** keys 50, 30, 70, 20, 10 (LL), 50, 30, 70, 35, 40 (RR), 50, 30, 70, 10, 20 (LR) and 50, 30, 70, 40, 35 (RL) are AVL-inserted into empty trees
- **THEN** in each tree the imbalance step names node 30 as z with the stated case
- **AND** the rotated subtree is the left child of 50, giving 50(20(10, 30), 70) for LL and LR and 50(35(30, 40), 70) for RR and RL

#### Scenario: Each case with z deeper on the right of its parent
- **WHEN** keys 30, 20, 60, 50, 40 (LL), 30, 20, 40, 50, 60 (RR), 30, 20, 60, 40, 50 (LR) and 30, 20, 40, 60, 50 (RL) are AVL-inserted into empty trees
- **THEN** in each tree z is the right child of 30 and the result is 30(20, 50(40, 60))

#### Scenario: Empty, single node and duplicate
- **WHEN** a key is AVL-inserted into the empty tree, a second key into a single-node tree, and a key that is already present into any tree
- **THEN** the first two report inserted and need no rotation
- **AND** the duplicate returns the same tree, reports not inserted and has no insert, imbalance or rotation step

#### Scenario: Order and keys preserved
- **WHEN** any sequence of distinct keys is AVL-inserted into an empty tree
- **THEN** the in-order key sequence is the sorted set of inserted keys
- **AND** the validity check reports the tree as valid

#### Scenario: Case labels come from the conventions module
- **WHEN** a case name in the conventions module is changed
- **THEN** the labels on imbalance and rotation steps change with it
- **AND** no engine file other than the conventions module spells out a case name

### Requirement: Trace for every operation
The engine SHALL return a trace for every operation with an ordered list of steps, each with the case label where one applies, the nodes involved, and the tree before and after.

#### Scenario: Replay
- **WHEN** a trace is replayed on its starting tree
- **THEN** the final tree is reproduced

#### Scenario: Snapshot chain
- **WHEN** any sequence of keys is AVL-inserted or plain-inserted and each trace is inspected
- **THEN** the first step's before tree is the starting tree, each step's before tree equals the previous step's after tree, and the last step's after tree is the result tree
- **AND** step indices run 0, 1, 2, … in order

#### Scenario: Insert trace contents, single rotation
- **WHEN** key 1 is AVL-inserted into the tree built from 3, 2
- **THEN** the step kinds in order are compare (3), compare (2), insert (1), update-height (2), update-height (3), imbalance (3, 2) and rotation (3, 2)
- **AND** the imbalance and rotation steps carry the label LL and no other step carries a label

#### Scenario: Insert trace contents, double rotation
- **WHEN** key 2 is AVL-inserted into the tree built from 3, 1
- **THEN** the trace has one imbalance step at 3 labelled LR followed by two rotation steps, both labelled LR, the first at 1 and the second at 3
- **AND** the after tree of the first rotation step is 3(2(1), null) and that of the second is 2(1, 3)

#### Scenario: Walk stops after the fix
- **WHEN** an AVL insert triggers a rotation at a node z below the root
- **THEN** the trace has no update-height step for any ancestor of z after the rotation

#### Scenario: Snapshots are immutable
- **WHEN** an operation returns a trace
- **THEN** the starting tree passed in is unchanged
- **AND** every before and after snapshot is unchanged by later operations on the result tree

#### Scenario: Pseudocode line on every step
- **WHEN** any insert trace is inspected
- **THEN** every step carries a pseudocode line that names one entry of the engine's insert pseudocode table
- **AND** steps of the same kind carry the same line
- [OPEN] Which pseudocode the lines index: the five C6 steps numbered 1 to 5, or lecturer-supplied pseudocode (D12, proposal open question 2).

### Requirement: Plain BST insert for comparison
The engine SHALL include a plain BST insert with no rebalancing, for comparison.

#### Scenario: Ascending keys
- **WHEN** keys 1 to 15 are inserted in ascending order
- **THEN** plain insert gives a chain of 15 levels and AVL insert gives a perfect tree of 4 levels

#### Scenario: Plain insert trace
- **WHEN** a key is plain-inserted into any tree
- **THEN** its trace contains only compare steps followed by one insert step, or compare steps ending in a found step for a duplicate
- **AND** it has no update-height, imbalance or rotation step
