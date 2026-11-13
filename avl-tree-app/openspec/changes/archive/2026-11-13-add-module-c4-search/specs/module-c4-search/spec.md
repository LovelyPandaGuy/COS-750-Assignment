# Spec Delta

## Purpose

Module C4 teaches the search algorithm on an AVL tree (LO4) and why it stays fast while a lopsided BST does not (LO5), with every step count computed by the engine and a "be the algorithm" practice.

## ADDED Requirements

### Requirement: C4 follows the Gagné order
C4 SHALL have a hook, goals, a recall of the BST ordering property, content, a worked example, two practice steps, a check placeholder and a summary, in the framework's order, and the validator SHALL report no problem for it. (D10, FR-LRN-01)

#### Scenario: C4 is valid
- **WHEN** the validator checks C4
- **THEN** it reports no order, activity, claim, number or wording problem

#### Scenario: C4 activities
- **WHEN** the C4 Explore, Worked example and Check steps are listed
- **THEN** none is empty, Worked example holds the example and the two practice steps, and Check holds the placeholder and the summary

### Requirement: C4 shows search is BST search
C4 SHALL state that AVL search is the same as BST search and does not use balance factors, and SHALL show a search on an AVL tree as a replay with the loop pseudocode. (ID C4, LO4)

#### Scenario: Search replay
- **WHEN** the C4 content step on the algorithm is shown
- **THEN** a replay of a search on an AVL figure is present with its pseudocode panel, and the text says balance factors are not used

### Requirement: C4 shows the loop and recursive versions side by side
C4 SHALL show the loop and the recursive search pseudocode from the ID side by side. (ID C4, AL-Strategies 3)

#### Scenario: Two versions
- **WHEN** the C4 step on the two versions is shown
- **THEN** the loop and recursive listings are both present, loop first, with every line of each listing from the ID

### Requirement: C4 states the step bound from the engine
C4 SHALL state that a search takes at most height + 1 steps, and that with a million keys an AVL tree needs at most the computed AVL worst case while a lopsided BST can need up to a million. Both figures SHALL come from the facts. (ID C4, LO5, D13)

#### Scenario: Million-key figures
- **WHEN** the C4 bound step is rendered with its facts
- **THEN** its text contains "28" and "1,000,000", and both come from the computed bounds for 1,000,000 keys

#### Scenario: Height plus one on the figure
- **GIVEN** the C4 bound step's AVL figure and its search key
- **WHEN** its facts are computed
- **THEN** the search step count is at most the figure's height plus one

### Requirement: C4 worked example covers found and not found
The C4 worked example SHALL replay a search for a key in its tree and a search for a key not in it, so both outcomes of LO4 are shown. (LO4)

#### Scenario: Both outcomes
- **WHEN** the C4 worked example steps' facts are computed
- **THEN** one search key is in its tree and one is not, and each replay ends on the engine's found or not-found step

### Requirement: Be the algorithm practice
A "be the algorithm" step SHALL show a seeded AVL tree of 7 keys between 1 and 99, the key to find and the pseudocode panel. The learner SHALL select the next node the search visits; a right pick SHALL move the trace on and light the matching line. A search for a missing key SHALL end with a "Not in the tree" button. Selecting SHALL work by touch, pointer and keyboard. One practice step SHALL use a key in the tree and one a key not in it. (ID C4 activity, LO4, D3)

#### Scenario: Right pick moves on
- **GIVEN** a "be the algorithm" step
- **WHEN** the learner selects the node the engine's trace visits next
- **THEN** the trace moves one node on, the visited path shown as text gains that key, and the pseudocode panel lights the trace's line

#### Scenario: Found ends the practice
- **GIVEN** the practice step whose key is in the tree
- **WHEN** the learner selects every node on the engine's path in order
- **THEN** the step says the key is found in the number of steps the engine counts

#### Scenario: Not found ends with the empty spot
- **GIVEN** the practice step whose key is not in the tree, with every node on the path selected
- **WHEN** the learner presses "Not in the tree"
- **THEN** the step says the key is not in the tree after the number of steps the engine counts

#### Scenario: Keyboard only
- **WHEN** the learner completes a practice step using only the keyboard
- **THEN** each pick and "Not in the tree" can be made, and focus stays visible in the tree

#### Scenario: Seeded trees are valid
- **WHEN** practice trees and keys are drawn for seeds 0 to 199
- **THEN** each tree is a valid AVL tree of 7 distinct keys between 1 and 99, the found key is in it and the missing key is not

### Requirement: Be the algorithm feedback and hints
A wrong pick, or "Not in the tree" pressed too early, SHALL NOT move the trace and SHALL show "Not quite yet" with a why from the engine's comparison, a review link and the next step, with no red, cross glyph, "wrong" or "fail". Retries SHALL be unlimited; two hints SHALL be offered, then review. Nothing SHALL be written to the learner state. (D21, D27)

#### Scenario: Wrong pick
- **GIVEN** a practice step with the trace at node v
- **WHEN** the learner selects a node that is not the next one
- **THEN** the trace does not move and the feedback starts "Not quite yet" and names whether the key is smaller or larger than v

#### Scenario: Hints count down
- **WHEN** the learner asks for a hint twice
- **THEN** the first is the nudge, the second names the direction from the engine, the Hint control shows the count left, and after the second the review is offered

#### Scenario: Calm wording and nothing stored
- **WHEN** a practice step is completed with wrong picks and hints
- **THEN** no practice text contains "wrong", "fail" or a cross glyph, and the learner state is unchanged

#### Scenario: Accessible
- **WHEN** each C4 step is rendered
- **THEN** axe reports no violations
