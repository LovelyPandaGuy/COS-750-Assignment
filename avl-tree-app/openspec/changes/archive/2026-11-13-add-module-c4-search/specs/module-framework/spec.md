# Spec Delta

## MODIFIED Requirements

### Requirement: Facts come from the engine
A step SHALL name its trees by source (keys inserted into a plain BST, keys inserted into an AVL tree, or a seeded generator) and any search key or tree size. The framework SHALL build each tree and compute its facts with the engine: height, node count, keys, search step count for the named key, best and worst case search step counts for a size, the most nodes a search can visit in an AVL tree of that size, and AVL validity. Step text SHALL receive these facts and SHALL NOT contain them typed. (Guardrail, FR-ENG-03, D13)

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
- **WHEN** the C6 Explore activity opens
- **THEN** it shows the skeleton screen as before

## ADDED Requirements

### Requirement: A step can play a search as a replay
A step SHALL be able to name one of its figures and a search key, and SHALL then show the existing replay of that search with its pseudocode panel as the step's primary representation, instead of the still figure. The replay SHALL start at its first position each time the step is shown. (D22, D33, FR-VIS-03, FR-VIS-04)

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
