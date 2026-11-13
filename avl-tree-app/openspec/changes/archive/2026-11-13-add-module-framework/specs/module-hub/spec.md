# Spec Delta

## ADDED Requirements

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
