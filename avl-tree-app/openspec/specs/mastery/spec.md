# mastery Specification

## Purpose
The mastery threshold per sub-skill and the status stored from it, which routing and the readiness summary read.

## Requirements

### Requirement: One threshold
The mastery threshold SHALL be two configuration values: the window of recent attempts (3) and the number correct (2). Both SHALL live in the one config and nowhere else. (FR-SCA-01, provisional)

#### Scenario: One place
- **WHEN** the source is scanned
- **THEN** the threshold numbers appear only in the config module

### Requirement: Status from recent attempts
A sub-skill's status SHALL be computed from its most recent attempts, up to the window, taken in the order stored across all of that sub-skill's items. With no attempts it SHALL have no status. Otherwise it SHALL be "secure" when the number correct reaches the smaller of the threshold and the number of attempts, "developing" when at least one is correct but it is not secure, and "not yet" when none is correct. (FR-SCA-01, D8)

#### Scenario: Table
- **WHEN** the recent attempts, oldest first, are right; wrong, right; wrong, right, right; wrong, wrong, wrong; right, wrong
- **THEN** the statuses are secure; developing; secure; not yet; developing

#### Scenario: Window
- **WHEN** the attempts are wrong, wrong, right, right
- **THEN** the status is secure, because only the last three count

#### Scenario: No attempts
- **WHEN** a sub-skill has no attempts
- **THEN** it has no status

### Requirement: Status is stored after each attempt
Recording an attempt at a bank item SHALL update the stored status of that item's sub-skill, and only that sub-skill. The status SHALL survive a reload. (D8, FR-SCA-01)

#### Scenario: Updated and saved
- **WHEN** an attempt at a C2 item is recorded
- **THEN** the learner state's status for that item's sub-skill is the computed one, other sub-skills are unchanged, and a reload restores it

#### Scenario: Reset clears it
- **WHEN** the learner resets
- **THEN** no sub-skill has a status
