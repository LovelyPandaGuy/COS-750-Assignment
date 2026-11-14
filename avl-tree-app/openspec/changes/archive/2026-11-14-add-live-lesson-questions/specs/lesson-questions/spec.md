# Spec Delta

## Purpose

Asks the questions of the ID's lessons inside the lesson frame, one reusable component per question type, and marks every answer against the engine, naming the misconception behind a wrong answer.

## ADDED Requirements

### Requirement: Interactive screens ask their question
A `predict`, `recall`, `task` or `practice` screen, and a summary's `transfer` question, SHALL show its question in the lesson frame with the control for its type: the stem, the tree when it has one (built by the engine, with the screen's `show` list), the answer control, and Check answer. (ID 3.2, ID 9.5)

#### Scenario: Recall question
- **WHEN** `c3-s03` is shown
- **THEN** its stem "What is the height of a leaf?" and three options are shown as a radio group with Check answer

#### Scenario: Practice on a tree
- **WHEN** `c3-s09` is shown
- **THEN** the tree from 50, 30, 70, 20, 40, 80, 35 is drawn with its balance factors hidden, and one labelled field per target node is shown

### Requirement: One component per question type
Each question type SHALL be answered with one shared control: `mcq` and `case-id` a radio group; `enter-values` one labelled number field per target, plus a node picker when `askUnbalanced` is set and a Yes/No choice when `askIsAvl` is set; `click-node` the tree with node selection (one, one or none, or many or none, by `selectMode`, with a None button where none is allowed); `trace` node selection in order, then Found or Not found; `perform-rotation` and `build-tree` the tree builder. (ID 9.5)

#### Scenario: Same control everywhere
- **WHEN** the mcq questions `c2-s10-task` and `chk2-01` are shown
- **THEN** both use the same choice control and markup

#### Scenario: Many or none
- **WHEN** `chk3-02` is shown
- **THEN** several nodes can be selected, and a None button is offered

### Requirement: Values are typed as the ID writes them
A number field SHALL accept whole numbers with an optional sign, written with a hyphen, a true minus sign or a plus sign. Anything else SHALL be refused with a short prompt and SHALL NOT count as an attempt. (ID 10.1 example "−4")

#### Scenario: Minus forms
- **WHEN** "−4", "-4" and "+4" are entered for node 10 in `c3-s11`
- **THEN** the first two are read as −4 and the third as 4

#### Scenario: Unreadable
- **WHEN** "four" is entered
- **THEN** a prompt asks for a whole number and no attempt is stored

### Requirement: The tree builder
A `build-tree` or `perform-rotation` question SHALL start from its tree and offer, for each key still to insert, the empty branches where it could go as targets; a selected node can be rotated left or right with the rotation menu, and a delete operation offers Delete for its key. Undo, Reset and the in-order sequence SHALL always be shown, and every action SHALL work by touch, pointer and keyboard. The answer is the tree on screen. (ID 8.3, D3)

#### Scenario: Place a key by its branch
- **WHEN** `c2-s01-task` is shown
- **THEN** 10 is offered as the first key with one target (the empty tree), and after placing it, 20 is offered with two targets (left and right of 10)

#### Scenario: Rotate and undo
- **GIVEN** `chk5-03` after 35 is placed
- **WHEN** a right rotation about 40 is chosen and then Undo
- **THEN** the tree is back to the tree before the rotation

#### Scenario: Keyboard
- **WHEN** `chk6-04` is answered with the keyboard only
- **THEN** every target, the rotation menu, Undo, Reset and Check answer can be reached and used

### Requirement: The engine marks every answer
Every answer SHALL be marked against the engine's result for the question's tree and operation, never against a value typed in the content: the correct option, the engine's heights and balance factors, its node set, its search path with found or not found, or its final tree compared by keys and shape. A compound `enter-values` answer is right only when every part is right. (ID 12.2, D95)

#### Scenario: Balance factors from the engine
- **WHEN** `c3-s11-task` is answered with 4
- **THEN** it is marked right, because the engine's balance factor of node 10 is +4

#### Scenario: A tree marked by shape
- **WHEN** `chk6-04` is answered with the tree `40(25(20(10, ·), 30(27, 35)), 50(·, 60))`
- **THEN** it is marked right

#### Scenario: Part right
- **WHEN** `chk3-01` is answered with height 2 and balance factor −1
- **THEN** it is not right, and the feedback verdict is "Almost there."

### Requirement: Wrong answers name their misconception
A wrong answer SHALL be matched to the content's explanation: the chosen option's `explanation`; else a `wrongAnswers` entry matching a value at a target, the selected node, the tree's shape, or a `conventions.wrongAnswerPatterns` pattern; else `feedback.incorrect`. The matched misconception SHALL be stored with the attempt. (ID 9.5, ID 9.6, ID 10.2)

#### Scenario: Sign mistake
- **WHEN** `c3-s11-task` is answered with −4
- **THEN** the reason is the `misc-bf-sign` feedback ("The sign is reversed. …") and `misc-bf-sign` is stored with the attempt

#### Scenario: Wrong direction in a trace
- **WHEN** `chk4-01` (search for 45) is answered with 50, 70
- **THEN** the reason is the `goes-wrong-direction` feedback and `misc-bst-order-reversed` is stored

#### Scenario: Single rotation for an inside case
- **WHEN** `chk5-03` is answered with one left rotation about 20
- **THEN** the reason is the `misc-single-for-inside` feedback

### Requirement: Practice allows unlimited tries
A practice, recall, task, predict or transfer question SHALL allow as many tries as the student likes, keep the static hint available, and never block Next. Its attempts SHALL be stored like check attempts. (ID 10.2)

#### Scenario: Try again as often as needed
- **WHEN** `c2-s10-task` is answered wrongly three times
- **THEN** Try again is still offered each time and Next stays available

### Requirement: Predict screens
A `predict` screen SHALL show its options; after a choice it SHALL reveal its `reveal` text, saying whether the prediction matched. When `answerFrom` is `engine`, the matching option SHALL be the engine's answer (the most comparisons a search can need, height + 1); otherwise it is the screen's `answer`. A prediction SHALL never block Next. (ID 8.1 "Predict, then reveal", ID 10.3 curiosity)

#### Scenario: Engine prediction
- **WHEN** "5" is chosen on `c4-s01`
- **THEN** the prediction is marked as matching and the reveal is shown

#### Scenario: Conceptual prediction
- **WHEN** "Nothing: the tree is fine" is chosen on `c6-s01`
- **THEN** the reveal is shown with a calm "Not quite." and Next is available

### Requirement: Practice screens with a pseudocode panel
A practice screen with `pseudocode` and `stepCounter` SHALL show the listing and light the line for each node the student picks, and SHALL count the comparisons made so far. (ID 7.2 C4 "Be the algorithm")

#### Scenario: Be the algorithm
- **WHEN** 7 and then 13 are picked on `c4-s09` (search for 9)
- **THEN** the counter reads 2 and the loop listing's go-right line ("else p = p.right", reached by 9 > 7) is lit

### Requirement: Guided pauses in an animation
An animation with `guided` SHALL pause at each imbalance (`pauseAt: "imbalance"`) and ask for n when `askNode` is set and for the case when `askCase` is set, both marked from the engine, before it continues. (ID 7.2 C6 "the second is guided")

#### Scenario: C6 Example 2
- **WHEN** `c6-s06` is stepped to its first imbalance
- **THEN** stepping stops, the student is asked to select n and name the case, and choosing node 7 and Case 3 (RL) lets the animation continue

### Requirement: Questions are accessible
Every question SHALL have no axe violations before and after an answer, SHALL be usable by keyboard alone, SHALL have targets of at least 44 by 44 px, and SHALL never use colour alone to show a selection or a verdict. (NFR-02, ID 11)

#### Scenario: Axe on every question type
- **WHEN** one question of each type is rendered, then answered wrongly
- **THEN** axe reports no violations in either state
