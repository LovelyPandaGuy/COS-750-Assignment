# module-c7-delete Specification

## Purpose

Module C7 teaches deletion from an AVL tree (LO8, optional): a recap of BST delete, rebalancing on the way back up, and that a delete can need more than one rotation, with every tree and count from the engine and a "find the unbalanced node" practice.

## Requirements

### Requirement: C7 follows the Gagné order
C7 SHALL have a hook, goals, a recall, content, a worked example, one practice step, a check placeholder and a summary, in the framework's order, and the validator SHALL report no problem for it. (D10, FR-LRN-01)

#### Scenario: C7 is valid
- **WHEN** the validator checks C7
- **THEN** it reports no order, activity, claim, number or wording problem

#### Scenario: C7 activities
- **WHEN** the C7 Explore, Worked example and Check steps are listed
- **THEN** none is empty, Worked example holds the example and the practice, and Check holds the placeholder and the summary

### Requirement: C7 recaps BST delete
C7 SHALL show plain BST deletes of a leaf, of a node with one child and of a node with two children, each as the tree before and after from the engine, and SHALL say that a node with two children takes the key of its in-order successor, naming the successor from the facts. (ID C7, SE 6.4)

#### Scenario: Three delete kinds
- **WHEN** the three recap steps' facts are computed
- **THEN** their deletes had 0, 1 and 2 children respectively, and each step shows two figures, before and after

#### Scenario: Successor named from the facts
- **WHEN** the two-children recap step is rendered
- **THEN** its text contains the successor key from the facts

### Requirement: C7 shows rebalancing on the way up
C7 SHALL show an AVL delete that leaves one node out of balance and is fixed by one rebalance on the way back up, with the tree after a plain delete and after the AVL delete. (ID C7)

#### Scenario: One rebalance
- **WHEN** the rebalancing step's facts are computed
- **THEN** the plain-delete figure has exactly one node out of balance, the AVL-delete figure is a valid AVL tree, and its delete records one rebalance at that node

### Requirement: C7 shows a delete can need more than one rotation
C7 SHALL show an AVL delete that needs more than one rebalance, unlike an insert, with a claim the validator checks and the rebalance nodes named from the facts. No deletion case name SHALL be shown. (ID C7, D19, lecturer question 4)

#### Scenario: Two rebalances
- **WHEN** the multi-rebalance step is checked and rendered
- **THEN** its claim passes, its delete records at least two rebalances, and the text names each rebalance node from the facts

#### Scenario: No case names
- **WHEN** the C7 content is scanned
- **THEN** it contains no case name and no balance-factor sign wording

### Requirement: Find the unbalanced node after a delete
The practice step SHALL show a seeded AVL tree, the key deleted from it, and the tree after a plain BST delete with heights shown and balance factors hidden. The learner SHALL select the lowest node out of balance and press Check; the engine's lowest balance violation is the answer. Selecting SHALL work by touch, pointer and keyboard. (LO8, D3)

#### Scenario: Right answer
- **GIVEN** a practice tree
- **WHEN** the learner selects the lowest node out of balance and presses Check
- **THEN** the feedback starts "That's right" and the balance factors are shown

#### Scenario: Higher unbalanced node
- **GIVEN** a practice tree with more than one node out of balance
- **WHEN** the learner selects one that is not the lowest
- **THEN** the feedback starts "Not quite yet" and says a lower node is also out of balance

#### Scenario: Node in range
- **WHEN** the learner selects a node whose balance factor is in range
- **THEN** the feedback starts "Not quite yet" and says that node is in balance

#### Scenario: Seeded trees
- **WHEN** practice problems are drawn for seeds 0 to 199
- **THEN** each before tree is a valid AVL tree of 7 to 10 keys from 1 to 99, the deleted key is in it, and the after tree has at least one node out of balance

#### Scenario: Keyboard only
- **WHEN** the learner answers using only the keyboard
- **THEN** the node can be selected and checked, and focus stays visible

### Requirement: Practice support
Retries SHALL be unlimited and SHALL NOT store anything; two hints SHALL be offered (a nudge to start at the deleted spot and walk up, then the side of the root the answer is on), then review. Wording SHALL use no "wrong", "fail" or cross glyph. (D21, D27)

#### Scenario: Hints and nothing stored
- **WHEN** the learner asks for both hints, answers wrongly, then rightly
- **THEN** the hints appear in order, the Hint control counts down, and the learner state is unchanged

### Requirement: C7 is optional and accessible
The C7 check SHALL be the placeholder and SHALL NOT block any module or the readiness summary. Every C7 step SHALL be axe clean. (ID C7, D4, D42, NFR-02)

#### Scenario: Check placeholder
- **WHEN** the C7 Check activity opens
- **THEN** step 1 shows the coming-later line and step 2 is the summary

#### Scenario: Axe
- **WHEN** each C7 step is rendered
- **THEN** axe reports no violations
