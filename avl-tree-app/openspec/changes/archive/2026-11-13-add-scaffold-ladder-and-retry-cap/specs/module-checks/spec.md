# module-checks Delta

## MODIFIED Requirements

### Requirement: Retries are new variants
Try again SHALL show the next attempt of the same item, a new problem with options reshuffled. Try again SHALL be offered after a wrong answer until the retry cap is reached, and not after. (FR-ASM-07, FR-SCA-03, D9)

#### Scenario: New problem
- **WHEN** a wrong answer is followed by Try again
- **THEN** the stem or options differ from the previous attempt

#### Scenario: No retry at the cap
- **WHEN** the third wrong answer is checked
- **THEN** Try again is not shown

### Requirement: A module completes through its check
A module SHALL be added to the completed modules when every required item of its check is finished: it has an attempt marked correct, or it has reached the retry cap. C7's items SHALL be optional: leaving them unanswered SHALL NOT block the next module, but finishing them all SHALL complete C7. A module SHALL NOT be completed by any other route, including "I know this, skip". (FR-LRN-05, FR-SCA-03, FR-SCA-05, D4, D20)

#### Scenario: Complete on the last right answer
- **GIVEN** the C2 items, all required
- **WHEN** the last is answered correctly
- **THEN** C2 is in the completed modules, and `currentModule` is C3 if it was C2

#### Scenario: Complete on the last capped item
- **GIVEN** every other C2 item answered correctly
- **WHEN** the last reaches the retry cap
- **THEN** C2 is in the completed modules

#### Scenario: One right is not enough
- **WHEN** only some of the C2 items are finished
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
