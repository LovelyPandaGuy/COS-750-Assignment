## MODIFIED Requirements

### Requirement: Finishing the check completes the lesson
When every question of a lesson's check is finished, the lesson SHALL be added to the completed modules and the current module SHALL become the first lesson, in manifest order (C1 to C9), that is not completed. When all nine are completed the current module SHALL stay as it was. C7 counts like any other lesson for this (D164). C7's check is optional (`optional: true`): it never blocks C8, and finishing it completes C7. A lesson SHALL NOT be completed any other way. (ID 7.1, ID 9.1, FR-LRN-05, D164)

#### Scenario: C3 completes
- **WHEN** both C3 check questions are finished
- **THEN** C3 is in the completed modules and the current module is C4

#### Scenario: Completed out of order
- **GIVEN** the current lesson C1 and no lesson completed
- **WHEN** C2 is completed, then C3
- **THEN** the current lesson is still C1

#### Scenario: Filling the gap skips completed lessons
- **GIVEN** the current lesson C1 and C2 and C3 completed
- **WHEN** C1 is completed
- **THEN** the current lesson is C4

#### Scenario: Current lesson moves back to the first gap
- **GIVEN** the current lesson C5 and C1 completed
- **WHEN** C2 is completed
- **THEN** the current lesson is C3

#### Scenario: Only C7 left
- **GIVEN** C1 to C6, C8 completed and the current lesson C7
- **WHEN** C9 is completed
- **THEN** the current lesson is C7

#### Scenario: All lessons done
- **GIVEN** C1 to C8 completed and the current lesson C9
- **WHEN** C9 is completed
- **THEN** all nine are completed and the current lesson is C9

#### Scenario: Reload keeps the check
- **GIVEN** the first C4 check question answered rightly
- **WHEN** the app reloads and the C4 check screen is shown
- **THEN** it starts at "Question 2 of 4"
