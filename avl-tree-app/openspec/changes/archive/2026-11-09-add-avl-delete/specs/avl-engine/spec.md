# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: AVL delete
The engine SHALL delete as in a BST, then walk back up the path and rebalance at every node whose balance factor is +2 or -2, which can need more than one rotation.

#### Scenario: Delete needing two rebalancing steps
- **WHEN** a hand-worked example that needs two rebalancing steps is deleted
- **THEN** both steps are reported with their case labels
- **AND** every balance factor is -1, 0 or +1 afterwards
