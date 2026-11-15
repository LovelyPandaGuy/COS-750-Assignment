## MODIFIED Requirements

### Requirement: The sidebar marks progress and the page
Each lesson SHALL show its state in a word and a symbol, not colour alone: "Done" for a completed lesson, "Up next" for the learner's current lesson, otherwise "Not started". The link of the lesson being viewed SHALL carry `aria-current="page"` and SHALL be the one lesson drawn with the strong highlight (a thick border in the primary action colour and its tint), with its title also bold and underlined so the highlight is not colour alone. The current lesson, when it is not the one being viewed, SHALL keep its word and symbol and SHALL NOT have the strong highlight. (ID 8.2, ID 8.3, ID 11.1, D155, D164)

#### Scenario: States in words
- **GIVEN** C1 and C2 completed and the current lesson C3
- **WHEN** `/module/C4` is shown
- **THEN** C1 and C2 read "Done", C3 reads "Up next", C4 to C9 read "Not started", and no link reads "You are here"

#### Scenario: Page marked
- **WHEN** `/module/C5` is shown
- **THEN** only C5's link has `aria-current="page"`, and on `/sandbox` no link has it

#### Scenario: The viewed lesson is highlighted, not the current one
- **GIVEN** no lesson completed and the current lesson C1
- **WHEN** `/module/C3` is shown
- **THEN** C3's link has `aria-current="page"`, C1's link has `aria-current="step"` and reads "Up next", and C1's link does not have `aria-current="page"`

#### Scenario: Strong highlight follows the page
- **WHEN** the sidebar stylesheet is read
- **THEN** a rule for `.lesson-sidebar .progress-item[aria-current='page']` sets a border using `var(--action-primary)` and a background of `var(--action-primary-tint)`, and its title is bold and underlined

#### Scenario: Current lesson not filled when elsewhere
- **WHEN** the sidebar stylesheet is read
- **THEN** a rule for `.lesson-sidebar .progress-item[data-state='current']:not([aria-current='page'])` sets a border width of `2px` and a background that is not `var(--action-primary-tint)`

#### Scenario: Highlight moves when another lesson is opened
- **GIVEN** the current lesson C1 and `/module/C1` shown
- **WHEN** C4's sidebar link is followed
- **THEN** C4's link has `aria-current="page"` and C1's link no longer does
