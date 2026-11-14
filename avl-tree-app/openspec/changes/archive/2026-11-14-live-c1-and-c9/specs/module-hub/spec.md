# Spec Delta

## MODIFIED Requirements

### Requirement: Module screen
Each module ID `C1` to `C9` SHALL have a module screen at `/module/:moduleId` that is its lesson, played by the lesson player from its lesson file, with the lesson title as the level-1 heading. No module SHALL have an activity list. Module titles everywhere SHALL come from the lesson files. (ID 7.1, FR-LRN-05, FR-LRN-04)

#### Scenario: Known module
- **WHEN** the module screen for each of `C1` to `C9` is opened directly
- **THEN** its level-1 heading is that lesson's title from its lesson file

#### Scenario: Activities in default order
- **WHEN** the module screen for `C1` is shown
- **THEN** C1's first screen "Welcome" is shown, with "Lesson 1 of 9", and no activity list

#### Scenario: Module with other activities
- **WHEN** the module screen for `C9` is shown
- **THEN** C9's first screen is shown, with "Lesson 9 of 9", and no activity list

#### Scenario: Back to path
- **WHEN** Next is activated on the last screen of a lesson
- **THEN** the hub is shown

#### Scenario: Moving does not change progress
- **WHEN** the learner opens modules, moves through lesson screens and goes back without answering
- **THEN** the learner state (current module, completed modules, attempts) is unchanged

### Requirement: Hub screen
The hub at `/path` SHALL have the heading "Your path", the progress map, a card for the current module with a link to open it, and a Sandbox card with an "Open sandbox" link. It SHALL have one primary action, "Continue", to the current module's screen. It SHALL show no points, streaks or comparison. (wireframe 1e, FR-MOT-04, FR-VIS-08)

#### Scenario: Contents
- **GIVEN** the learner is at `C4`
- **WHEN** the hub is shown
- **THEN** the heading is "Your path", the card names "C4 Search (the algorithm)" and links to `/module/C4`, and "Open sandbox" links to `/sandbox`

#### Scenario: Continue
- **WHEN** "Continue" is activated
- **THEN** the module screen for the current module is shown

#### Scenario: One primary action
- **WHEN** the hub is shown
- **THEN** exactly one element is styled as the primary button

#### Scenario: No scores
- **WHEN** the hub text is read
- **THEN** it contains none of "score", "points", "streak", "rank", "grade", "pass" or "fail"
