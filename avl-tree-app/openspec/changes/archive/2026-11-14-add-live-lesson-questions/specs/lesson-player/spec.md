# Spec Delta

## REMOVED Requirements

### Requirement: Interactive screens wait for the questions change
**Reason**: The interactive screens now ask their questions (`lesson-questions`) and the check screen plays the lesson's check (`lesson-checks`).
**Migration**: See `lesson-questions` "Interactive screens ask their question" and `lesson-checks` "The check screen plays the lesson's check".

## ADDED Requirements

### Requirement: Hint follows the screen's question
The Hint control SHALL be offered on any screen whose question (or check question) has a `hint`, and SHALL open that static hint in the hint region. Opening it SHALL count as one hint used for the current question. (ID 9.4)

#### Scenario: Hint on a practice screen
- **WHEN** Hint is activated on `c3-s09`
- **THEN** "This checks heights and balance factors: …" is shown, and the next stored attempt for `c3-s09-task` has `hintsUsed` 1
