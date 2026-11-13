# module-framework Specification

## Purpose

Lets a module be written as data: an ordered list of steps typed by Gagné event, whose facts are computed by the engine, checked by a content validator and played by a step player with one control strip.

## Requirements

### Requirement: Steps follow the Gagné order
A module SHALL be an ordered list of steps, each typed by one Gagné event: hook, goals, recall, content, example, practice, check or summary. Hook, goals, check and summary SHALL appear exactly once; recall at least once. The order SHALL be hook, goals, recall, then content, example and practice in any order, then check, then summary. (D10, FR-LRN-01)

#### Scenario: Valid order
- **GIVEN** the C2 and C3 module content
- **WHEN** the validator checks them
- **THEN** it reports no order problem

#### Scenario: Summary before check
- **GIVEN** a module whose summary step comes before its check step
- **WHEN** the validator checks it
- **THEN** it reports an order problem naming the summary step

#### Scenario: Missing hook
- **GIVEN** a module with no hook step
- **WHEN** the validator checks it
- **THEN** it reports that the hook is missing

### Requirement: Steps belong to activities
Each step SHALL belong to the activity its event maps to: hook, goals, recall and content to Explore; example and practice to Worked example; check and summary to Check. Explore steps SHALL come before Worked example steps, and those before Check steps. (FR-LRN-05, wireframe 1e)

#### Scenario: Steps grouped by activity
- **GIVEN** the C2 module
- **WHEN** its Explore, Worked example and Check steps are listed
- **THEN** each list holds only steps of the mapped events, in module order, and none is empty

#### Scenario: Practice placed in Explore
- **GIVEN** a module with a practice step placed among the Explore steps
- **WHEN** the validator checks it
- **THEN** it reports an activity problem naming that step

### Requirement: Facts come from the engine
A step SHALL name its trees by source (keys inserted into a plain BST, keys inserted into an AVL tree, or a seeded generator) and any search key or tree size. The framework SHALL build each tree and compute its facts with the engine: height, node count, keys, search step count for the named key, best and worst case search step counts for a size, and AVL validity. Step text SHALL receive these facts and SHALL NOT contain them typed. (Guardrail, FR-ENG-03)

#### Scenario: Chain facts
- **GIVEN** a step whose tree is keys 10, 20, 30, 40, 50 into a plain BST, with search key 50
- **WHEN** its facts are computed
- **THEN** the height is 4, the node count is 5 and the search step count is 5

#### Scenario: AVL facts
- **GIVEN** a step whose tree is keys 10, 20, 30, 40, 50 into an AVL tree
- **WHEN** its facts are computed
- **THEN** the root is 20 and the height is 2, and the tree is a valid AVL tree

#### Scenario: Bounds for a size
- **WHEN** the search bounds for 5 keys and for 1,000,000 keys are computed
- **THEN** the worst case is 5 and 1,000,000 steps, and the best case is 3 and 20 steps (the height of the shortest tree plus one)

### Requirement: Claims are checked against the engine
A step MAY state boolean claims about its trees: is AVL, is perfect, root in range, has exactly one unbalanced node. The validator SHALL compute each claim with the engine and report any claim that is false.

#### Scenario: True claim passes
- **GIVEN** a step claiming that the AVL tree from 20, 10, 30, 5 is AVL and not perfect
- **WHEN** the validator checks it
- **THEN** it reports no claim problem

#### Scenario: False claim is reported
- **GIVEN** a step claiming that the plain BST from 10, 20, 30 is AVL
- **WHEN** the validator checks it
- **THEN** it reports a claim problem naming the step and the claim

### Requirement: No typed numbers in step text
Every number in a step's rendered text SHALL be one of its facts, one of its tree keys or search keys, a value from the conventions module, or a number the step declares as an allowance with a reason. The validator SHALL render each step with its facts and report any other number. "log2" SHALL NOT count as a number.

#### Scenario: Engine number accepted
- **GIVEN** the chain step whose text says finding 50 takes the computed number of steps
- **WHEN** the validator checks it
- **THEN** it reports no number problem

#### Scenario: Typed answer rejected
- **GIVEN** a step whose text says "height 7" while its facts give height 4 and 7 is no key or allowance
- **WHEN** the validator checks it
- **THEN** it reports a number problem naming the step and the number 7

### Requirement: No sign, lean or case wording in module content
Module content SHALL NOT state the balance-factor formula, which way a positive or negative balance factor leans, or a case name. The validator SHALL reject text containing "left minus right", "right minus left", "height(left)" or "height(right)" followed by a minus, "leans left", "leans right", "left-heavy", "right-heavy", or the words LL, RR, LR, RL, left-left, right-right, left-right or right-left. That wording SHALL come from the conventions wording instead. (D19)

#### Scenario: Module content is clean
- **WHEN** the validator scans the C2 and C3 module content
- **THEN** it reports no wording problem

#### Scenario: Typed formula rejected
- **GIVEN** a step whose text contains "balance factor = left minus right"
- **WHEN** the validator scans it
- **THEN** it reports a wording problem naming the step

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
- **WHEN** the C4 Explore activity opens
- **THEN** it shows the skeleton screen as before

### Requirement: Focus moves to each step
When the step changes, focus SHALL move to the step heading, and the step heading SHALL be the screen's level-2 heading under the activity's level-1 heading. All player controls SHALL be reachable and usable by keyboard, with visible focus. (WCAG 2.4.3, NFR-02)

#### Scenario: Focus after Next
- **WHEN** the learner presses Next with the keyboard
- **THEN** focus is on the new step's heading

#### Scenario: Axe clean
- **WHEN** each C2 and C3 step is rendered
- **THEN** axe reports no violations

### Requirement: Control strip
Every step SHALL show a control strip in the same place below the step text: Back and Next on one side, and on the other the learning aids that step has, namely Show the rule when the step has rule text and Hint with the number of hints left on practice steps. Every control SHALL be at least 44 by 44 px. (D23, FR-VIS-10)

#### Scenario: Rule on demand
- **GIVEN** a step with rule text
- **WHEN** it is shown
- **THEN** the rule text is hidden and a "Show the rule" button is present
- **AND** pressing it shows the rule text and sets the button's expanded state to true

#### Scenario: No aid, no button
- **GIVEN** a step with no rule text that is not a practice step
- **WHEN** it is shown
- **THEN** neither "Show the rule" nor "Hint" is present

### Requirement: Skip on explanation steps only
Content and example steps SHALL offer "I know this, skip", which moves to the first later step in the activity that is not a content or example step, or to the next activity when there is none. Hook, goals, recall, practice, check and summary steps SHALL NOT offer it. (D20)

#### Scenario: Skip from content
- **GIVEN** the first content step of C3 Explore
- **WHEN** the learner presses "I know this, skip"
- **THEN** the C3 Worked example activity opens, because every remaining C3 Explore step is a content step

#### Scenario: No skip on practice
- **WHEN** a C3 practice step is shown
- **THEN** "I know this, skip" is not present

### Requirement: Check placeholder until assessment exists
A check step SHALL show that the check is coming in a later step, using the existing skeleton wording, and SHALL NOT mark the module complete. The summary step SHALL follow it. (D20, plan changes 19 to 21)

#### Scenario: Check activity
- **WHEN** the C2 Check activity opens
- **THEN** step 1 shows the coming-later line, step 2 is the C2 summary, and the learner's completed modules are unchanged
