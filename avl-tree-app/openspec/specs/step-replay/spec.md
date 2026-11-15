# step-replay Specification

## Purpose
Lets the student watch an insert or a search one step at a time, forward and back, at a chosen speed, with the tree, the roles and a sentence for each step all taken from the engine's trace.

## Requirements

### Requirement: Replay positions come from the trace
A replay of a trace with n steps SHALL have positions 0 to n. Position 0 SHALL show the start tree; position p (p ≥ 1) SHALL show the tree after step p, which is the `after` snapshot of trace step p − 1. The replay SHALL open at position 0, paused, at 1× speed. (FR-VIS-03, FR-ENG-06)

#### Scenario: Insert with a single rotation
- **GIVEN** the start tree 30 with left child 20, and an insert of 10
- **THEN** the replay has 9 steps: compare 30, descend to 20, compare 20, descend (no child), insert 10, update height at 20, update height at 30, imbalance at 30 (LL), rotation at 30
- **AND** position 0 shows the start tree, position 5 shows 30, 20, 10 as a left chain, and position 9 shows 20 with children 10 and 30

#### Scenario: Positions match the engine for any insert
- **GIVEN** any AVL tree of up to 15 distinct keys from 0 to 100 and any key from −2 to 102 (property test)
- **THEN** for every position p ≥ 1 the tree shown equals `replay(start, trace.slice(0, p))`, and the tree at position n equals the engine's result tree

### Requirement: Step forward and step back
Step SHALL move from position p to p + 1 and Back SHALL move from p to p − 1. Back SHALL restore exactly the tree shown before the last Step. Back SHALL be disabled at position 0 and Step SHALL be disabled at position n. Either action SHALL pause playback. (FR-VIS-03)

#### Scenario: Step back restores the previous tree exactly
- **GIVEN** any insert trace from the property generator and any position p from 1 to n
- **WHEN** the student steps from p − 1 to p and then presses Back
- **THEN** the tree shown is deep-equal to the tree shown at p − 1, including every stored height

#### Scenario: Bounds
- **WHEN** the replay is at position 0
- **THEN** Back is disabled and Step is enabled
- **AND WHEN** it is at position n **THEN** Step is disabled and Back is enabled

### Requirement: Play, pause and speed
Play SHALL advance one position per interval until position n, then stop and show Play again. The interval at 1× SHALL be 1200 ms [assumed, flagged]; 0.5× SHALL double it and 2× SHALL halve it. Pause SHALL stop at the current position. Play at position n SHALL return to position 0 and play from there. The speed control SHALL offer 0.5×, 1× and 2× with exactly one selected. (FR-VIS-03, wireframe 1f)

#### Scenario: Playing to the end
- **GIVEN** a 9-step trace at position 0, at 1×, with fake timers
- **WHEN** Play is pressed and 1200 ms pass
- **THEN** the position is 1 and the control reads Pause
- **AND WHEN** a further 9600 ms pass **THEN** the position is 9 and the control reads Play

#### Scenario: Speed changes the interval
- **WHEN** 2× is chosen and Play is pressed
- **THEN** the position is 1 after 600 ms and still 0 before it
- **AND WHEN** 0.5× is chosen **THEN** one step takes 2400 ms

#### Scenario: Pause
- **GIVEN** the replay is playing at position 3
- **WHEN** Pause is pressed and any further time passes
- **THEN** the position stays 3

#### Scenario: Play again from the end
- **GIVEN** the replay is at position n
- **WHEN** Play is pressed
- **THEN** the position becomes 0 and playback runs

### Requirement: Step counter and progress
The controls SHALL show "Step p / n" as text and a progress bar whose value is p and maximum is n, exposed with the progressbar role and an accessible name. (FR-VIS-03, wireframe 1f)

#### Scenario: Counter follows the position
- **GIVEN** a 9-step trace
- **WHEN** the student steps three times
- **THEN** the text "Step 3 / 9" is shown and the progress bar has value 3 and maximum 9

### Requirement: Controls work by touch and pointer
Every control SHALL be a native button with a text label (a glyph alone is not a label) and a target of at least 44 by 44 px. The current speed SHALL be exposed as pressed. (FR-VIS-03, FR-VIS-10, NFR-02)

#### Scenario: Targets and labels
- **WHEN** the controls are rendered
- **THEN** each button has a text accessible name (Back, Play or Pause, Step, 0.5×, 1×, 2×) and is at least 44 px high and wide, the selected speed has `aria-pressed="true"`, and the player has no axe violations

### Requirement: Controls work by keyboard
While focus is inside the player, Space SHALL toggle Play and Pause, Left Arrow SHALL step back, Right Arrow SHALL step forward, "[" SHALL choose the next slower speed and "]" the next faster one. These keys SHALL do nothing when focus is outside the player or when Ctrl, Alt or Meta is held. (FR-VIS-03, NFR-02, WCAG 2.1.4)

#### Scenario: Keyboard only
- **GIVEN** focus is on a control inside the player at position 0
- **WHEN** the student presses Right Arrow twice, Left Arrow once and "]"
- **THEN** the position is 1 and 2× is selected
- **AND WHEN** Space is pressed **THEN** playback starts, and Space again pauses it, with one toggle per key press

#### Scenario: Keys are scoped
- **GIVEN** focus is outside the player
- **WHEN** Right Arrow or Space is pressed
- **THEN** the position and playback do not change

### Requirement: A sentence for each step
The player SHALL show one sentence for the current position in a polite live region and SHALL update it on every position change. Each sentence SHALL be built from the `captions` templates in `conventions.json` (for example "{key} < {node}: go left.", "Node {node}: bf = {hr} − {hl} = {bf}.", "Rotate {child} around {about}: {dir} rotation about {about}."), filled from the engine. Imbalance sentences on insert SHALL name the case with its `conventions.json` label. Position 0 SHALL show the screen's `caption` in a lesson, and in the sandbox the operation and key about to run. (FR-VIS-07, ID 7.3, ID 8.2)

#### Scenario: Imbalance sentence uses the engine's numbers
- **GIVEN** the insert of 10 into the AVL tree 30 with left child 20
- **WHEN** the replay reaches the imbalance
- **THEN** the live region text is "Node 30 has balance factor −2: it is the first unbalanced node, n. Case 1 (LL)."

#### Scenario: Live region updates
- **WHEN** the student steps forward
- **THEN** the element with `aria-live="polite"` holds the sentence for the new position

### Requirement: Sentence numbers come from the snapshot
Every height or balance factor a step sentence names SHALL be read from that step's tree snapshot, so the sentence matches the tree drawn at that position. This holds for search, insert, insert sequence, rotation sequence and leaf deletion. (FR-VIS-07, FR-VIS-09)

#### Scenario: Every step has a sentence
- **GIVEN** any insert, search or leaf-delete trace from the property generator
- **THEN** every position yields a non-empty sentence, and every balance factor it names equals `balanceFactorOf` the named node in that position's tree

### Requirement: Calm step wording
Step sentences SHALL NOT use red, error or fail words. (Learning-design rule: low anxiety)

#### Scenario: Calm wording
- **WHEN** every sentence template is rendered for the example traces
- **THEN** none contains "wrong", "fail", "error" or "incorrect"

### Requirement: Roles during the replay
The tree SHALL be drawn read-only with roles that follow the position: the inserted key SHALL have the "new" role from its insert step onward; on an imbalance step the unbalanced node SHALL carry the tag "n"; on a rotation step the node that moves up and the node it rotates about SHALL have the "being rotated" role. Every other node SHALL be drawn balanced or unbalanced from its balance factor (tree-view). (FR-VIS-02, ID 11.1)

#### Scenario: Roles at the imbalance step
- **GIVEN** the insert of 10 into the AVL tree 30 with left child 20
- **WHEN** the replay is at the imbalance step
- **THEN** node 10 has the role new and node 30 carries the tag "n" and is drawn unbalanced
- **AND WHEN** it is at the rotation step **THEN** nodes 20 and 30 have the role being rotated

### Requirement: Search replays with a step count
A search replay SHALL show a running count of nodes visited, equal to the number of compare steps up to the current position. At position n the count SHALL equal the engine's `steps`. Found and not-found searches SHALL both replay. The player SHALL also say at position n whether the key was found. (FR-VIS-11, FR-ENG-09)

#### Scenario: Found
- **GIVEN** the tree 20 with children 10 and 30 and a loop search for 30
- **THEN** the replay has 4 steps and at position 4 the count shows 2 and the sentence says 30 was found

#### Scenario: Not found
- **GIVEN** the same tree and a loop search for 25
- **THEN** the replay has 5 steps, the count at position 5 shows 2, and the sentence says 25 is not in the tree

#### Scenario: Count matches the engine
- **GIVEN** any AVL tree from the property generator, any key and either search form
- **THEN** the count at position n equals `searchTrace(tree, key, form).steps`

### Requirement: Replay waits for a prediction and can jump to a step
The player SHALL accept a flag that holds the replay at position 0 with Play and Step disabled, for use while a prediction prompt is open, and SHALL accept a request to show a given trace step, which SHALL move to the position after that step (trace index i shows position i + 1), paused. A new start tree, key or operation SHALL return the replay to position 0, paused. (FR-VIS-05, wireframe 1g)

#### Scenario: Held until the prediction is made
- **GIVEN** the player is held
- **THEN** Play and Step are disabled and the position is 0
- **AND WHEN** the hold is released **THEN** Play and Step are enabled

#### Scenario: Replay that step
- **GIVEN** the 9-step insert trace whose imbalance step has index 7
- **WHEN** the screen asks the player to show step index 7
- **THEN** the position is 8 and playback is paused

#### Scenario: New example resets
- **GIVEN** the replay is at position 5
- **WHEN** the key to insert changes
- **THEN** the position is 0 and playback is paused

### Requirement: Player layout and phones
The player SHALL place the tree, the step controls, the pseudocode panel and the step sentence in that reading order, SHALL fit the Watch slot of the mode switch, and SHALL work at 360 px wide without the page scrolling sideways (the tree keeps its own scroll region). Its stylesheet SHALL use `tokens.css` variables only and SHALL NOT override the focus style. (FR-VIS-10, NFR-02, D3, D17)

#### Scenario: Reading order
- **WHEN** the player is rendered
- **THEN** in DOM order the tree region comes before the controls, the controls before the pseudocode panel, and the panel before the live region

#### Scenario: Tokens only
- **WHEN** the replay stylesheet is scanned
- **THEN** every colour, size and radius is a `var(--…)` from `tokens.css` and no rule sets `outline` on `:focus` or `:focus-visible`

#### Scenario: In the Watch slot
- **GIVEN** the mode switch with the player as its Watch content
- **WHEN** Watch is selected
- **THEN** the player's controls are shown, and the page has no axe violations

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
