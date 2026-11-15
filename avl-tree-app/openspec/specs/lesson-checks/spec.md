# lesson-checks Specification

## Purpose
Plays a lesson's check from `questions/checks.json` (one question per assessment criterion, one re-attempt each, a confidence rating with every answer) and completes the lesson when the check is finished.

## Requirements

### Requirement: The check screen plays the lesson's check
A `check` screen SHALL show the questions of its `checkId` one at a time, in `questionIds` order, with "Question n of m". Review and challenge questions SHALL NOT be shown here. (ID 9.1, `checks.json`)

#### Scenario: C4 check
- **WHEN** the check screen of C4 is shown
- **THEN** it shows "Question 1 of 4" and the stem of `chk4-01`

#### Scenario: One question per criterion
- **WHEN** the check screens of C2 to C8 are counted
- **THEN** they hold 2, 2, 4, 4, 4, 3 and 2 questions

### Requirement: One re-attempt per check question
A check question SHALL allow `attemptsPerQuestion` attempts (2). After a wrong first attempt, Try again SHALL be offered; after a wrong second attempt it SHALL NOT, and the question is finished. The question counts as right if either attempt is right. (ID 9.1)

#### Scenario: Second attempt right
- **WHEN** `chk2-01` is answered wrongly, then rightly
- **THEN** two attempts are stored, numbered 1 and 2, and the question counts as right

#### Scenario: No third attempt
- **WHEN** `chk2-01` is answered wrongly twice
- **THEN** no Try again is offered, the feedback adds `conventions.feedback.afterReattempt`, and Next moves on

### Requirement: Confidence with every check answer
Check answer SHALL be enabled only when an answer and a confidence, "Sure" or "Not sure" (`conventions.labels.confidence`), are both given. The confidence SHALL be stored with the attempt. (ID 9.2)

#### Scenario: Confidence required
- **WHEN** an option of `chk2-01` is chosen without a confidence
- **THEN** Check answer is disabled until Sure or Not sure is chosen

### Requirement: A check is never skipped
On a check screen, Next SHALL move to the next question only when the current one is finished, and to the next screen only when every question is finished. There SHALL be no Skip ahead. Back SHALL stay free and keep stored attempts. (ID 8.2, D20)

#### Scenario: Next waits
- **WHEN** the first question of the C3 check is shown unanswered
- **THEN** Next is disabled

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
