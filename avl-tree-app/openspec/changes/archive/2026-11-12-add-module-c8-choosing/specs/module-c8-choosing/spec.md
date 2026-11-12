# Spec Delta

## Purpose

Module C8 Choosing a structure (LO9, LO5): compare a plain BST, an AVL tree, a sorted array and a hash table, weigh the AVL trade-off, mention Red-Black trees, and practise picking a structure for a scenario.

## ADDED Requirements

### Requirement: C8 follows the module order
Module C8 SHALL be registered and SHALL play in the step player: Explore with a hook, goals, recall and content steps; Worked example with one worked scenario and two scenario practice steps; Check with the check placeholder and a summary. The content validator SHALL report no problem for C8. (LO9, FR-LRN-01, FR-LRN-05, D10, D15, D20)

#### Scenario: C8 is valid
- **WHEN** the validator checks module C8
- **THEN** it reports no problems

#### Scenario: C8 plays instead of the skeleton
- **WHEN** the student opens the C8 Explore activity
- **THEN** the step player shows "Step 1 of" the Explore step count, not the skeleton

#### Scenario: Goals state LO9 and LO5
- **WHEN** the C8 goals step is rendered
- **THEN** its text contains "pick a structure for a scenario" and "explain why AVL search is O(log2 n) but a plain BST can be O(n)"

#### Scenario: Check placeholder
- **WHEN** the C8 Check activity opens
- **THEN** step 1 shows the coming-later line, step 2 is the C8 summary, and the learner's completed modules are unchanged

### Requirement: C8 opens with the same keys in two trees
The hook SHALL show one set of sorted keys inserted into a plain BST and into an AVL tree, each searched for the largest key. The text SHALL give both search step counts from the facts. Claims SHALL confirm the first is not AVL and the second is AVL. (LO5, ID C8)

#### Scenario: Hook facts
- **WHEN** the C8 hook is rendered
- **THEN** its two figures use the same keys, the plain BST's search steps equal its key count, the AVL tree's search steps are fewer, and both numbers in the text equal the facts

### Requirement: C8 shows a sorted array and binary search
A content step SHALL show the hook's keys as a sorted array searched for the same key, and SHALL give the probe count from the facts. It SHALL say that inserting into a sorted array moves the larger keys along, marked as beyond the ID. (LO9, proposal item 1)

#### Scenario: Array step facts
- **WHEN** the sorted-array step is rendered
- **THEN** it has an array figure of the hook's keys, and the probe count in its text equals the facts

### Requirement: C8 describes a hash table
A content step SHALL describe a hash table: typical search and insert in O(1), no order among its keys, and worst-case search in O(n). Every cost SHALL come from the structure record. The step SHALL draw no tree. (LO9, proposal item 1)

#### Scenario: Hash step reads the record
- **WHEN** the hash-table step is rendered
- **THEN** its cost classes equal the record's hash table entries, and it has no figures

### Requirement: C8 states the AVL trade-off
A content step SHALL state the ID's AVL trade-off: an extra height in each node and rotation work, in return for a guaranteed O(log2 n). It SHALL show the hook's AVL tree with node heights and give the number of rotations the engine made while building it. (ID C8, LO5)

#### Scenario: Rotation count from the engine
- **WHEN** the trade-off step is rendered
- **THEN** the rotation count in its text equals the number of rebalances in the figure's facts, and the figure shows each node's height

### Requirement: C8 compares the four structures
A content step SHALL show the comparison table of the four structures. Its rule text SHALL summarise the table in words, from the record. (LO9, ID C8 "Compare a plain BST, an AVL tree, a sorted array and a hash table")

#### Scenario: Comparison step
- **WHEN** the comparison step is shown
- **THEN** the comparison table has four rows, and "Show the rule" reveals one sentence per structure built from the record

### Requirement: C8 mentions Red-Black trees
A content step SHALL say that Red-Black trees are another kind of self-balancing BST and that this course does not compare them in full. Red-Black trees SHALL NOT appear in the table or as a scenario option. (ID C8, SE section 4.4, proposal item 5)

#### Scenario: Mention only
- **WHEN** C8 is rendered and the comparison table and every scenario's options are listed
- **THEN** "Red-Black" appears in exactly one C8 step, and in no table row and no option

### Requirement: C8 works one scenario through
A worked-example step SHALL show one scenario from the record, list its needs, rule out each other structure with the need it does not meet, and give the answer, all from the computed scenario facts. (LO9)

#### Scenario: Worked scenario from facts
- **WHEN** the worked scenario step is rendered
- **THEN** its text names three structures ruled out, each with a need from the facts, and names the computed answer

### Requirement: C8 scenario practice
Two practice steps SHALL use the scenario practice step, each drawing from its own list of scenarios in the record. Together the lists SHALL contain scenarios whose answers cover all four structures. (LO9, D21)

#### Scenario: Practice covers every structure
- **WHEN** the answers of every scenario listed by the two practice steps are computed
- **THEN** each of the four structures is the answer to at least one of them

#### Scenario: No skip on practice
- **WHEN** a C8 practice step is shown
- **THEN** "I know this, skip" is not present

### Requirement: C8 closes with a summary
The summary step SHALL restate the ID's C8 points: the four structures differ in what they make fast, and an AVL tree pays an extra height in each node and rotation work for a guaranteed O(log2 n). It SHALL say that other self-balancing trees exist without naming them, so Red-Black trees stay a single mention. (ID C8, D10)

#### Scenario: Summary restates the trade-off
- **WHEN** the C8 summary is rendered
- **THEN** it mentions the extra height in each node, rotation work and O(log2 n)

### Requirement: C8 is accessible
Every C8 step SHALL pass axe, SHALL be usable by keyboard alone, and SHALL not rely on colour alone. (NFR-02, D3, D25)

#### Scenario: Axe on every step
- **WHEN** axe runs on every C8 step in all three activities
- **THEN** it reports no violations
