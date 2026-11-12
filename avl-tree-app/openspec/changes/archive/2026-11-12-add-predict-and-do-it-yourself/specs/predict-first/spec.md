# Spec Delta

## Purpose
Before a replay, asks the student to predict what an insert will do, then compares the guess with the engine's result in neutral words. Predictions are practice and are never scored.

## ADDED Requirements

### Requirement: Prediction kinds and options
The system SHALL offer three predictions about inserting a key into a tree: the first node to become unbalanced, the rebalancing case (LL, RR, LR, RL), and the new root of the rotated subtree. Every prediction SHALL include a "None" option meaning the tree stays balanced. The options for the node predictions SHALL be the nodes on the insertion path, in path order, then "None"; the case prediction SHALL offer the four cases, then "None". (FR-VIS-05, wireframe 1g)

#### Scenario: Node options are the insertion path
- **GIVEN** the tree 40 (left 20 with left child 10, right 60) and the key 5
- **WHEN** the options for "first node to become unbalanced" are requested
- **THEN** they are 40, 20, 10 and None, in that order

#### Scenario: Case options
- **WHEN** the options for "which case applies" are requested
- **THEN** they are LL, RR, LR, RL and None, using the case names from the conventions module

### Requirement: The answer comes from the engine
The system SHALL compute the correct answer to each prediction from the engine's insert trace for the same tree and key, and SHALL NOT take it from content. "First node to become unbalanced" is the unbalanced node z of the trace's imbalance step, "case" is that step's case, and "new root" is the node lifted to the top of the rotated subtree by the last rotation step. When the trace has no imbalance step, every answer SHALL be None. (FR-VIS-05, FR-ENG-06, CLAUDE.md guardrails)

#### Scenario: Single rotation, LL
- **GIVEN** the tree 30 with left child 20, and the key 10
- **THEN** the answers are node 30, case LL and new root 20

#### Scenario: Double rotation, LR
- **GIVEN** the tree 30 with left child 10, and the key 20
- **THEN** the answers are node 30, case LR and new root 20

#### Scenario: Imbalance below the root
- **GIVEN** the tree 40 (left 20 with left child 10, right 60) and the key 5
- **THEN** the answers are node 20, case LL and new root 10

#### Scenario: No imbalance
- **GIVEN** the tree 20 with children 10 and 30, and the key 5
- **THEN** every answer is None

#### Scenario: Answers agree with the trace for any insert
- **GIVEN** any valid AVL tree and any key not in it (property test)
- **THEN** the node and case answers are None exactly when `avlInsert` reports no rebalance, and otherwise equal its rebalance node and case

### Requirement: Prompt before a replay
The system SHALL show a prediction prompt that states the key about to be inserted and the question, with the options as a radio group, a "Lock in & watch" button and a "Skip, just watch" button. "Lock in & watch" SHALL be disabled until an option is chosen. Choosing a node by selecting it in the tree SHALL choose the same option, or, if that node is not an option, show it as "Your pick: Node n". The prompt SHALL tell the screen that replay may start only after Lock in or Skip. Each time the prompt is shown it SHALL start with nothing chosen. (FR-VIS-05, wireframe 1g)

#### Scenario: Lock in needs a choice
- **WHEN** the prompt is shown with nothing chosen
- **THEN** "Lock in & watch" is disabled and "Skip, just watch" is enabled

#### Scenario: Lock in
- **WHEN** the student chooses 20 and activates "Lock in & watch"
- **THEN** the proceed callback is called once, with the prediction recorded as not skipped, chosen 20

#### Scenario: Skip
- **WHEN** the student activates "Skip, just watch" with or without a choice
- **THEN** the proceed callback is called once, with the prediction recorded as skipped and no choice

#### Scenario: No replay before an answer
- **WHEN** the prompt is shown and neither button has been activated
- **THEN** the proceed callback has not been called

#### Scenario: Choosing in the tree
- **GIVEN** the tree view next to the prompt is interactive
- **WHEN** the student selects node 20 in the tree
- **THEN** the option 20 is chosen; and selecting a node that is not an option shows "Your pick: Node 5" and Lock in is enabled

#### Scenario: Fresh each time
- **WHEN** the prompt is shown again for a replay of the same example
- **THEN** nothing is chosen

### Requirement: Reveal after the replay
After the replay the system SHALL show a reveal that compares the prediction with the engine's answer in neutral words, links to the trace step it refers to, and explains any difference. For a node prediction the explanation SHALL give the balance factor each of the two nodes shows at the imbalance step. For a case prediction it SHALL say which way z and its taller child lean. For a new-root prediction it SHALL name the node lifted to the top. A skipped prediction SHALL show no reveal. (FR-VIS-05, wireframe 1g note 2)

#### Scenario: Match
- **GIVEN** the tree 30 with left child 20, the key 10, and the prediction "first unbalanced node: 30"
- **THEN** the reveal says the prediction matches, names the step number of the imbalance step, and does not say "wrong" or "fail"

#### Scenario: Mismatch, predicted node still in range
- **GIVEN** the same tree and key, and the prediction 20
- **THEN** the reveal says node 20 shows balance factor +1, which is allowed, and that node 30 shows +2

#### Scenario: Mismatch, predicted node also out of balance but higher
- **GIVEN** the tree 40 (left 20 with left child 10, right 60), the key 5, and the prediction 40
- **THEN** the reveal says node 40 also shows +2 at that step, and that 20 is lower on the path, so it is the first

#### Scenario: Predicted None, but one is unbalanced
- **GIVEN** the tree 30 with left child 20, the key 10, and the prediction None
- **THEN** the reveal says the insert does unbalance a node, naming 30 and its balance factor

#### Scenario: Predicted a node, but none is unbalanced
- **GIVEN** the tree 20 with children 10 and 30, the key 5, and the prediction 10
- **THEN** the reveal says every node stays within -1 to +1 and gives node 10's balance factor

#### Scenario: Case mismatch
- **GIVEN** the tree 30 with left child 10, the key 20, and the prediction LL
- **THEN** the reveal says z (30) leans left and its taller child (10) leans right, so the case is LR

#### Scenario: New root mismatch
- **GIVEN** the tree 30 with left child 10, the key 20, and the prediction 10
- **THEN** the reveal names 20 as the node lifted to the top

#### Scenario: Link to the step
- **WHEN** the student activates "Replay that step"
- **THEN** the replay callback is called with the index of the imbalance step in the trace

#### Scenario: Skipped
- **WHEN** the prediction was skipped
- **THEN** no reveal is shown

### Requirement: Predictions are practice, never marks
The prompt and the reveal SHALL NOT show a score, a count, red, or the words "wrong", "incorrect" or "fail". A mismatch SHALL use "not quite yet" wording, and every state SHALL carry words or an icon as well as any colour. The system SHALL report each prediction, with its kind, the choice, the engine's answer and whether it was skipped, through a callback, and SHALL NOT store it or count it toward readiness. (design principles 1 and 2, FR-VIS-05, D8, D16)

#### Scenario: Wording scan
- **WHEN** the wording in `src/content/practice.ts` for the prompt and the reveal is read
- **THEN** none of "wrong", "incorrect", "fail" or "score" appears

#### Scenario: Colour is not the only signal
- **WHEN** a reveal for a match and one for a mismatch are rendered
- **THEN** each starts with a distinct word or icon, and the text differs

#### Scenario: Reported, not stored
- **WHEN** a prediction is locked in
- **THEN** the report callback receives the kind, choice, engine answer and skipped flag, and `localStorage` is unchanged

### Requirement: Prompt is accessible
The prompt SHALL not trap focus or block the page, SHALL be a labelled group in reading order before the replay controls, SHALL use native radio inputs so arrow keys work, SHALL give every control a target of at least 44 px, and SHALL announce a lock-in, a skip and the reveal in a polite live region. (NFR-02, FR-VIS-10)

#### Scenario: Axe and keyboard
- **WHEN** the prompt and the reveal are rendered
- **THEN** axe reports no violations, and a keyboard-only run can choose, lock in, skip and activate "Replay that step"

#### Scenario: Announcements
- **WHEN** the student locks in 20
- **THEN** the live region says the prediction was locked in, naming 20; and after the reveal it says whether the prediction matched
