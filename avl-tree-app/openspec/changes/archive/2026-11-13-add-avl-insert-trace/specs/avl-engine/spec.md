# Spec Delta

## ADDED Requirements

### Requirement: AVL insert trace
The engine SHALL provide AVL insert with a trace. Its resulting tree, its inserted flag and its reported rebalance SHALL equal those of AVL insert without a trace for the same tree and key, and the input tree SHALL not be modified. (FR-ENG-04, FR-ENG-06)

#### Scenario: Agrees with AVL insert
- **GIVEN** random AVL trees built by AVL insert (fast-check) and a random key, present or not
- **WHEN** the key is inserted with and without a trace
- **THEN** the trees, the inserted flags and the rebalances are equal
- **AND** the original tree equals a deep copy taken beforehand

#### Scenario: Snapshots chain from start to result
- **WHEN** any key is inserted with a trace into any AVL tree
- **THEN** step indexes run from 0 in order, the first step's before is the input tree, each step's before equals the previous step's after, and the last step's after equals the resulting tree

### Requirement: Insert trace steps
An insert trace SHALL hold, per node visited on the way down, a compare step and then a descend step; then an insert step for the new key, or a found step for a duplicate after which the trace ends. After an insert it SHALL hold one update-height step per ancestor, lowest first, up to the lowest unbalanced node or the root, then for an imbalance one imbalance step and its rotation steps, and nothing after them. (FR-ENG-04, FR-ENG-06, SE §6.4)

#### Scenario: Single rotation at the root
- **GIVEN** the AVL tree built from 10, 20
- **WHEN** key 30 is inserted with a trace
- **THEN** the steps are, in order: compare 10, descend 10 to 20, compare 20, descend from 20 with no target, insert 30, update-height 20, update-height 10, imbalance at 10 with taller child 20 and case RR, rotation at 10 with pivot 20 and case RR
- **AND** the result has root 20 with children 10 and 30

#### Scenario: Double rotation at the root
- **GIVEN** the AVL tree built from 30, 10
- **WHEN** key 20 is inserted with a trace
- **THEN** after insert 20, update-height 10 and update-height 30, the steps are imbalance at 30 with taller child 10 and case LR, rotation at 10 with pivot 20, then rotation at 30 with pivot 20, both with case LR
- **AND** the result has root 20 with children 10 and 30

#### Scenario: Hand-worked example
- **GIVEN** the AVL tree built from 10, 20, 30, 40, 50
- **WHEN** key 25 is inserted with a trace
- **THEN** the walk down visits 20, 40 and 30, the update-height steps are for 30, 40 and 20 in that order, the imbalance is at 20 with taller child 40 and case RL, and the rotations are at 40 with pivot 30, then at 20 with pivot 30
- **AND** the result has root 30

#### Scenario: Imbalance below the root stops the walk
- **GIVEN** the AVL tree built from 20, 10, 30, 40
- **WHEN** key 50 is inserted with a trace
- **THEN** the update-height steps are for 40 and 30 only, the imbalance is at 30 with case RR, one rotation at 30 with pivot 40 follows, and no step after it names 20

#### Scenario: No imbalance
- **GIVEN** the AVL tree built from 20, 10, 30
- **WHEN** key 5 is inserted with a trace
- **THEN** the steps after insert 5 are update-height 10 then update-height 20, and there are no imbalance or rotation steps

#### Scenario: Duplicate key
- **GIVEN** the AVL tree built from 20, 10, 30
- **WHEN** key 10 is inserted with a trace
- **THEN** the steps are compare 20, descend 20 to 10, compare 10, found 10
- **AND** every step's before and after are the input tree and inserted is false

#### Scenario: Empty tree
- **WHEN** key 7 is inserted with a trace into the empty tree
- **THEN** the only step is insert 7, with before the empty tree and after a single node 7

#### Scenario: Heights update one node at a time
- **GIVEN** the AVL tree built from 10, 20
- **WHEN** key 30 is inserted with a trace
- **THEN** in the insert step's after, node 20 stores height 0 and node 10 stores height 1, as before the insert
- **AND** after update-height 20, node 20 stores height 1, and after update-height 10, node 10 stores height 2, with heights under the conventions module

#### Scenario: Property: step structure
- **GIVEN** random AVL trees and random keys (fast-check)
- **WHEN** each key is inserted with a trace
- **THEN** there is at most one imbalance step; its case and node equal the reported rebalance; there are no rotation steps without it, one rotation step for LL or RR and two for LR or RL, each with the same case; only imbalance and rotation steps carry a case; and the final tree's stored heights equal its real heights

### Requirement: Insert pseudocode line map
The engine SHALL define the pseudocode line for each kind of insert step, and each insert step's line SHALL come from that map. The numbering follows the five steps of the ID's C6 outline: BST insert, update heights, find the lowest unbalanced node, work out the case, rotate. (FR-VIS-04, FR-ENG-04) [OPEN] the ID has no line-level insert pseudocode; confirm the outline is the panel text and which line the imbalance step lights (proposal, question 1).

#### Scenario: Lines by step kind
- **WHEN** key 25 is inserted with a trace into the AVL tree built from 10, 20, 30, 40, 50
- **THEN** compare, descend and insert steps use the BST-insert line, update-height steps use the update-heights line, the imbalance step uses the find-unbalanced-node line, and rotation steps use the rotate line

#### Scenario: Duplicate uses the BST-insert line
- **WHEN** a duplicate key is inserted with a trace
- **THEN** every step, including found, uses the BST-insert line

### Requirement: Trace replay
The engine SHALL replay a search or insert trace on its starting tree by re-applying each step from its kind and keys, without reading the step snapshots, and the result SHALL equal the operation's resulting tree. Replay of a trace that holds a delete step SHALL be refused until delete has a trace. (FR-ENG-06)

#### Scenario: Insert traces replay to the result
- **GIVEN** random AVL trees and random keys (fast-check)
- **WHEN** the insert trace is replayed on the input tree
- **THEN** the replayed tree equals the resulting tree
- **AND** replaying each prefix of the trace gives that prefix's last after snapshot

#### Scenario: Search traces replay to the same tree
- **WHEN** any search trace is replayed on the searched tree
- **THEN** the replayed tree equals the searched tree

#### Scenario: Rotation direction from keys
- **GIVEN** the trace of inserting 20 into the AVL tree built from 30, 10
- **WHEN** it is replayed
- **THEN** the rotation at 10 with pivot 20 is replayed as a left rotation and the rotation at 30 with pivot 20 as a right rotation

#### Scenario: Empty trace
- **WHEN** an empty trace is replayed on any tree
- **THEN** the replayed tree equals that tree

#### Scenario: Delete steps refused
- **WHEN** a trace containing a delete step is replayed
- **THEN** replay throws an error that names the delete step kind as not supported
