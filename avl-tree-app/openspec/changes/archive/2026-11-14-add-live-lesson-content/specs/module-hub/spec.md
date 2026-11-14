# Spec Delta

## MODIFIED Requirements

### Requirement: Module screen
Each module ID `C1` to `C9` SHALL have a module screen at `/module/:moduleId`. For `C2` to `C8` the module screen SHALL be the lesson itself, played by the lesson player, with the lesson title from its lesson file as the level-1 heading. For `C1` and `C9` it SHALL keep its heading, its activities as links in default order, each saying its place ("1 of 2"), and a "Back to path" link. Module titles everywhere (map, module screen, resume card, breadcrumb) SHALL come from the lesson files. (ID 7.1, FR-LRN-05, FR-LRN-04, SE §6.5; supersedes D1's titles)

#### Scenario: Known module
- **WHEN** the module screen for each of `C1` to `C9` is opened directly
- **THEN** its level-1 heading contains that lesson's title from its lesson file (for example "Search (the algorithm)" for C4)

#### Scenario: A lesson module opens the lesson
- **WHEN** the module screen for `C5` is opened
- **THEN** the first screen of the C5 lesson is shown, with "Lesson 5 of 9", and no activity list

#### Scenario: Activities in default order
- **WHEN** the module screen for `C1` is shown
- **THEN** it lists Warm-up check and BST refresher as links, in that order, to `/module/C1/check` and `/module/C1/refresher`

#### Scenario: Module with other activities
- **WHEN** the module screens for `C9` and `C2` are shown
- **THEN** `C9` lists one check, and `C2` shows its lesson with no activity list

#### Scenario: Back to path
- **WHEN** "Back to path" is activated on the C1 module screen, or Next on the last screen of a lesson
- **THEN** the hub is shown

#### Scenario: Moving does not change progress
- **WHEN** the learner opens modules, moves through lesson screens and goes back
- **THEN** the learner state (current module, completed modules, attempts) is unchanged

### Requirement: Hub screen
The hub at `/path` SHALL have the heading "Your path", the progress map, a card for the current module with a link to open it (and, for C1 and C9, its activity list), and a Sandbox card with an "Open sandbox" link. It SHALL have one primary action, "Continue", to the current module's screen. It SHALL show no points, streaks or comparison. (wireframe 1e, FR-MOT-04, FR-VIS-08)

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

### Requirement: Soft prerequisite note on the module screen
When the entry decision names a prerequisite, the module screen SHALL show a note naming the prerequisite's module ID and lesson title with a link to its module screen: below the level-1 heading and above the activities for C1 and C9, and below the lesson's top region and above its first screen for C2 to C8. The note SHALL NOT disable, hide or reorder anything, and SHALL NOT use "locked", "must", "fail", "wrong" or a warning colour as its only signal. With no prerequisite named, no note SHALL show. Its wording SHALL come from the content files. (D20, FR-LRN-04, D27)

#### Scenario: Early entry shows the note
- **GIVEN** a fresh learner state
- **WHEN** the C3 module screen is shown
- **THEN** a note names "C2 When BSTs go lopsided" and links to `/module/C2`
- **AND** the lesson's first screen and its Next button are present and enabled

#### Scenario: Prerequisite done hides the note
- **GIVEN** a learner whose completed modules include C2
- **WHEN** the C3 module screen is shown
- **THEN** no prerequisite note is present

#### Scenario: C1 has no note
- **WHEN** the C1 module screen is shown for a fresh learner
- **THEN** no prerequisite note is present

#### Scenario: C8 skips the optional module
- **GIVEN** a learner whose completed modules are C1 to C6
- **WHEN** the C8 module screen is shown
- **THEN** no prerequisite note is present

#### Scenario: Following the note
- **WHEN** the note's link is activated on the C3 module screen
- **THEN** the C2 module screen is shown and the learner state is unchanged

#### Scenario: Calm wording
- **WHEN** the note text is read
- **THEN** it contains none of "locked", "must", "fail" or "wrong"

#### Scenario: Accessible note
- **WHEN** the C3 module screen with its note is rendered
- **THEN** axe reports no violations and the note's link is at least 44 px high
