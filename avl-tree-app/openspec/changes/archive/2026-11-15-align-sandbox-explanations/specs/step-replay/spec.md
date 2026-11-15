# Spec Delta

## ADDED Requirements

### Requirement: Sandbox operations
The replay player SHALL also play the sandbox's single operations from the engine's traces: an insert with rebalancing (the AVL insert trace) or without (the plain insert trace), and a leaf deletion with rebalancing (the leaf-deletion trace) or without (the plain leaf-deletion trace). Its captions SHALL be the engine caption builder's captions for that trace. A deletion SHALL show no pseudocode listing, as no lesson gives one. (FR-VIS-03, ID 7.2 C6 and C7, D163)

#### Scenario: Plain insert
- **WHEN** inserting 7 without rebalancing into the tree of 6 is replayed to its end
- **THEN** the tree is `6(·, 7)` and no step is a rotation

#### Scenario: Leaf deletion
- **WHEN** deleting 10 with rebalancing from the AVL tree from 20, 10, 40, 30, 50 is replayed to its end
- **THEN** the tree is `40(20(·, 30), 50)`, one step is a left rotation about 20, and no pseudocode listing is shown

#### Scenario: Captions match the engine
- **WHEN** each of the four operations is replayed
- **THEN** its captions equal `captionsFor` for the same trace
