# Spec Delta

## MODIFIED Requirements

### Requirement: A step can play a search as a replay
A step SHALL be able to name one of its figures and a search key, and SHALL then show the existing replay of that search with its pseudocode panel as the step's primary representation, instead of the still figure. The replay SHALL start at its first position each time the step is shown. A step MAY instead name a key to insert into an AVL figure, which SHALL play that insert as described under "A step can play an insert". (D22, D33, FR-VIS-03, FR-VIS-04)

#### Scenario: Replay step
- **GIVEN** a step that names an AVL figure and a search key as a replay
- **WHEN** the step is shown
- **THEN** the replay controls, the tree and the pseudocode panel for the search are present, and the figure is not drawn a second time

#### Scenario: Replay restarts
- **GIVEN** a replay step moved forward two positions
- **WHEN** the learner presses Next, then Back
- **THEN** the replay is at its first position again

## ADDED Requirements

### Requirement: A step can play an insert
A step SHALL be able to name an AVL figure and a key to insert, and SHALL then show the existing replay of that insert into the figure's tree, with the insert pseudocode, instead of the still figure. It SHALL start at its first position each time the step is shown. (FR-VIS-03, FR-VIS-04, D33)

#### Scenario: Insert replay step
- **GIVEN** a step that names the AVL figure of 30, 20 and the key 10 to insert
- **WHEN** the step is shown
- **THEN** the replay controls and the insert pseudocode panel are present, the replay starts at step 0 on the tree of 30 and 20, and the figure is not drawn a second time

#### Scenario: Insert replay ends on the engine result
- **GIVEN** that step
- **WHEN** the learner steps the replay to its end
- **THEN** the tree shown is the engine's AVL tree of 30, 20, 10, with root 20

### Requirement: Insert facts
For a step that inserts a key, the facts SHALL include the key, whether the engine rebalanced, the unbalanced node, the number of single rotations, and the height after the insert, all from the engine. The rebalance case SHALL be in the facts but reach text only through the conventions wording. The validator SHALL accept these numbers and SHALL report a key that is already in the figure's tree. (Guardrail, FR-ENG-03, D19)

#### Scenario: Rebalancing insert
- **WHEN** the facts of inserting 10 into the AVL tree of 30, 20 are computed
- **THEN** they record a rebalance at 30 with 1 rotation and a height after of 1

#### Scenario: Double rotation
- **WHEN** the facts of inserting 25 into the AVL tree of 30, 20 are computed
- **THEN** they record a rebalance at 30 with 2 rotations

#### Scenario: Duplicate key
- **GIVEN** a step that inserts 20 into the AVL tree of 30, 20
- **WHEN** the validator checks it
- **THEN** it reports a source problem naming the step

#### Scenario: Insert numbers accepted
- **GIVEN** a step whose text states the inserted key, the unbalanced node, the rotation count and the height after from its facts
- **WHEN** the validator checks it
- **THEN** it reports no number problem

### Requirement: Predict before the insert replay
An insert step SHALL be able to ask for a prediction of one kind (the node that becomes unbalanced, the case, or the new root) before its replay. The replay SHALL be held, with play and step unavailable, until the learner locks in or skips. When the replay reaches its last step, the reveal SHALL compare the prediction with the engine's answer, and "Replay that step" SHALL move the replay to the step that settles it. Nothing SHALL be stored. (FR-VIS-05, D27, D33)

#### Scenario: Held until an answer
- **GIVEN** an insert step with a node prediction
- **WHEN** it is shown
- **THEN** the prediction prompt is present and the replay's Play and Step controls are unavailable

#### Scenario: Lock in, watch, reveal
- **GIVEN** that step
- **WHEN** the learner chooses a node, locks in and steps the replay to its end
- **THEN** the reveal compares the choice with the engine's answer in neutral words

#### Scenario: Replay that step
- **GIVEN** the reveal is shown
- **WHEN** the learner activates "Replay that step"
- **THEN** the replay moves to the step the engine names for that prediction

#### Scenario: Skip
- **WHEN** the learner skips the prediction
- **THEN** the replay becomes available and the learner state is unchanged

#### Scenario: Fresh after Back and Next
- **GIVEN** the learner locked in a prediction
- **WHEN** they press Next, then Back
- **THEN** the prompt shows again with nothing chosen

### Requirement: Watch or Do it yourself on an insert step
An insert step SHALL be able to offer the existing Watch or Do it yourself switch, with Watch showing the insert replay (and its prediction, if any) and Do it yourself starting the rotation tool from the tree after a plain BST insert of the same key. (FR-VIS-06, wireframe 1h)

#### Scenario: Switch on a step
- **GIVEN** an insert step that offers the switch
- **WHEN** it is shown, then Do it yourself is chosen
- **THEN** Watch is selected first with the replay shown, and after switching the rotation tool is shown for the same tree and key

#### Scenario: Accessible
- **WHEN** insert steps with each option are rendered
- **THEN** axe reports no violations
