# Spec Delta

## MODIFIED Requirements

### Requirement: A sentence for each step
The player SHALL show one sentence for the current position in a polite live region and SHALL update it on every position change. Each sentence SHALL be built from the `captions` templates in `conventions.json` (for example "{key} < {node}: go left.", "Node {node}: bf = {hr} − {hl} = {bf}.", "Rotate {child} around {about}: {dir} rotation about {about}."), filled from the engine. Imbalance sentences on insert SHALL name the case with its `conventions.json` label. Position 0 SHALL show the screen's `caption` in a lesson, and in the sandbox the operation and key about to run. (FR-VIS-07, ID 7.3, ID 8.2)

#### Scenario: Imbalance sentence uses the engine's numbers
- **GIVEN** the insert of 10 into the AVL tree 30 with left child 20
- **WHEN** the replay reaches the imbalance
- **THEN** the live region text is "Node 30 has balance factor −2: it is the first unbalanced node, n. Case 1 (LL)."

#### Scenario: Live region updates
- **WHEN** the student steps forward
- **THEN** the element with `aria-live="polite"` holds the sentence for the new position

### Requirement: Roles during the replay
The tree SHALL be drawn read-only with roles that follow the position: the inserted key SHALL have the "new" role from its insert step onward; on an imbalance step the unbalanced node SHALL carry the tag "n"; on a rotation step the node that moves up and the node it rotates about SHALL have the "being rotated" role. Every other node SHALL be drawn balanced or unbalanced from its balance factor (tree-view). (FR-VIS-02, ID 11.1)

#### Scenario: Roles at the imbalance step
- **GIVEN** the insert of 10 into the AVL tree 30 with left child 20
- **WHEN** the replay is at the imbalance step
- **THEN** node 10 has the role new and node 30 carries the tag "n" and is drawn unbalanced
- **AND WHEN** it is at the rotation step **THEN** nodes 20 and 30 have the role being rotated

### Requirement: Sentence numbers come from the snapshot
Every height or balance factor a step sentence names SHALL be read from that step's tree snapshot, so the sentence matches the tree drawn at that position. This holds for search, insert, insert sequence, rotation sequence and leaf deletion. (FR-VIS-07, FR-VIS-09)

#### Scenario: Every step has a sentence
- **GIVEN** any insert, search or leaf-delete trace from the property generator
- **THEN** every position yields a non-empty sentence, and every balance factor it names equals `balanceFactorOf` the named node in that position's tree

## ADDED Requirements

### Requirement: Lesson replays step by caption
In a lesson, a replay SHALL have one position per caption of the operation, plus position 0 for the start tree, and position p SHALL show the tree after the trace steps of caption p. A comparison and the move it causes form one caption. The sandbox keeps one position per trace step. (ID 8.2 "one rotation action per step, with a one-line caption, and then wait for the student")

#### Scenario: Captions are positions
- **WHEN** `c5-s07` is replayed
- **THEN** it has ten positions after position 0, one per caption of its `steps`, and the last shows `C(B(A, ·), G(D, H))`

#### Scenario: Waits for the student
- **WHEN** a lesson replay opens
- **THEN** it is at position 0, paused, and moves only when the student steps or presses play

### Requirement: Lesson operations
A lesson replay SHALL play each operation the lesson files use: `search` (with a step counter of nodes compared), `insert` (AVL, or plain with `rebalance: false`), `insert-sequence`, `rotations` (the listed rotations, in order) and `delete` (a leaf), each from the engine's trace. (ID 7.2 C2 to C7)

#### Scenario: Every operation in the lessons plays
- **WHEN** every animation screen of C2 to C8 is replayed to its last position
- **THEN** each reaches the tree its `result` names (or, without `result`, the engine's result) with no error
