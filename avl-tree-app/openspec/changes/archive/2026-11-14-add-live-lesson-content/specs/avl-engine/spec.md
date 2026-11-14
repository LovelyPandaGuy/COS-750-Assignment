# Spec Delta

## MODIFIED Requirements

### Requirement: Pseudocode line maps
The engine SHALL take, for the loop form and the recursive form of search, the pseudocode line each kind of step corresponds to from `conventions.json` (`pseudocode.lineForStep`), and each step's pseudocode line SHALL come from that map. The listings are the ID's (ID 7.4). (FR-ENG-09, FR-VIS-04)

#### Scenario: Loop form lines
- **WHEN** key 35 is searched in the loop form in the AVL tree from 10, 20, 30, 40, 50
- **THEN** the equality tests use line 4, the go-left step uses line 7, the go-right steps use line 8 and the not-found step uses line 9, as `lineForStep.search-loop` says

#### Scenario: Recursive form lines
- **WHEN** the same search is made in the recursive form
- **THEN** the equality tests use line 4, the go-left step uses line 7, the go-right steps use line 9 and the not-found step uses line 3, as `lineForStep.search-recursive` says

#### Scenario: Forms differ only in lines
- **WHEN** the same key is searched in both forms in any tree
- **THEN** the steps have the same kinds, keys and indexes, and differ only in pseudocode lines

## ADDED Requirements

### Requirement: Integer and letter keys
The system SHALL accept trees whose keys are all integers, compared numerically, or all capital letters, compared alphabetically, for every operation (insert, search, delete, rotations, traces, analysis, captions and drawing), and SHALL show letter keys as letters. (`conventions.keys`, ID 7.2 C2 "A D E F Z")

#### Scenario: Letters
- **WHEN** A, D, E, F, Z are inserted into a plain BST
- **THEN** the tree is a chain to the right, `A(·, D(·, E(·, F(·, Z))))`, and a search for Z visits 5 nodes

#### Scenario: Letters in an AVL tree
- **WHEN** A is inserted into the AVL tree from G, C, H, B, D
- **THEN** the result is `C(B(A, ·), G(D, H))` after one right rotation about G

#### Scenario: Integer properties unchanged
- **GIVEN** the existing property tests over random integer keys
- **WHEN** they run
- **THEN** they pass unchanged apart from the sign of balance factors

### Requirement: Shape notation
The engine SHALL write a tree as the ID's shape string: a node as `key(left, right)`, an empty child as `·`, a leaf as its key alone, and a node with two empty children as its key alone. Two trees SHALL have equal strings exactly when they have the same keys in the same shape. (ID 12.2; the `result` field)

#### Scenario: Examples
- **WHEN** the AVL tree from 10, 20, 30, 40, 50 and the tree after deleting 50 from it are written
- **THEN** the strings are `20(10, 40(30, 50))` and `20(10, 40(30, ·))`

### Requirement: Insert sequence trace
The engine SHALL trace a sequence of AVL inserts as the insert traces of each key in turn, each starting from the tree the previous one left, so a replay can step through the whole sequence. (ID 7.2 C6 "the textbook's running example")

#### Scenario: Running example
- **WHEN** 3, 2, 1, 4, 5, 6, 7 are inserted with a trace into an empty tree
- **THEN** the trace has four rebalances (at 3 when 1 arrives, at 3 when 5 arrives, at 2 when 6 arrives and at 5 when 7 arrives, each a single rotation) and ends at `4(2(1, 3), 6(5, 7))`

### Requirement: Rotation sequence trace
The engine SHALL trace a given list of rotations (each a direction and the key it rotates about) on a given tree, one step per rotation, with the node that moves up, the node it rotates about and the tree before and after. A rotation that cannot be done (no child on the needed side) SHALL be reported as an error, not drawn. (ID 7.2 C5, ID 7.3 "rotate C around G")

#### Scenario: Double rotation as two singles
- **WHEN** a left rotation about C and then a right rotation about G are traced on the plain BST from G, C, H, B, D, E
- **THEN** the trace has two steps, D moves up in both, and the result is `D(C(B, ·), G(E, H))`

#### Scenario: Impossible rotation
- **WHEN** a left rotation about a node with no right child is traced
- **THEN** the engine reports the rotation as impossible

### Requirement: Leaf deletion trace
The engine SHALL trace the deletion of a leaf from an AVL tree: removing the leaf; updating balance factors from its parent up to the root; at the first node whose balance factor is +2 or −2, one rebalance chosen by `conventions.deletionRotation`; and the final tree. Deleting a key that is not a leaf SHALL be reported as outside the ID's scope. (ID 7.2 C7, ID 7.3 "Only leaf deletions are covered")

#### Scenario: No rotation
- **WHEN** 50 is deleted with a trace from the AVL tree from 20, 10, 40, 30, 50
- **THEN** the trace removes 50, updates 40 (balance factor −1) and 20 (+1), has no rotation and ends at `20(10, 40(30, ·))`

#### Scenario: One rotation
- **WHEN** 10 is deleted with a trace from the same tree
- **THEN** node 20 reaches +2, one left rotation about 20 follows, and the trace ends at `40(20(·, 30), 50)`

#### Scenario: Not a leaf
- **WHEN** 40 is deleted with a trace from the same tree
- **THEN** the engine reports that only leaf deletion is covered

### Requirement: Step captions
For every trace step of search, insert, insert sequence, rotation sequence and leaf deletion, the engine-side caption builder SHALL produce the step's caption from the templates in `conventions.json` (`captions`), filled with the step's keys, heights and balance factors. For each animation in the shipped lessons the captions SHALL equal the screen's `steps`. (ID 8.2 "a one-line caption", ID 12.2)

#### Scenario: Insert captions
- **WHEN** A is inserted with a trace into the AVL tree from G, C, H, B, D
- **THEN** the ten captions equal the `steps` of `c5-s07`, from "A < G: go left." to "Every node has a balance factor of −1, 0 or +1."

#### Scenario: Every lesson animation
- **WHEN** the captions are built for every animation screen in C2 to C8
- **THEN** each list equals that screen's `steps`
