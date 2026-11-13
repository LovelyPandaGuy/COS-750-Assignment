# module-hub Specification

## Purpose
Shows where the learner is on the nine-module path and lets them open any module or activity, with nothing locked.

## Requirements

### Requirement: Progress map
The progress map SHALL list modules C1 to C9 in order, each as a link to its module screen showing the module ID and D1 title. Each SHALL have a status from the learner state: Done if it is in the completed modules, You are here if it is the current module, Up next for the first module after the current one, and Later for the rest. The status SHALL be a symbol, a word and a border style (solid for Done, thick for You are here, dashed for the rest), never colour alone. C7 SHALL carry the word "Optional". A last item SHALL link to the readiness summary. (FR-LRN-03, D1, D4, wireframe 1e note 1, design principle 2)

#### Scenario: Return visit
- **GIVEN** the learner is at `C4` with `C1` to `C3` completed
- **WHEN** the hub is shown
- **THEN** the map has nine module links in order C1 to C9, `C1` to `C3` read Done, `C4` reads You are here, `C5` reads Up next and `C6` to `C9` read Later

#### Scenario: Fresh learner
- **GIVEN** a fresh learner state
- **WHEN** the hub is shown
- **THEN** `C1` reads You are here, `C2` reads Up next and the rest Later

#### Scenario: Not colour alone
- **WHEN** the map is rendered
- **THEN** every item has a status word and symbol in its text, and its `data-status` drives a different border style per status in the stylesheet

#### Scenario: Current position
- **WHEN** the map is rendered
- **THEN** the current item has `aria-current="step"` and the list is a labelled navigation landmark

#### Scenario: Optional module and summary link
- **WHEN** the map is rendered
- **THEN** the `C7` item contains "Optional" and the last item links to `/readiness`

#### Scenario: Nothing is locked
- **WHEN** the map is rendered for a fresh learner
- **THEN** every module link is enabled and navigates to its module screen

#### Scenario: Statuses come from state
- **GIVEN** a learner whose completed modules do not include `C2` but who is at `C5`
- **WHEN** the map is rendered
- **THEN** `C2` reads Later and not Done, because the map shows only what the state says

### Requirement: Hub screen
The hub at `/path` SHALL have the heading "Your path", the progress map, a card for the current module with a link to open it and its activity list, and a Sandbox card with an "Open sandbox" link. It SHALL have one primary action, "Continue", to the current module's screen. It SHALL show no points, streaks or comparison. (wireframe 1e, FR-MOT-04, FR-VIS-08)

#### Scenario: Contents
- **GIVEN** the learner is at `C4`
- **WHEN** the hub is shown
- **THEN** the heading is "Your path", the card names "C4 Search" and lists its activities as links, and "Open sandbox" links to `/sandbox`

#### Scenario: Continue
- **WHEN** "Continue" is activated
- **THEN** the module screen for the current module is shown

#### Scenario: One primary action
- **WHEN** the hub is shown
- **THEN** exactly one element is styled as the primary button

#### Scenario: No scores
- **WHEN** the hub text is read
- **THEN** it contains none of "score", "points", "streak", "rank", "grade", "pass" or "fail"

### Requirement: Module screen
Each module ID `C1` to `C9` SHALL have a module screen at `/module/:moduleId` whose level-1 heading is the module ID and D1 title, with the module's activities as links in default order, each saying its place ("1 of 3"), and a "Back to path" link. It SHALL show no learning content yet. (D1, FR-LRN-05, FR-LRN-04, SE §6.5)

#### Scenario: Known module
- **WHEN** the module screen for each of `C1` to `C9` is opened directly
- **THEN** its level-1 heading is that module's ID and D1 title

#### Scenario: Activities in default order
- **WHEN** the module screen for `C5` is shown
- **THEN** it lists Explore, Worked example and Check as links, in that order, to `/module/C5/explore`, `/module/C5/example` and `/module/C5/check`

#### Scenario: Module with other activities
- **WHEN** the module screens for `C1` and `C9` are shown
- **THEN** `C1` lists Warm-up check and BST refresher, and `C9` lists one check

#### Scenario: Back to path
- **WHEN** "Back to path" is activated
- **THEN** the hub is shown

#### Scenario: Moving does not change progress
- **WHEN** the learner opens modules and activities and goes back
- **THEN** the learner state (current module, completed modules, attempts) is unchanged

### Requirement: Wording and targets
All text on these screens SHALL come from `src/content/screens.ts` and `src/content/modules.ts`. Links and buttons SHALL be at least 44 px high, and nothing SHALL be wider than a 360 px screen needs. The stylesheet SHALL use only token variables. (NFR-02, D3, FR-VIS-10)

#### Scenario: Content source
- **WHEN** the hub, map and module components are read
- **THEN** their visible strings are imported from the content files

#### Scenario: Styles
- **WHEN** the existing style scan runs over `src/`
- **THEN** it passes with the new stylesheet, and the stylesheet gives links and buttons `min-height: var(--target-min)`

#### Scenario: Accessible
- **WHEN** the hub and a module screen are rendered
- **THEN** axe reports no violations

### Requirement: Soft prerequisite note on the module screen
When the entry decision names a prerequisite, the module screen SHALL show a note, below the level-1 heading and above the activities, naming the prerequisite's module ID and D1 title with a link to its module screen. The note SHALL NOT disable, hide or reorder the activities, and SHALL NOT use "locked", "must", "fail", "wrong" or a warning colour as its only signal. With no prerequisite named, no note SHALL show. Its wording SHALL come from the content files. (D20, FR-LRN-04, D27)

#### Scenario: Early entry shows the note
- **GIVEN** a fresh learner state
- **WHEN** the C3 module screen is shown
- **THEN** a note names "C2 When BSTs go lopsided" and links to `/module/C2`
- **AND** the Explore, Worked example and Check links are present and enabled

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
