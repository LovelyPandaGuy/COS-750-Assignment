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
A step SHALL name its trees by source (keys inserted into a plain BST, keys inserted into an AVL tree, either of those followed by deletes with or without rebalancing, or a seeded generator) and any search key or tree size. The framework SHALL build each tree and compute its facts with the engine: height, node count, keys, search step count for the named key, best and worst case search step counts for a size, the most nodes a search can visit in an AVL tree of that size, AVL validity, and for each delete the key, its number of children, its in-order successor when it had two, and every rebalance with its node. Step text SHALL receive these facts and SHALL NOT contain them typed. (Guardrail, FR-ENG-03, FR-ENG-06, D13)

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

#### Scenario: AVL worst case for a size
- **WHEN** the AVL worst-case search bound for 1,000,000 keys is computed
- **THEN** it is 28 steps, because the tallest AVL tree of 1,000,000 keys has height 27

#### Scenario: AVL worst case matches the minimum node counts
- **WHEN** the AVL worst-case bound is computed for every n from 1 to 2,000
- **THEN** for each n it is h + 1, where h is the largest height whose minimum AVL node count (1 for height 0, 2 for height 1, then the two before plus one) is at most n

#### Scenario: Delete facts, two children
- **GIVEN** a step whose tree is keys 50, 30, 70, 20, 40, 60, 80 into a plain BST, then 50 deleted without rebalancing
- **WHEN** its facts are computed
- **THEN** the delete of 50 had 2 children and its successor is 60, the root is 60 and 50 is not in the tree

#### Scenario: Delete facts, rebalances
- **GIVEN** a step whose tree is keys 8, 5, 11, 3, 7, 10, 12, 2, 4, 6, 9, 1 into an AVL tree, then 12 deleted with rebalancing
- **WHEN** its facts are computed
- **THEN** the delete records the engine's rebalances, at 11 and then at 8, and the tree is a valid AVL tree

#### Scenario: Delete without rebalancing
- **GIVEN** a step whose tree is keys 20, 10, 30, 40 into an AVL tree, then 10 deleted without rebalancing
- **WHEN** its facts are computed
- **THEN** no rebalance is recorded and node 20 is out of balance

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
- **WHEN** the C9 Check activity opens
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

### Requirement: A step can show listings side by side
A step SHALL be able to name pseudocode listings to show side by side, each with its name and no line lit. Below the width where two columns fit, the listings SHALL stack in the order named. (ID C4, D3)

#### Scenario: Loop and recursive listings
- **GIVEN** a step that names the loop and recursive search listings
- **WHEN** it is shown
- **THEN** both listings are present with their names, in that order, and no line is marked current

### Requirement: Delete claims are checked
A step MAY claim that a delete in one of its figures needs more than one rebalance. The validator SHALL compute the claim with the engine and report it when it is false. (ID C7)

#### Scenario: True claim
- **GIVEN** the two-rebalance delete of 12 above, claimed to need more than one rebalance
- **WHEN** the validator checks it
- **THEN** it reports no claim problem

#### Scenario: False claim
- **GIVEN** keys 20, 10, 30, 40 into an AVL tree, then 10 deleted with rebalancing, claimed to need more than one rebalance
- **WHEN** the validator checks it
- **THEN** it reports a claim problem naming the step

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
