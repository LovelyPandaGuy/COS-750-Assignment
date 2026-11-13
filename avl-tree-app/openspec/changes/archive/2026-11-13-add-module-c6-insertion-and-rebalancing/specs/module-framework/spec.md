# Spec Delta

## MODIFIED Requirements

### Requirement: Insert facts
For a step that inserts a key, whether by a replay or as an inserted figure, the facts SHALL include the key, whether the engine rebalanced, the unbalanced node, the number of single rotations, and the height after the engine's AVL insert, all from the engine. For an inserted figure they SHALL describe the AVL insert of its key into its base tree even when the figure shows the plain insert. The rebalance case SHALL be in the facts but reach text only through the conventions wording. The validator SHALL accept these numbers and SHALL report a key that is already in the figure's tree. (Guardrail, FR-ENG-03, D19)

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

#### Scenario: Facts for an inserted figure
- **GIVEN** a step whose figure is the AVL tree of 30, 20 with 10 inserted plainly
- **WHEN** its facts are computed
- **THEN** the insert facts record a rebalance at 30 with 1 rotation, although the figure's tree has 30 unbalanced

### Requirement: Step player position and navigation
For an activity with module content, the activity screen SHALL show one step at a time with "Step n of m", the step heading, its trees and its text. Back SHALL go to the previous step, and on the first step to the module screen. Next SHALL go to the next step, and on the last step to the next activity of the module or, after Check, to the path. Going back SHALL keep any practice answers given in the activity. (FR-LRN-04)

#### Scenario: Forward and back
- **GIVEN** the C2 Explore activity on step 1
- **WHEN** the learner presses Next, then Back
- **THEN** the screen shows "Step 2 of m", then "Step 1 of m", where m is the number of C2 Explore steps

#### Scenario: Last step continues
- **GIVEN** the last C2 Explore step
- **WHEN** the learner presses Next
- **THEN** the C2 Worked example activity opens at step 1

#### Scenario: Activities without content stay skeletons
- **WHEN** the C9 Check activity opens
- **THEN** it shows the skeleton screen as before

## ADDED Requirements

### Requirement: Inserted figures
A step SHALL be able to name a tree as an AVL tree built from some keys followed by one more key, inserted either plainly into the AVL tree (no rebalancing) or with the AVL insert, by the engine. The facts for the figure SHALL be those of the tree it shows. The validator SHALL report a key that is already in the base tree as a source problem. (ID C6, FR-ENG-03)

#### Scenario: Plain insert breaks the rule
- **GIVEN** a step whose figure is the AVL tree of 30, 20 with 10 inserted plainly
- **WHEN** its facts are computed
- **THEN** the tree is not a valid AVL tree, node 30 is the only node out of balance, and 10 is in the tree

#### Scenario: AVL insert fixes it
- **GIVEN** a step whose figure is the AVL tree of 30, 20 with 10 inserted with rebalancing
- **WHEN** its facts are computed
- **THEN** the tree is a valid AVL tree with root 20

#### Scenario: Duplicate key
- **GIVEN** an inserted figure whose key is already in its base keys
- **WHEN** the validator checks it
- **THEN** it reports a source problem naming the step
