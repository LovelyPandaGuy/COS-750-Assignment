# module-c6-insertion Specification

## Purpose

Module C6 teaches insertion into an AVL tree with rebalancing (LO7): the five steps, how to find the unbalanced node and work out the case, and why one rotation is always enough, through worked examples that fade from done for you to on your own, with every tree, case and count from the engine.

## Requirements

### Requirement: C6 follows the Gagné order
C6 SHALL have a hook, goals, a recall, content, worked examples, a practice step, a check placeholder and a summary, in the framework's order, and the validator SHALL report no problem for it. (D10, FR-LRN-01)

#### Scenario: C6 is valid
- **WHEN** the validator checks C6
- **THEN** it reports no order, activity, claim, number, source or wording problem

#### Scenario: C6 activities
- **WHEN** the C6 Explore, Worked example and Check steps are listed
- **THEN** none is empty, Worked example holds three examples then the practice, and Check holds the placeholder and the summary

### Requirement: C6 states the five steps from the ID
C6 SHALL list the five steps of an insert as in the ID (BST insert, update heights going up, find the lowest unbalanced node, work out the case, rotate) in the pseudocode panel, with no line lit, and SHALL cover each step in its own content step with a tree from the engine. (ID C6, LO7)

#### Scenario: The outline
- **WHEN** the C6 outline step is shown
- **THEN** the insert listing's five lines are present in the ID's order and no line is marked current

#### Scenario: One content step each
- **WHEN** the C6 Explore content steps are listed
- **THEN** there is one for each of the five steps, in the ID's order, and each shows at least one tree

### Requirement: C6 shows heights updating on the way up
C6 SHALL show an AVL tree and the same tree after a plain BST insert of a key, so the learner can compare the heights shown under the nodes on the path from the new key to the root. (ID C6)

#### Scenario: Before and after
- **WHEN** the heights step's facts are computed
- **THEN** it has two figures, the AVL tree and the tree after the plain insert, the second has one more node, and its root height is greater than or equal to the first's

### Requirement: C6 finds the lowest unbalanced node from the engine
C6 SHALL show an insert after which more than one node is out of balance, and SHALL name the lowest one from the facts as the node to fix, saying that fixing it fixes the nodes above. The node SHALL be the one the engine's AVL insert rebalances at. (ID C6, LO7)

#### Scenario: Lowest node
- **WHEN** the lowest-node step's facts are computed
- **THEN** the plain-insert figure has at least two nodes out of balance, its lowest violation is the insert facts' unbalanced node, and the AVL-insert figure is a valid AVL tree

#### Scenario: Named from the facts
- **WHEN** the step is rendered
- **THEN** its text contains the lowest unbalanced node from the facts

### Requirement: C6 works out the case from the engine
C6 SHALL show one insert fixed by a single rotation and one fixed by a double rotation, and SHALL name each case only through the conventions wording and give each rotation count from the facts. (ID C6, D19)

#### Scenario: Single and double
- **WHEN** the case step's facts are computed
- **THEN** one insert records 1 rotation and the other 2, and their cases are different

#### Scenario: Case names through the wording
- **WHEN** the case step is rendered
- **THEN** each case name in its text is the conventions wording's name for the engine's case, and the C6 content files contain no case name and no balance-factor sign wording

### Requirement: C6 explains why one rotation is enough
C6 SHALL say that an insert needs at most one rebalance, which is one single or one double rotation, so insertion stays O(log2 n), and SHALL give the walk-up bound for a million keys from the computed AVL worst case. (ID C6, D13)

#### Scenario: Million-key figure
- **WHEN** the step is rendered with its facts
- **THEN** its text contains "28" and "1,000,000", both from the computed bounds

#### Scenario: At most one rebalance per insert
- **WHEN** random key sequences are inserted into an AVL tree (property test)
- **THEN** every insert records at most one rebalance and its rotation count is 1 or 2

### Requirement: Worked examples fade
The C6 worked examples SHALL go from done for you to guided: the first is an insert replay with no prediction; the second asks for a prediction of the unbalanced node before its replay; the third asks for a prediction of the case before its replay and offers Watch or Do it yourself. They SHALL use different keys and cover different cases. (ID C6, FR-VIS-05, FR-VIS-06)

#### Scenario: Three examples
- **WHEN** the C6 Worked example steps are listed
- **THEN** the first three are insert replays, with no prediction, a node prediction, and a case prediction with the switch, in that order

#### Scenario: Different cases
- **WHEN** the three examples' facts are computed
- **THEN** their inserts have at least two different cases, and each rebalances

### Requirement: Name the case, then rotate
The practice step SHALL show a seeded AVL tree after a plain BST insert of a key that unbalances it, with balance factors shown, and ask which of the four cases applies, as radio options named by the conventions wording. A right answer SHALL show the existing rotation tool for the same tree and key. Selecting and answering SHALL work by touch, pointer and keyboard. (ID C6, LO7, D3)

#### Scenario: Right case, then the tool
- **GIVEN** a practice problem
- **WHEN** the learner chooses the engine's case and presses Check
- **THEN** the feedback starts "That's right" and the rotation tool for the same tree and key appears

#### Scenario: Wrong case
- **GIVEN** a practice problem
- **WHEN** the learner chooses another case and presses Check
- **THEN** the feedback starts "Not quite yet", names the unbalanced node, its taller child and their balance factors, and the rotation tool does not appear

#### Scenario: Seeded problems
- **WHEN** practice problems are drawn for seeds 0 to 199
- **THEN** each is an AVL tree of the configured size plus a key whose plain insert leaves a node out of balance, the engine's case for it is one of the four, and both single and double rotations occur across the seeds

#### Scenario: New tree
- **WHEN** the learner presses New tree
- **THEN** a new problem is shown and the learner is asked to name the case again

#### Scenario: Keyboard only
- **WHEN** the learner answers using only the keyboard
- **THEN** the case can be chosen and checked, and focus stays visible

### Requirement: Practice support
Retries SHALL be unlimited and SHALL NOT store anything. Two hints SHALL be offered, the first pointing at the unbalanced node and its taller child, the second saying which way each leans using the conventions wording, then review. Wording SHALL use no "wrong", "fail" or cross glyph. Going back SHALL keep the learner's progress in the step. (D21, D27, FR-LRN-04)

#### Scenario: Hints and nothing stored
- **WHEN** the learner asks for both hints, answers wrongly, then rightly
- **THEN** the hints appear in order, the Hint control counts down, and the learner state is unchanged

#### Scenario: Back keeps the practice
- **GIVEN** the case answered right and the rotation tool shown
- **WHEN** the learner presses Back then Next
- **THEN** the step still shows the rotation tool for the same problem

### Requirement: C6 check placeholder and accessibility
The C6 check SHALL be the placeholder, followed by the summary and the "Where next?" panel, and SHALL NOT mark C6 complete. Every C6 step SHALL be axe clean. (ID C6, D42, NFR-02)

#### Scenario: Check placeholder
- **WHEN** the C6 Check activity opens
- **THEN** step 1 shows the coming-later line, step 2 is the summary with the "Where next?" panel, and the learner's completed modules are unchanged

#### Scenario: Axe
- **WHEN** each C6 step is rendered
- **THEN** axe reports no violations
