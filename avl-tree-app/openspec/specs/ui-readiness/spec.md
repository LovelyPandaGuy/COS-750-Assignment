# ui-readiness Specification

## Purpose
Presentational components of the readiness summary (frame 1o): where the student stands on each objective, what to review, and what to bring to the lecture, with print, copy and save. They render the results and words they are given and compute nothing.

## Requirements

### Requirement: Components show results and words they are given
Every component in `src/ui/readiness/` SHALL take each objective's result, notes, flags, questions and every visible word as props. None SHALL import from `src/content/`, `src/state/`, `src/live/` or `src/live_content/`, or work out a result. (D18, proposal questions 2, 6 and 7)

#### Scenario: No content, state or live imports
- **WHEN** the source files under `src/ui/readiness/` are scanned
- **THEN** none imports from `src/content/`, `src/state/`, `src/live/` or `src/live_content/`

#### Scenario: Only given words appear
- **WHEN** ReadinessSummary is rendered with fixture props and no mastery
- **THEN** every visible text node is a fixture string, an objective ID or a symbol passed in

### Requirement: Every objective row is complete
OutcomeStatusTable SHALL render one row per given objective with its ID and name, its Bloom level tags, its status, its change note when given, and a Review link to its lesson. An optional objective SHALL show the given optional word. (FR-RDY-01, ID 5.1, frame 1o)

#### Scenario: Seven rows
- **GIVEN** LO1 to LO7 with fixture names, levels, statuses, notes and lesson links, LO7 optional
- **WHEN** the table is rendered
- **THEN** there are seven rows in order, each with its name, level, status word, note and a "Example review" link to its lesson, and LO7 also shows "Example optional"

#### Scenario: Two levels
- **GIVEN** LO3 with the levels apply and understand
- **WHEN** the table is rendered
- **THEN** LO3 shows two level tags, each with its word

#### Scenario: A level the chip does not style
- **GIVEN** LO6 with the level evaluate and the word "Example evaluate"
- **WHEN** the table is rendered
- **THEN** LO6 shows "Example evaluate" as a plain outlined tag with no Bloom colour, and no error is thrown

#### Scenario: No note given
- **GIVEN** a row with no change note
- **WHEN** the table is rendered
- **THEN** the row shows no note text and adds none of its own

### Requirement: Status by word, symbol and border
Each status SHALL be Ready or Revise, shown with its given word, a text symbol and its own border style through `data-status` (solid for Ready, dotted for Revise), never colour alone. A given mastery state SHALL add the MasteryBadge as secondary detail. (D25, design principle 2, proposal question 3)

#### Scenario: Two statuses differ without colour
- **WHEN** the table with Ready and Revise rows is rendered
- **THEN** each status cell contains its word and symbol, and the stylesheet gives the two `data-status` values different border styles

#### Scenario: Greyscale
- **WHEN** the gallery's summary is shown with `filter: grayscale(1)`
- **THEN** Ready and Revise still differ by word and computed border style

#### Scenario: Optional badge
- **GIVEN** one row with mastery `developing` and one without
- **WHEN** the table is rendered
- **THEN** only the first shows a MasteryBadge, and both still show Ready or Revise

### Requirement: Headline follows the given overall result
ReadinessSummary's headline SHALL show the given overall result (Ready or Revise) with its given heading and line, and the title's words and message when given. It SHALL NOT derive the result from the rows, and SHALL NOT show a rank letter, a share or a percentage. (ID 9.1, 9.3, 10.4, D113, FR-MOT-04, proposal questions 2 and 6)

#### Scenario: Optional objective does not change Ready
- **GIVEN** overall Ready, and LO7 (optional) Revise with every other objective Ready
- **WHEN** the summary is rendered
- **THEN** the headline shows the Ready heading and line, and the LO7 row shows Revise with "Example optional"

#### Scenario: Revise overall
- **GIVEN** overall Revise
- **WHEN** the summary is rendered
- **THEN** the headline shows the Revise heading and line, worded calmly from props

#### Scenario: Title without rank
- **GIVEN** the title "Example title words", its message, and a rank "A" passed in the same title object
- **WHEN** the summary is rendered
- **THEN** the title words and message are shown and "A" alone appears nowhere as a rank

#### Scenario: No scores anywhere
- **WHEN** the summary's text is read
- **THEN** it contains no "%", digit-slash-digit score, and none of "score", "points", "rank", "grade", "pass" or "fail"

### Requirement: Confidence flags are calm
ConfidenceFlags SHALL list, under the given heading, one text flag per given objective: its ID, the given flag text and a link to look again. With no flags, it SHALL render nothing. (ID 9.2, frame 1o note 2, D27)

#### Scenario: Flags
- **GIVEN** flags for LO2 and LO4 with the text "Example: you were sure, worth a second look"
- **WHEN** the flags are rendered
- **THEN** two flags show their ID, text and link, each flag symbol is text, and nothing reads "wrong" or "fail"

#### Scenario: None
- **WHEN** ConfidenceFlags is rendered with no flags
- **THEN** it renders no element

### Requirement: Lecture questions can be edited, with an empty state
LectureQuestionsList SHALL list the given questions under its heading. A question marked editable SHALL offer Edit, which opens an inline labelled field with Save and Cancel. Save SHALL call `onEdit(id, text)` with the new text and Cancel SHALL keep the old text. A question marked removable SHALL offer Remove, calling `onRemove(id)`. With no questions it SHALL show the given empty text. (FR-RDY-02, D14, frame 1o note 3, proposal question 9)

#### Scenario: Edit and save
- **WHEN** Edit is activated on "Example question one", the text is changed to "Example new", and Save is activated
- **THEN** `onEdit` is called once with that question's ID and "Example new", and focus returns to its Edit button

#### Scenario: Cancel
- **WHEN** Edit is activated, the text is changed and Cancel is activated
- **THEN** `onEdit` is not called and the old text is shown

#### Scenario: Remove only where allowed
- **GIVEN** one removable question and one not
- **WHEN** the list is rendered
- **THEN** only the first has a Remove button, and activating it calls `onRemove` with its ID

#### Scenario: Empty state
- **GIVEN** no questions and the empty text "Example: nothing to bring this time"
- **WHEN** the list is rendered
- **THEN** that text is shown and there is no list

### Requirement: Listen-for points
ReadinessSummary SHALL show the given "what to listen for" heading and its points as a list. With no points, the block SHALL NOT render. (ID 7.2 C9, `c9.json` `listenFor`)

#### Scenario: Points
- **GIVEN** three fixture points
- **WHEN** the summary is rendered
- **THEN** the heading and the three points are shown in order

### Requirement: Export by print, copy and save, on the device
ExportActions SHALL offer Print, Copy and Save as a text file with browser APIs only. The text SHALL hold the headline, every row, flag, question and listen-for point. Copy and Save SHALL announce their result in a polite live region; on failure a read-only text area with the text SHALL appear instead. (FR-RDY-03, NFR-05, D14, proposal question 4)

#### Scenario: Text holds everything
- **WHEN** the export text is built from the fixture summary
- **THEN** it contains every row's ID, name and status word, every flag, every question and every point

#### Scenario: Copy announces success
- **GIVEN** a working clipboard
- **WHEN** Copy is activated
- **THEN** the clipboard receives the export text and the live region reads "Example copied"

#### Scenario: Save makes a text file
- **WHEN** Save is activated
- **THEN** a `text/plain` Blob with the export text is downloaded under the given file name, and the live region reads the given saved message

#### Scenario: Fallback
- **GIVEN** a clipboard that rejects
- **WHEN** Copy is activated
- **THEN** a read-only text area with the export text and the given instruction appears, and the live region reads the given fallback message

#### Scenario: Print
- **WHEN** Print is activated
- **THEN** `window.print` is called once

#### Scenario: No network
- **WHEN** Copy, Save and Print are activated
- **THEN** `fetch` and `XMLHttpRequest` are never called

### Requirement: Print view
The stylesheet SHALL have a `@media print` block that hides every control, prints black on white with system colours, sets body text to at least 12 pt, and keeps status as words and border styles. (FR-RDY-03, frame 1o note 4, proposal question 8)

#### Scenario: Print stylesheet
- **WHEN** `src/ui/readiness/readiness.css` is read
- **THEN** its print block hides buttons, the edit fields and the export actions, sets text and background with `CanvasText` and `Canvas`, and gives body text a size of at least 12 pt

#### Scenario: Printed page
- **WHEN** the gallery summary is emulated with print media at 1366 px
- **THEN** no button or text field is visible, and every status word is still visible

### Requirement: Summary at three widths
The table SHALL be stacked cards below 768 px and a table from 768 px. Every link, button and field SHALL be at least 44 px in both dimensions, and running text at least 16 px. There SHALL be no horizontal page scroll at 390, 768 and 1366 px, in light and dark. The stylesheet SHALL use only tokens and the D118 queries. Keyboard alone SHALL reach every action, and axe SHALL report no violations. (NFR-02, FR-VIS-10, D118, quality bar 2 to 8)

#### Scenario: Cards on a phone
- **WHEN** the gallery's summary is shown at 390 px
- **THEN** each objective is a card with its status, note and Review link inside it, and no table header row is visible

#### Scenario: Fit and targets
- **WHEN** the gallery's summary is shown at each width in each theme
- **THEN** the page does not scroll sideways, every target is at least 44 by 44 px, running text is at least 16 px, and the screenshots match the baselines

#### Scenario: Keyboard
- **WHEN** Tab is pressed through the summary
- **THEN** focus reaches every Review link, flag link, Edit, Remove, Print, Copy and Save in reading order

#### Scenario: Accessible
- **WHEN** ReadinessSummary is rendered with flags, questions, one question being edited, and the fallback shown
- **THEN** axe reports no violations
