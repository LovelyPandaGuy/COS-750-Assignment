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
- **THEN** both steps are reported with their case labels
- **AND** every balance factor is -1, 0 or +1 afterwards

### Requirement: Search with a trace
The engine SHALL implement search in loop and recursive forms, record each node visited and each comparison, and report the number of steps for found and not-found keys. The number of steps SHALL be the number of nodes visited.

#### Scenario: Found and not found
- **WHEN** a present key and a missing key are searched
- **THEN** the trace matches the hand-worked examples
- **AND** the step count equals the number of nodes visited

#### Scenario: Step counts for the root, a leaf and a missing key
- **GIVEN** the AVL tree built from 20, 10, 30, 5, 15
- **WHEN** keys 20, 5 and 12 are searched
- **THEN** the step counts are 1, 3 and 3

#### Scenario: Step count against height
- **WHEN** keys 1 to 15 are inserted by AVL insert and every key from 0 to 16 is searched
- **THEN** each step count is at most the tree's height plus one under the conventions module
- **AND** searching key 15 in the plain chain built from 1 to 15 takes 15 steps

#### Scenario: Result agrees with plain search
- **WHEN** any key is searched in any tree in either form
- **THEN** the found result equals the result of the plain search

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

### Requirement: Search trace steps
Each step of a search trace SHALL carry its index in order from 0, a kind, the keys involved, the tree before and after, and a pseudocode line. For each node visited the trace SHALL hold a compare step, then either a found step or a descend step. A search that ends at an empty subtree SHALL end with a not-found step. (FR-ENG-06 in part, FR-ENG-09)

#### Scenario: Found key
- **GIVEN** the AVL tree built from 20, 10, 30, 5, 15
- **WHEN** key 15 is searched
- **THEN** the steps are, in order: compare 20, descend from 20 to 10, compare 10, descend from 10 to 15, compare 15, found 15
- **AND** their indexes are 0 to 5

#### Scenario: Missing key
- **GIVEN** the same tree
- **WHEN** key 12 is searched
- **THEN** the steps are compare 20, descend 20 to 10, compare 10, descend 10 to 15, compare 15, descend from 15 with no target, not-found at 15

#### Scenario: Root key
- **WHEN** key 20 is searched in the same tree
- **THEN** the steps are compare 20, found 20

#### Scenario: Empty tree
- **WHEN** any key is searched in the empty tree
- **THEN** the only step is not-found with no keys, and the step count is 0

#### Scenario: Before and after
- **WHEN** any search is traced
- **THEN** every step's before and after are the searched tree, unchanged, and no step has a rebalance case

### Requirement: Pseudocode line maps
The engine SHALL define, for the loop form and the recursive form of search, the pseudocode line each kind of step corresponds to, and each step's pseudocode line SHALL come from that map. The numbering follows the ID's pseudocode. (FR-ENG-09, FR-VIS-04) [OPEN] the line layout needs checking against the ID PDF (proposal, question 1).

#### Scenario: Loop form lines
- **WHEN** key 12 is searched in the loop form in the tree above
- **THEN** compare steps use the equality-test line, descend-left steps use the go-left line, descend-right steps use the go-right line, and the not-found step uses the final return line

#### Scenario: Recursive form lines
- **WHEN** the same search is made in the recursive form
- **THEN** the compare and found steps use the equality-test line, descend steps use the matching recursive-call line, and the not-found step uses the empty-subtree test line

#### Scenario: Forms differ only in lines
- **WHEN** the same key is searched in both forms in any tree
- **THEN** the steps have the same kinds, keys and indexes, and differ only in pseudocode lines

### Requirement: AVL delete rebalancing cases
After deleting a key, the engine SHALL rebalance at each node on the deletion path whose balance factor is +2 or -2, from the lowest upward. It SHALL choose a single rotation when the taller child leans the same way as the node or is balanced, and a double rotation when it leans the other way. It SHALL report each rebalance with its case and the key of the unbalanced node, in the order performed. (FR-ENG-08, SE §6.4)

#### Scenario: Delete needing no rebalance
- **GIVEN** a tree with root 20 and children 10 and 30
- **WHEN** key 10 is deleted
- **THEN** the tree has root 20 with right child 30 only and no rebalance is reported

#### Scenario: Single rotation, same direction
- **GIVEN** a tree with root 15, left child 10, and right child 20 whose right child is 30
- **WHEN** key 10 is deleted
- **THEN** the right-leaning imbalance at 15 is fixed by one left rotation, the result has root 20 with children 15 and 30, and one rebalance of case RR at node 15 is reported

#### Scenario: Double rotation
- **GIVEN** a tree with root 20, left child 10 and right child 30 whose left child is 25
- **WHEN** key 10 is deleted
- **THEN** the result has root 25 with children 20 and 30, and one rebalance of case RL at node 20 is reported

#### Scenario: Double rotation, mirror
- **GIVEN** a tree with root 20, left child 10 whose right child is 15, and right child 30
- **WHEN** key 30 is deleted
- **THEN** the result has root 15 with children 10 and 20, and one rebalance of case LR at node 20 is reported

#### Scenario: Tie case, right-heavy
- **GIVEN** a tree with root 20, left child 10, and right child 30 with children 25 and 35
- **WHEN** key 10 is deleted
- **THEN** the taller child 30 is balanced, a single left rotation is used, the result has root 30 with left child 20 (whose right child is 25) and right child 35, and one rebalance of case RR at node 20 is reported

#### Scenario: Tie case, left-heavy
- **GIVEN** a tree with root 20, right child 30, and left child 10 with children 5 and 15
- **WHEN** key 30 is deleted
- **THEN** a single right rotation is used, the result has root 10 with left child 5 and right child 20 (whose left child is 15), and one rebalance of case LL at node 20 is reported

### Requirement: Delete may rebalance more than once
The engine SHALL continue up the deletion path after a rebalance, because a rotation can shorten its subtree, and SHALL report every rebalance performed. (FR-ENG-08)

#### Scenario: Two rebalancing steps
- **GIVEN** the tree with root 8; left child 5 (children 2 and 6, where 2 has children 1 and 3, 3 has right child 4, and 6 has right child 7); right child 10 (children 9 and 11, where 11 has right child 12)
- **WHEN** key 9 is deleted
- **THEN** two rebalances are reported in order: RR at node 10, then LL at node 8
- **AND** the result has root 5 with left child 2 and right child 8, where 8 has children 6 and 11

### Requirement: Two-children delete with rebalancing
When the deleted node has two children, the engine SHALL replace its key with its in-order successor, remove the successor from the right subtree, and rebalance along the whole path including the node itself. (FR-ENG-08, SE §6.4)

#### Scenario: Delete the root
- **GIVEN** a tree with root 20, left child 10, and right child 30 with children 25 and 35
- **WHEN** key 20 is deleted
- **THEN** the root is 25, the in-order sequence is 10, 25, 30, 35 and no rebalance is reported

### Requirement: AVL delete invariants
After any AVL delete the tree SHALL be a valid AVL tree, its in-order sequence SHALL be the original keys without the deleted key, stored heights SHALL equal real heights, and the number of rebalances SHALL not exceed the number of nodes on the deletion path. The input tree SHALL not be modified. (FR-ENG-08, NFR-08)

#### Scenario: Property over random trees
- **GIVEN** random AVL trees built by AVL insert (fast-check) and a random key to delete, present or not
- **WHEN** the key is deleted
- **THEN** the result satisfies all of the invariants above, and `deleted` is true exactly when the key was present

#### Scenario: Delete until empty
- **GIVEN** an AVL tree of 1 to 15
- **WHEN** its keys are deleted one by one in a seeded random order
- **THEN** the tree is a valid AVL tree after every delete and is empty at the end

#### Scenario: Missing key and empty tree
- **WHEN** a key that is not in the tree, or any key in the empty tree, is deleted
- **THEN** the tree is unchanged, `deleted` is false and no rebalance is reported

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
