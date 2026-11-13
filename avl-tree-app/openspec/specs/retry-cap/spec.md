# retry-cap Specification

## Purpose
The cap of three attempts per check question, and what happens at the cap: no loop, a recorded lecture question, and a way on.

## Requirements

### Requirement: Three attempts per question
A check question SHALL allow at most `RETRY_CAP` (3) marked attempts. An answer reported as unreadable SHALL NOT count. After the third attempt that is not correct, Try again SHALL NOT be offered. The cap SHALL be read from the one config. (FR-SCA-03, D9)

#### Scenario: Two wrong answers can retry
- **WHEN** a question has two wrong attempts
- **THEN** Try again is offered

#### Scenario: The third wrong answer ends the question
- **WHEN** a question has three wrong attempts
- **THEN** Try again is not offered and Continue is

#### Scenario: Unreadable does not count
- **WHEN** a number question is submitted as `two` three times
- **THEN** the cap is not reached

### Requirement: The capped outcome
At the cap the app SHALL show "Not quite yet", the question's guided step-through ending with the answer, and a line "A question to take to the lecture" with the lecture question text, and SHALL offer Continue. The student SHALL always be able to reach the end of the check: there is no state without an exit. (FR-SCA-03)

#### Scenario: Capped screen
- **WHEN** the third wrong attempt is checked
- **THEN** the step-through is shown in full with the answer, the lecture question is shown, and Continue is offered

#### Scenario: Always a way on
- **WHEN** every question of a check is answered wrongly three times
- **THEN** each offers Continue, the last leads to the summary, and the student reaches the end of the check

### Requirement: A lecture question is recorded once
Reaching the cap SHALL record one lecture question for the item: the item ID, the misconception of the last wrong attempt if any, text built from one template on that misconception's catalogue label and the last problem's stem (only the stem when there is none), and the time. Reaching the cap again for the same item, by reload or revisit, SHALL NOT record a second. (FR-SCA-03, D19)

#### Scenario: Recorded
- **WHEN** an item is capped
- **THEN** the learner state holds one lecture question for it

#### Scenario: Not duplicated
- **WHEN** a capped item is shown again after a reload
- **THEN** the lecture questions are unchanged

#### Scenario: Wording rule
- **WHEN** the lecture-question text is built for every bank item and seeds 0 to 99
- **THEN** it types a formula, a sign's lean or a case name outside the conventions module, and every number is an instance fact

### Requirement: A capped item counts as finished
For completing a module, an item SHALL count as finished when it has a correct attempt or has reached the cap. A capped item SHALL NOT count as correct for its sub-skill, SHALL leave the suggested route as looking over the module again, and SHALL NOT be offered more attempts. (FR-LRN-05, D20, assumed)

#### Scenario: A module can complete with a capped item
- **GIVEN** every other C2 item answered correctly
- **WHEN** the last C2 item reaches the cap
- **THEN** C2 is completed

#### Scenario: Route after a cap
- **WHEN** the check ends with a capped item
- **THEN** looking over the module again is the suggested route
