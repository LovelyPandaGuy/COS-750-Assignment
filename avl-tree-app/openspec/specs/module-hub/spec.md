# module-hub Specification

## Purpose
Shows where the learner is on the nine-module path and lets them open any module or activity, with nothing locked.

## Requirements

### Requirement: Module screen
Each module ID `C1` to `C9` SHALL have a module screen at `/module/:moduleId` that is its lesson, played by the lesson player from its lesson file, with the lesson title as the level-1 heading. No module SHALL have an activity list. Next on a lesson's last screen SHALL open the next lesson, and after C9 the readiness report. Module titles everywhere SHALL come from the lesson files. (ID 7.1, ID 8.2, FR-LRN-05, FR-LRN-04, D159)

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
- **WHEN** Next is activated on the last screen of C3, then on the last screen of C9
- **THEN** the C4 lesson is shown, then the readiness report (there is no path page, D159)

#### Scenario: Moving does not change progress
- **WHEN** the learner opens modules, moves through lesson screens and goes back without answering
- **THEN** the learner state (current module, completed modules, attempts) is unchanged

### Requirement: Wording and targets
All text on these screens SHALL come from `src/content/screens.ts` and `src/content/modules.ts`. Links and buttons SHALL be at least 44 px high, and nothing SHALL be wider than a 360 px screen needs. The stylesheet SHALL use only token variables. (NFR-02, D3, FR-VIS-10)

#### Scenario: Content source
- **WHEN** the module screen components are read
- **THEN** their visible strings are imported from the content files

#### Scenario: Styles
- **WHEN** the existing style scan runs over `src/`
- **THEN** it passes with the new stylesheet, and the stylesheet gives links and buttons `min-height: var(--target-min)`

#### Scenario: Accessible
- **WHEN** a module screen is rendered
- **THEN** axe reports no violations

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
