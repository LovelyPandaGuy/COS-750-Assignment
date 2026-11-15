# Spec Delta

## ADDED Requirements

### Requirement: Plain leaf deletion trace
The engine SHALL trace the deletion of a leaf without rebalancing: removing the leaf, then updating each node's height and balance factor from its parent up to the root, with no imbalance or rotation step, ending at the plain BST without that leaf. Deleting a key that is not a leaf SHALL be reported as outside the ID's scope, as for the rebalancing trace. (ID 7.2 C7, ID 7.3; sandbox with rebalancing off, D161)

#### Scenario: No rotation even when unbalanced
- **WHEN** 10 is deleted without rebalancing from the AVL tree from 20, 10, 40, 30, 50
- **THEN** the trace removes 10, updates 20 to balance factor +2, has no rotation, and ends at `20(·, 40(30, 50))`

#### Scenario: Not a leaf
- **WHEN** 40 is deleted without rebalancing from the same tree
- **THEN** the engine reports that only leaf deletion is covered

## MODIFIED Requirements

### Requirement: Step captions
For every trace step of search, insert, insert sequence, rotation sequence and leaf deletion, the engine-side caption builder SHALL produce the step's caption from the templates in `conventions.json` (`captions`), filled with the step's keys, heights and balance factors. An insert or a leaf deletion SHALL close with "Every node has a balance factor of −1, 0 or +1." only when its final tree is an AVL tree. For each animation in the shipped lessons the captions SHALL equal the screen's `steps`. (ID 8.2 "a one-line caption", ID 12.2, D161)

#### Scenario: Insert captions
- **WHEN** A is inserted with a trace into the AVL tree from G, C, H, B, D
- **THEN** the ten captions equal the `steps` of `c5-s07`, from "A < G: go left." to "Every node has a balance factor of −1, 0 or +1."

#### Scenario: Every lesson animation
- **WHEN** the captions are built for every animation screen in C2 to C8
- **THEN** each list equals that screen's `steps`

#### Scenario: No false closing line after a plain deletion
- **WHEN** captions are built for deleting 10 without rebalancing from the AVL tree from 20, 10, 40, 30, 50
- **THEN** they are "10 is a leaf: remove it." and "Node 20: bf = 1 − (−1) = +2.", with no "Every node has a balance factor" line
