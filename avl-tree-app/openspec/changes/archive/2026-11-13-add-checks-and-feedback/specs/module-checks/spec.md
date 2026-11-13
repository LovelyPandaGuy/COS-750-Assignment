# module-checks Specification

## Purpose
How a module's Check activity shows its bank items, takes and marks an answer, stores each attempt, and completes the module only through its check.

## ADDED Requirements

### Requirement: The Check activity shows the bank's items
The Check activity of modules C2 to C8 SHALL show one bank item per step, in bank order, between its intro step and the summary step. Each step SHALL show the item's stem, its figure if any, and an answer control for the item's answer type. Question text SHALL come from the bank, not from module content. (FR-ASM-01, D7)

#### Scenario: Steps follow the bank
- **WHEN** the C3 Check activity opens
- **THEN** it shows the intro step, then the three C3 items one per step, then the C3 summary step

#### Scenario: No placeholder
- **WHEN** any Check activity from C2 to C8 is shown
- **THEN** the "coming in a later step" line is absent

### Requirement: Answer controls by type
A choice item SHALL show its options as a radio group, a number item a text field that accepts the forms the marker accepts, and a tree item the tree editor. "Check answer" SHALL be disabled until a response exists. A response the marker reports as unreadable SHALL show a short prompt to type a whole number and SHALL NOT count as an attempt. (FR-ASM-03)

#### Scenario: Choice
- **WHEN** a choice step is shown
- **THEN** its options are a labelled radio group and Check answer is disabled until one is chosen

#### Scenario: Unreadable number
- **WHEN** `two` is entered and Check answer is pressed
- **THEN** a prompt asks for a whole number and the learner's stored attempts are unchanged

### Requirement: Trace-an-insert editor
A tree item SHALL start from the item's given tree and list the keys to insert. The student SHALL insert each listed key into the tree with a plain search-tree insert, rotate with the existing rotation menu, and Undo or Reset. Every control SHALL work by touch, pointer and keyboard. The answer is the tree on screen when Check answer is pressed, marked by structure. (FR-ASM-04, D16)

#### Scenario: Insert and rotate
- **GIVEN** a trace-an-insert step whose insert needs one rotation
- **WHEN** the student inserts the key, rotates at the unbalanced node the right way and presses Check answer
- **THEN** the answer is marked correct

#### Scenario: Stopping early
- **GIVEN** the same step
- **WHEN** the student inserts the key and presses Check answer without rotating
- **THEN** the answer is marked not yet, with the explanation for the missing rebalance

#### Scenario: Keyboard only
- **WHEN** the same steps are done with the keyboard alone
- **THEN** the result is the same

### Requirement: Each marked answer is stored
Every answer the marker reports as correct or not yet SHALL be saved as an attempt with the item ID, time, response, result, misconception if any, hints used, and confidence if given. Confidence SHALL be two optional buttons, "Sure" and "Not sure". (FR-ASM-05 groundwork, D21)

#### Scenario: A wrong answer is saved
- **WHEN** a wrong option is chosen, "Not sure" is pressed and the answer is checked
- **THEN** the learner state gains one attempt with `correct: false`, that option's misconception and `confidence: "unsure"`

#### Scenario: Reload keeps the question
- **GIVEN** an item answered wrongly once
- **WHEN** the page is reloaded and the step is shown again
- **THEN** it shows the same learner's variant for attempt 1, not attempt 0

### Requirement: Retries are new variants
Try again SHALL show the next attempt of the same item, a new problem with options reshuffled. Until the retry cap is enforced in a later change, Try again SHALL stay available after every wrong answer. (FR-ASM-07, D9)

#### Scenario: New problem
- **WHEN** a wrong answer is followed by Try again
- **THEN** the stem or options differ from the previous attempt

### Requirement: A module completes through its check
A module SHALL be added to the completed modules when every required item of its check has an attempt marked correct. C7's items SHALL be optional: leaving them unanswered SHALL NOT block the next module, but answering them correctly SHALL complete C7. A module SHALL NOT be completed by any other route, including "I know this, skip". (FR-LRN-05, FR-SCA-05, D4, D20)

#### Scenario: Complete on the last right answer
- **GIVEN** the C2 items, all required
- **WHEN** the last is answered correctly
- **THEN** C2 is in the completed modules, and `currentModule` is C3 if it was C2

#### Scenario: One right is not enough
- **WHEN** only some of the C2 items have been answered correctly
- **THEN** C2 is not completed

#### Scenario: Skip does not complete
- **WHEN** a learner skips through C2's explanation steps and leaves the check unanswered
- **THEN** C2 is not completed

#### Scenario: C7 optional
- **WHEN** a learner leaves C7's items unanswered and enters C8
- **THEN** C8 shows no prerequisite note about C7, and C7 is not completed

#### Scenario: Notes switch on
- **GIVEN** C2 not completed
- **WHEN** C3 is entered
- **THEN** its prerequisite note names C2; after C2 completes, it does not

### Requirement: Accessible check steps
Check steps SHALL have no axe violations, SHALL move focus to the step heading when shown, SHALL announce feedback in a polite live region, and SHALL have controls at least 44 by 44 px. Colour SHALL NOT be the only signal of a verdict. (NFR accessibility, D25)

#### Scenario: Axe
- **WHEN** a check step of each answer type is rendered, before and after an answer
- **THEN** axe reports no violations

#### Scenario: Touch targets
- **WHEN** the controls of a check step are measured at 360 px width
- **THEN** each is at least 44 by 44 px and the page does not scroll sideways
