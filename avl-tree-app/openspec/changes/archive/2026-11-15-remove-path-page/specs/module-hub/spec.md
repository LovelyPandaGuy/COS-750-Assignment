# Spec Delta

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Progress map
**Reason**: The path page is removed (user, 15 Nov); the Lessons sidebar shows every lesson and its state on every screen (D155).
**Migration**: `lesson-sidebar` "The sidebar lists the nine lessons" and "The sidebar marks progress and the page". The `ProgressMap` component stays in the gallery (`ui-progress`).

### Requirement: Hub screen
**Reason**: The path page is removed (user, 15 Nov, D159).
**Migration**: Lessons are opened from the sidebar; after a lesson, Next opens the next one; `/path` redirects to the current lesson.

### Requirement: Sandbox suggested after C2
**Reason**: The suggestion lived on the hub's Sandbox card, which goes with the hub (D160).
**Migration**: The sandbox stays one click away through the TopBar's "Sandbox" link on lessons C2 to C9 and the readiness page (D11).
