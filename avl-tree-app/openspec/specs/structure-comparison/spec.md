# structure-comparison Specification

## Purpose
Compare a plain BST, an AVL tree, a sorted array and a hash table from one record, and let students pick a structure for a scenario whose answer and reasons are computed from that record, not typed.

## Requirements

### Requirement: One record describes the four structures
One content record SHALL describe exactly four structures: plain BST, AVL tree, sorted array and hash table. For each it SHALL give a display name, a cost class for search and for insert (typical and worst case, each O(1), O(log2 n) or O(n)) and, for every need, whether the structure meets it. Each entry SHALL be marked as from the ID or beyond the ID. (LO9, ID C8, proposal item 1)

#### Scenario: Four structures, every need answered
- **WHEN** the structure record is loaded
- **THEN** it has exactly the four structures, each has every cost cell filled with one of the three cost classes, and each has a yes or no for every need

#### Scenario: ID rows are marked
- **WHEN** the record is checked
- **THEN** the AVL tree's worst-case search and insert are O(log2 n) and marked from the ID, the plain BST's worst-case search is O(n) and marked from the ID, and every other entry carries a source mark

### Requirement: The AVL trade-off is in the record
The AVL tree's entry SHALL state its two costs from the ID (an extra height stored in each node, and rotation work on insert) and its gain (a guaranteed O(log2 n) search). The plain BST's entry SHALL have neither cost. (ID C8)

#### Scenario: Costs and gain
- **WHEN** the AVL and plain BST entries are compared
- **THEN** the AVL tree has worst-case search O(log2 n) and the plain BST has O(n), and only the AVL tree has the costs "stores a height in each node" and "does rotation work on insert"

### Requirement: Sorted array search steps come from the engine
A step SHALL be able to show a sorted array built from a list of keys and a key to search for. Its facts SHALL give the sorted keys, the cells binary search probes in order, the probe count, and whether the key is found. Content SHALL state these only through the facts. (LO5, LO9, FR-LRN-02)

#### Scenario: Probes for a found key
- **GIVEN** an array figure from keys 10, 20, 30, 40, 50, 60, 70 searching for 70
- **WHEN** its facts are computed
- **THEN** the probed keys are 40, 60, 70, the probe count is 3 and the key is found

#### Scenario: Probe count stays small
- **WHEN** array facts are computed for every key of sorted arrays of size 1 to 64 (property test)
- **THEN** the probe count is at most the floor of log2 n plus 1, and every found key is reported found

#### Scenario: Numbers checked
- **GIVEN** a step whose text states a probe count that differs from the facts
- **WHEN** the validator checks it
- **THEN** it reports a number problem for that value

### Requirement: Sorted array drawing
A sorted array figure SHALL draw its keys as a row of cells in order with an accessible name. Each probed cell SHALL carry a visible probe number and a text label, not colour alone. The row SHALL scroll sideways at 360 px instead of shrinking. (FR-LRN-02, D17, NFR-02)

#### Scenario: Probes visible without colour
- **GIVEN** the array figure from 10 to 70 searching for 70
- **WHEN** it is shown
- **THEN** the cells for 40, 60 and 70 show probe numbers 1, 2 and 3 in text, and the other cells show none

#### Scenario: Array drawing is accessible
- **WHEN** axe runs on a step with an array figure
- **THEN** it reports no violations, and the row has the figure's label as its accessible name

### Requirement: Comparison table
A step SHALL be able to show the four structures in one table built from the record, with one row per structure and columns for search and insert in the typical and worst case and for keys in order. Header cells SHALL be marked as headers. (LO9, FR-LRN-02)

#### Scenario: Table from the record
- **WHEN** the comparison table is rendered
- **THEN** it has four body rows named for the four structures, and every cell equals the record's value

#### Scenario: Table is accessible
- **WHEN** axe runs on the comparison step
- **THEN** it reports no violations, and each row header and column header is exposed as a header

### Requirement: Scenario answers are computed
A scenario SHALL list the needs it has. Its answer SHALL be the one structure that meets every need, computed from the record. For every other structure the reason SHALL be the first listed need it does not meet. (LO9, proposal item 3)

#### Scenario: Unique answer
- **GIVEN** a scenario that needs "keys listed in order", "insert in O(log2 n) in the typical case" and "no balancing work"
- **WHEN** its answer is computed with the record
- **THEN** exactly one structure, the plain BST, meets all three needs, and each other structure has a reason naming a need it does not meet

#### Scenario: Every structure is an answer somewhere
- **WHEN** the answers of all scenarios in the record are computed
- **THEN** each of the four structures is the answer to at least one scenario

### Requirement: Scenarios are validated
The validator SHALL report a scenario problem when a scenario has no structure meeting every need, when more than one does, when it lists an unknown need, or when its text names any of the four structures or Red-Black trees. (LO9, guardrail "every answer is computed")

#### Scenario: Two answers rejected
- **GIVEN** a scenario whose needs are met by both the AVL tree and the sorted array
- **WHEN** the validator checks it
- **THEN** it reports a scenario problem naming both structures

#### Scenario: Named answer rejected
- **GIVEN** a scenario whose text contains "hash table"
- **WHEN** the validator checks it
- **THEN** it reports a scenario problem for that scenario

#### Scenario: Record scenarios are valid
- **WHEN** the validator checks every scenario in the record
- **THEN** it reports no problems

### Requirement: Scenario practice step
A scenario practice step SHALL show one scenario, chosen by seed from the step's scenarios, and the four structures as a radio group in an order shuffled by the same seed. Check SHALL mark the choice against the computed answer. It SHALL work by keyboard, pointer and touch with 44 px targets. (LO9, D3, D21)

#### Scenario: Seeded choice and order
- **GIVEN** a scenario practice step with seed s
- **WHEN** it is shown twice with seed s
- **THEN** both show the same scenario and the same option order, and some other seed gives a different scenario or order

#### Scenario: Keyboard only
- **WHEN** the learner moves through the options with the arrow keys and presses Check
- **THEN** the selected option is the one checked, and focus moves to the feedback

#### Scenario: Check needs a choice
- **WHEN** the learner presses Check with nothing selected
- **THEN** a calm prompt asks them to choose a structure, and no verdict is shown

### Requirement: Scenario feedback in four parts
Feedback SHALL give a verdict ("That's right" or "Not quite yet"), a reason from the computed facts, a Review control that opens the comparison in place, and the next action (Try again, or Next). Not quite yet SHALL name a need the chosen structure does not meet. That's right SHALL name the needs the answer meets. No feedback SHALL use red, a cross glyph or the words wrong, incorrect or fail. (D27, FR-ASM-03 in part)

#### Scenario: Reason names the unmet need
- **GIVEN** a scenario that needs keys listed in order
- **WHEN** the learner chooses the hash table and checks
- **THEN** the feedback starts "Not quite yet", says the hash table does not meet "keys listed in order", and offers Try again and Review

#### Scenario: Right answer explained
- **WHEN** the learner chooses the computed answer and checks
- **THEN** the feedback starts "That's right" and names each need of the scenario

#### Scenario: Calm wording
- **WHEN** every scenario feedback and hint string is rendered for every scenario and every choice
- **THEN** none contains "wrong", "incorrect", "fail" or "✗"

### Requirement: Scenario practice retries and hints
Scenario practice SHALL allow unlimited retries on the same scenario and offer New scenario on request. It SHALL offer the configured number of hints (2): a nudge naming the scenario's needs, then a fuller hint naming the structures that do not meet one of them. After the hints, Review the comparison SHALL be offered. Answers SHALL NOT be stored. (D21)

#### Scenario: Hints count down
- **GIVEN** a scenario practice step
- **WHEN** the learner presses Hint twice
- **THEN** the button reads "Hint (2)", then "Hint (1)", then is replaced by "Review the rule", and the nudge lists the scenario's needs and the fuller hint names each structure ruled out

#### Scenario: New scenario resets
- **WHEN** the learner presses New scenario
- **THEN** a different seed is used, and the choice, feedback and hints reset

#### Scenario: Nothing stored
- **WHEN** the learner answers scenario practice, right and not yet
- **THEN** the learner state's attempts are unchanged

### Requirement: Going back keeps a scenario answer
When the learner leaves a scenario practice step with Back or Next and returns, the step SHALL show the same scenario, option order, choice, feedback and hints used. (FR-LRN-04, proposal item 6)

#### Scenario: Back then Next
- **GIVEN** a scenario practice step with a choice checked and one hint used
- **WHEN** the learner presses Back, then Next
- **THEN** the same scenario, choice, feedback and "Hint (1)" are shown
