# module-c3-avl-property Specification

## Purpose

Module C3 "The AVL property": teaches height, balance factor and the rule that every node's balance factor is in the allowed range, and lets students practise working out balance factors and spotting a hidden violation (LO2, LO3).

## Requirements

### Requirement: C3 teaches height and balance factor
C3 SHALL have content steps that define height using the conventions module (leaf and empty-tree heights shown from it), say that each node stores its height, and define the balance factor with the conventions wording. The goals step SHALL state LO2 and LO3 as written in the ID. (ID C3, LO2, D19)

#### Scenario: Convention values come from the module
- **WHEN** the C3 height step is rendered
- **THEN** its text shows the leaf height and the empty-tree height from the conventions module (0 and -1 under D2)

#### Scenario: Formula from conventions wording
- **WHEN** the C3 balance-factor step's rule is shown
- **THEN** its text equals the conventions wording for the balance factor, and the step's own content contains no formula

### Requirement: C3 states the AVL rule at every node
C3 SHALL state that every node's balance factor must be in the allowed range from the conventions module, not just the root's; that an AVL tree need not be perfectly balanced, shown with a tree the validator confirms is AVL and not perfect; and that height is at most about 1.44 log2 n, stated without proof. (ID C3, LO2)

#### Scenario: Not perfect but AVL
- **WHEN** the "need not be perfect" step is validated
- **THEN** its tree is AVL and not perfect according to the engine

#### Scenario: Bound stated
- **WHEN** the bound step is rendered
- **THEN** its text contains "1.44" and "log2 n", and 1.44 is a declared allowance with the reason "ID C3, stated without proof (D13)"

### Requirement: C3 works one balance factor through
C3 SHALL have a worked-example step that takes one node of a small tree and shows its left and right subtree heights and its balance factor, all from the engine. (ID C3, FR-SCA-04)

#### Scenario: Worked node
- **GIVEN** the plain BST from 30, 20, 40, 10 and node 20
- **WHEN** the worked step is rendered
- **THEN** its text gives left height 0, right height -1 and balance factor +1 from the engine

### Requirement: Practice: fill in the balance factors
C3 SHALL have a practice step with a seeded tree of 5 to 7 nodes whose balance factors are hidden. The learner selects a node by pointer, touch or keyboard, enters a whole number with buttons or typing, and checks it. A correct answer shows that node's balance factor on the tree. The step is done when every node is correct. (ID C3 activity, LO3, FR-VIS-10)

#### Scenario: Correct answer revealed
- **GIVEN** the plain BST from 30, 20, 10 and node 30 selected
- **WHEN** the learner enters +2 and checks
- **THEN** the feedback starts "That's right" and node 30 shows "bf +2"

#### Scenario: All nodes done
- **WHEN** the learner has a correct answer for every node
- **THEN** the step says the tree is complete and Next stays available

#### Scenario: Keyboard only
- **WHEN** the learner selects a node, enters a value and checks using only the keyboard
- **THEN** the answer is checked and the feedback is announced in a polite live region

### Requirement: Practice: spot the problem
C3 SHALL have a practice step with a seeded plain BST of at most 9 nodes whose root balance factor is in range and exactly one other node is out of range, with balance factors and the Unbalanced flag hidden. The learner selects the node that breaks the rule and checks it. (ID C3 activity, LO3)

#### Scenario: Generator guarantees
- **GIVEN** seeds 0 to 199
- **WHEN** a spot-the-problem tree is generated for each
- **THEN** every tree has at most 9 nodes, its root is in range, exactly one node is out of range, and that node is not the root

#### Scenario: Correct node
- **GIVEN** the plain BST from 50, 30, 70, 20, 80, 10
- **WHEN** the learner selects node 30 and checks
- **THEN** the feedback starts "That's right" and the tree now shows balance factors and the Unbalanced flag on node 30

### Requirement: Practice feedback in four parts
Practice feedback SHALL have a verdict ("That's right" or "Not quite yet"), a reason built from engine facts, a "Review" control that opens the step's rule in place, and the next action (Try again, or Next). A balance-factor answer equal to the negative of a non-zero correct answer SHALL be named as a sign slip. No feedback SHALL use red, a cross glyph or the words wrong, incorrect or fail. (D27, FR-SCA-02 in part)

#### Scenario: Sign slip named
- **GIVEN** the plain BST from 30, 20, 10 and node 30 selected
- **WHEN** the learner enters -2 and checks
- **THEN** the feedback starts "Not quite yet", says the size is right but the sign is the other way round, gives subtree heights 1 and -1 from the engine, and offers Try again and Review

#### Scenario: Calm wording
- **WHEN** every practice feedback string is rendered for correct, sign-slip and other wrong answers
- **THEN** none contains "wrong", "incorrect", "fail" or "✗"

### Requirement: Practice retries and hints
Practice SHALL allow unlimited retries on the same tree and offer a new tree on request. Each practice step SHALL offer the configured number of hints (2): a nudge, then a fuller hint built from engine facts. The Hint button SHALL show how many are left, and when none are left SHALL offer to review the rule. Practice answers SHALL NOT be stored and SHALL NOT count toward readiness. (D21, wireframe 1p)

#### Scenario: Hints count down
- **GIVEN** a practice step
- **WHEN** the learner presses Hint twice
- **THEN** the button reads "Hint (2)", then "Hint (1)", then the button is replaced by "Review the rule", and the two hints are shown in order

#### Scenario: Nothing stored
- **WHEN** the learner answers practice items, right and not yet
- **THEN** the learner state's attempts are unchanged

#### Scenario: New tree
- **WHEN** the learner asks for a new tree
- **THEN** a tree from a different seed replaces it and the answers and hints reset
