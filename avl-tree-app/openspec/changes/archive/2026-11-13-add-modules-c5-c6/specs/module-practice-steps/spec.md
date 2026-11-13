# Spec Delta

## Purpose

Extends module steps with rotated-tree figures, engine-computed rebalance and order facts, order claims, and a seeded rotation practice step, so rotation and insertion modules never type a tree, a case or an answer.

## ADDED Requirements

### Requirement: Rotated trees as figures
A step SHALL be able to name a figure as keys inserted into a plain BST followed by one or more rotations, each given as a direction (left or right) and the key of the node to rotate at. The framework SHALL perform each rotation with the engine, in order. (FR-ENG-03, guardrail: every answer is computed by the engine)

#### Scenario: Single left rotation
- **GIVEN** a figure of keys 10, 20, 30 into a plain BST, then rotate left at 10
- **WHEN** its facts are computed
- **THEN** the root is 20, the height is 1 and the tree is a valid AVL tree

#### Scenario: Two rotations in order
- **GIVEN** a figure of keys 30, 10, 20 into a plain BST, then rotate left at 10
- **WHEN** its facts are computed
- **THEN** the root is 30 and the height is 2
- **AND GIVEN** the same figure with a second rotation, rotate right at 30
- **THEN** the root is 20 and the height is 1

### Requirement: Impossible rotations are reported
The content validator SHALL report a source problem, naming the step and the figure, when a rotation names a key that is not in the tree or a node with no child on the side the rotation needs.

#### Scenario: No child to lift
- **GIVEN** a figure of keys 10, 20, 30 into a plain BST, then rotate right at 10
- **WHEN** the validator checks the step
- **THEN** it reports a source problem naming the step and the figure, because node 10 has no left child

#### Scenario: Missing key
- **GIVEN** a figure of keys 10, 20, 30 into a plain BST, then rotate left at 40
- **WHEN** the validator checks the step
- **THEN** it reports a source problem naming the step and the figure

### Requirement: Rebalance facts
For every figure built from keys, the framework SHALL record each rebalance the engine performs when the same keys are inserted, in order, into an AVL tree: the key whose insert caused it, the unbalanced node, the case, and the number of single rotations used (one or two), and the root of the resulting AVL tree. A figure with no rebalance SHALL have an empty list. Numbers in these facts SHALL count as facts for the content validator.

#### Scenario: One rebalance
- **GIVEN** a figure of keys 10, 20, 30
- **WHEN** its facts are computed
- **THEN** it has exactly one rebalance: caused by inserting 30, at node 10, with the case the engine reports and 1 rotation, and the AVL root is 20

#### Scenario: Double rotation counted
- **GIVEN** a figure of keys 30, 10, 20
- **WHEN** its facts are computed
- **THEN** it has exactly one rebalance: caused by inserting 20, at node 30, with 2 rotations

#### Scenario: Several rebalances in order
- **GIVEN** a figure of keys 10, 20, 30, 40, 50
- **WHEN** its facts are computed
- **THEN** it has two rebalances, caused by inserting 30 and then 50

### Requirement: Case names reach text only through the conventions wording
A rebalance fact SHALL carry the case as the engine reports it. Text that names a case SHALL build the name through the conventions wording from that fact, so a different case naming from the lecturer changes one module. The content validator's existing wording check SHALL continue to reject typed case names. (D19)

#### Scenario: Case name follows the conventions
- **WHEN** the case name wording is built for each of the four cases the conventions module defines
- **THEN** each returns the conventions module's name for that case

#### Scenario: Typed case name still rejected
- **GIVEN** a step whose text contains the word "RR"
- **WHEN** the validator scans it
- **THEN** it reports a wording problem naming the step

### Requirement: Order facts and claims
Every figure's facts SHALL include its in-order key sequence. A step MAY claim that a figure is a BST, or that it has the same in-order sequence as another figure of the same step. The validator SHALL check both with the engine and report a false claim, naming the step and the claim. (ID C5: rotations never break the BST order)

#### Scenario: Rotation keeps the order
- **GIVEN** a step with figure A, keys 10, 20, 30 into a plain BST, and figure B, the same keys then rotate left at 10, claiming B is a BST and B has the same in-order sequence as A
- **WHEN** the validator checks it
- **THEN** it reports no claim problem, and both in-order sequences are 10, 20, 30

#### Scenario: False order claim reported
- **GIVEN** a step with figure A, keys 10, 20, 30, and figure B, keys 10, 20, 40, claiming B has the same in-order sequence as A
- **WHEN** the validator checks it
- **THEN** it reports a claim problem naming the step and the claim

### Requirement: Seeded rotation practice trees
The framework SHALL generate rotation practice problems from a seed: an AVL tree of a configured number of keys between 1 and 99, and one more key whose plain BST insert unbalances it. A single-rotation problem SHALL need exactly one rotation and a double-rotation problem exactly two, as the engine counts them. The same seed SHALL give the same problem; New tree SHALL use a new seed. (D9, D21)

#### Scenario: Single-rotation problems over many seeds
- **WHEN** single-rotation problems are generated for seeds 0 to 199
- **THEN** each starting tree is a valid AVL tree with the configured number of keys, the extra key is not in it, the tree after its plain BST insert is not AVL, and the engine's AVL insert of that key uses one rotation

#### Scenario: Double-rotation problems over many seeds
- **WHEN** double-rotation problems are generated for seeds 0 to 199
- **THEN** each meets the same conditions, with two rotations

#### Scenario: Same seed, same problem
- **WHEN** a problem is generated twice from one seed
- **THEN** the trees and the extra key are equal

### Requirement: Rotation practice step
A practice step of the rotation kind SHALL show the Do it yourself tool on the seeded problem: the tree after the plain BST insert, rotations by touch, pointer and keyboard, undo and reset, and engine feedback. A New tree button SHALL replace the problem with a new seeded one and reset the hints. Nothing SHALL be stored and nothing SHALL count toward readiness. (FR-VIS-06, FR-VIS-10, D21, D27)

#### Scenario: Practice opens on the unbalanced tree
- **WHEN** the student opens a rotation practice step
- **THEN** the tree shown has the extra key inserted, the inserted node is marked new, and a node's balance factor is outside the allowed range

#### Scenario: New tree
- **GIVEN** a rotation practice step where the student used one hint and made one rotation
- **WHEN** the student presses New tree
- **THEN** a different problem is shown with no rotations made, and Hint (2) is offered again

#### Scenario: Nothing stored
- **WHEN** the student rotates, undoes and asks for hints on a rotation practice step
- **THEN** the stored learner state is unchanged

### Requirement: Rotation practice hints
The control strip SHALL offer two hints on a rotation practice step, counting down, then Review the rule (D21). The first hint SHALL be a nudge. The second SHALL name the unbalanced node, its taller child and each rotation needed (direction and node), all computed by the engine, with any case name built through the conventions wording.

#### Scenario: Hints count down, then review
- **GIVEN** a rotation practice step
- **WHEN** the student presses Hint (2) and then Hint (1)
- **THEN** two hints are listed in order, the Hint button is gone and Review the rule is offered

#### Scenario: Fuller hint for a double rotation
- **GIVEN** a problem whose AVL tree holds 30 and 10 and whose extra key is 20
- **WHEN** the second hint is built
- **THEN** it names node 30 as the unbalanced node and node 10 as its taller child, and says to rotate left at 10, then right at 30

### Requirement: Going back keeps rotation practice
When the student leaves a rotation practice step with Back or Next and returns within the same activity, the step SHALL show the same problem, the rotations made and the undo history as they were. (FR-LRN-04)

#### Scenario: Back and forward keep the rotations
- **GIVEN** a rotation practice step where the student made one rotation
- **WHEN** the student presses Back, then Next
- **THEN** the same tree is shown as after that rotation, and Undo is available
