# Spec Delta

## Purpose

What the student takes from C9 to the lecture: Ready or Revise for each learning outcome, computed from their stored attempts, with links back to the right examples, flagged confident errors, and a short list of questions to bring, including one of their own.

## ADDED Requirements

### Requirement: Item status comes from stored attempts
Each readiness item SHALL get a status from the stored attempts with its ID, in time order: no attempt is unassessed; a latest attempt that is not correct is not yet; a latest correct attempt directly after a wrong one is developing; any other latest correct attempt is secure. (FR-RDY-01, D8)

#### Scenario: The four states
- **GIVEN** stored attempts for four items: none; wrong; wrong then correct; correct
- **WHEN** the report is computed
- **THEN** the items are unassessed, not yet, developing and secure, in that order

#### Scenario: The latest run decides
- **GIVEN** an item answered correctly, then later wrong
- **WHEN** the report is computed
- **THEN** the item is not yet

### Requirement: Ready or Revise per outcome
Each of LO1 to LO9 SHALL be Ready when at least one of its readiness items is assessed and every assessed one is secure or developing, and Revise otherwise. Combined items SHALL count toward their outcome. Each outcome's state SHALL be the lowest state of its assessed items (not yet below developing below secure), or unassessed when none is assessed. (FR-RDY-01, FR-ASM-06, D8)

#### Scenario: Ready with a return
- **GIVEN** LO2's item was answered wrong and then correct on its return
- **WHEN** the report is computed
- **THEN** LO2 is Ready with state developing

#### Scenario: A combined item can hold an outcome back
- **GIVEN** LO4's own item is secure and the search item's latest attempt is wrong
- **WHEN** the report is computed
- **THEN** LO4 is Revise with state not yet

#### Scenario: Nothing answered yet
- **WHEN** the report is computed with no stored attempts
- **THEN** every outcome is Revise and unassessed

#### Scenario: Matches the stored attempts
- **WHEN** arbitrary stored attempts on readiness items (property test) give a report
- **THEN** each outcome's verdict equals the rule above applied directly to those attempts

### Requirement: LO8 never blocks Ready
The report SHALL show LO8 like every other outcome, and the overall verdict SHALL be Ready exactly when every outcome other than LO8 is Ready. (FR-RDY-01, D4)

#### Scenario: Revise on LO8 only
- **GIVEN** every outcome is Ready except LO8, which is Revise
- **WHEN** the report is computed
- **THEN** the overall verdict is Ready and LO8 is still listed as Revise

#### Scenario: Revise elsewhere
- **GIVEN** every outcome is Ready except LO3
- **WHEN** the report is computed
- **THEN** the overall verdict is Revise

### Requirement: Confident errors are flagged
For each outcome the report SHALL count the stored attempts that are not correct and are rated "sure", over the module-check and readiness items of that outcome. Attempts on unknown item IDs SHALL be ignored. (FR-RDY-01, FR-ASM-05)

#### Scenario: Counted per outcome
- **GIVEN** a wrong "sure" attempt on a C3 balance-factor check item, a wrong "unsure" attempt on the same item, and a correct "sure" attempt on the LO3 readiness item
- **WHEN** the report is computed
- **THEN** LO3 has one confident error and every other outcome has none

#### Scenario: Unknown IDs ignored
- **GIVEN** a wrong "sure" attempt whose question ID is in neither bank
- **WHEN** the report is computed
- **THEN** no outcome counts it

### Requirement: Links back to the examples
Each outcome SHALL link to the worked example of every module the ID names for it: LO1 C2, LO2 C3, LO3 C3, LO4 C4, LO5 C4 and C8, LO6 C5, LO7 C6, LO8 C7, LO9 C8. (FR-RDY-01, ID C9 "links back to the right examples")

#### Scenario: Links per outcome
- **WHEN** the report is computed
- **THEN** each outcome's links are the worked-example activity of exactly the modules listed above

### Requirement: Unresolved misconceptions become lecture questions
A misconception SHALL be unresolved when a stored wrong attempt carries it and no later attempt on an item of the same sub-skill is correct. The list SHALL hold one question per unresolved misconception, in the order each first appeared, built from one template on the misconception's catalogue label. The list SHALL be empty exactly when nothing is unresolved. (FR-RDY-02)

#### Scenario: Unresolved misconception listed
- **GIVEN** a wrong attempt on a balance-factor check item tagged with the subtraction-order misconception, and nothing later on that sub-skill
- **WHEN** the lecture list is built
- **THEN** it holds one question whose text contains that misconception's label

#### Scenario: Resolved by a later correct answer
- **GIVEN** that same wrong attempt, followed by a correct attempt on the LO3 balance-factor readiness item
- **WHEN** the lecture list is built
- **THEN** the subtraction-order misconception is not listed

#### Scenario: Empty only when nothing is unresolved
- **WHEN** arbitrary stored attempts (property test) give a lecture list
- **THEN** the list is empty exactly when no misconception is unresolved, and no misconception appears twice

#### Scenario: Every misconception has a template
- **WHEN** the template is applied to every catalogue label
- **THEN** each question is non-empty, contains its label, and contains none of "wrong", "fail" or "incorrect" (D27)

### Requirement: Drafted and own questions
The lecture list SHALL also hold the drafted lecture questions stored at the retry cap and the student's own questions, which are stored lecture questions with the ID from the config (`own`). C9 SHALL be able to finish only when at least one own question is stored. (FR-RDY-02, D14, D81)

#### Scenario: Own question required
- **GIVEN** stored lecture questions holding only drafted ones
- **WHEN** the lecture list is built
- **THEN** it lists them as drafted, has no own question, and says an own question is still needed

#### Scenario: Own question recorded
- **GIVEN** a stored lecture question with ID `own`, module C9 and the student's text
- **WHEN** the lecture list is built
- **THEN** it lists that text as the student's own and no longer says one is needed, and the learner-state validator accepts the stored question
