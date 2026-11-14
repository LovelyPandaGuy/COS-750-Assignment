# ui-progress Specification

## Purpose
Presentational components that show the student where they are, what comes next and how to move between lessons: the Start screen, the hub with its progress map, the lesson progress readout and the lesson menu. They render the states and words they are given and compute nothing.

## Requirements

### Requirement: Components show state and words they are given
Every component in `src/ui/progress/` SHALL take each lesson's state, the saved progress and every visible word as props. None SHALL import from `src/content/`, `src/state/` or `src/live/`, or decide whether a lesson is locked. (D18, proposal questions 2 and 12)

#### Scenario: No content or state imports
- **WHEN** the source files under `src/ui/progress/` are scanned
- **THEN** none imports from `src/content/`, `src/state/` or `src/live/`

#### Scenario: Only given words appear
- **WHEN** each component is rendered with fixture props
- **THEN** every visible text node is one of the fixture strings, or a module ID, number or symbol passed in

### Requirement: Start screen
StartView SHALL render the StartPanel (heading, intro, list and one primary start button), then the ResumeCard only when saved progress is given, then the PrivacyNotice, then the ResetProgressLink. The PrivacyNotice SHALL be visible text, not a link or a disclosure. (FR-ONB-01, FR-ONB-02, FR-ONB-03, NFR-05, D3, wireframe 1b notes 1 to 3)

#### Scenario: First visit
- **GIVEN** StartView with no saved progress
- **WHEN** it is rendered
- **THEN** there is no ResumeCard, exactly one primary button (the start button) and the privacy text is visible

#### Scenario: Returning
- **GIVEN** StartView with saved progress (resume line "Example: you stopped at C4" and label "Example resume")
- **WHEN** it is rendered and "Example resume" is activated
- **THEN** the ResumeCard shows the line, and `onResume` is called once

#### Scenario: Session length from the given intro
- **GIVEN** the fixture intro "About an hour, in nine short lessons you can stop and pick up again."
- **WHEN** StartView is rendered
- **THEN** that text is shown and the component adds no duration of its own

#### Scenario: No credential fields
- **WHEN** StartView is rendered in either state
- **THEN** it contains no input of type password or email and no field labelled for a name or account

### Requirement: Reset needs confirmation and says what is erased
ResetProgressLink SHALL show a link-styled button. Activating it SHALL open the ConfirmDialog with the given title and a body that names what will be erased. `onReset` SHALL be called only when the confirm button is activated. Cancel or Escape SHALL close the dialog without calling it and return focus to the link. (FR-ONB-04, wireframe 1b note 4)

#### Scenario: Confirm resets
- **WHEN** the link is activated and then the confirm button is activated
- **THEN** `onReset` is called once and the dialog closes

#### Scenario: Cancel and Escape do nothing
- **WHEN** the dialog is opened and closed with Cancel, then opened and closed with Escape
- **THEN** `onReset` is never called and focus is on the link after each close

#### Scenario: The dialog names what is erased
- **GIVEN** the body "Example: your answers and lecture questions will be removed. This can't be undone."
- **WHEN** the dialog is open
- **THEN** the dialog's accessible description is that body, and focus starts on Cancel

#### Scenario: The app's own wording names it too
- **WHEN** the existing start copy in `src/content/start.ts` is read
- **THEN** its dialog body names the answers and the lecture questions and says it cannot be undone

### Requirement: Lesson states are shown by word, symbol and border
ProgressMap and LessonMenu SHALL draw each lesson in its given state (`done`, `current`, `open` or `locked`) with the state's given word, a symbol in text and its own border style through `data-state` (solid, thick, dashed, dotted). Colour SHALL NOT be the only difference. The current lesson SHALL have `aria-current="step"`. A lesson marked optional SHALL show the given optional word. (FR-LRN-03, FR-VIS-10, wireframe 1e note 1, D25, proposal question 5)

#### Scenario: Each state has a word, symbol and border
- **GIVEN** a map with C1 and C2 done, C3 current, C4 open and C5 to C9 locked
- **WHEN** it is rendered
- **THEN** each item's text contains its state word and symbol, and the stylesheet gives the four `data-state` values four different border styles

#### Scenario: Greyscale
- **WHEN** the map is shown in the gallery with `filter: grayscale(1)`
- **THEN** the four states still differ by word and computed border style

#### Scenario: Optional lesson
- **GIVEN** C7 with `optional` and the word "Example optional"
- **WHEN** the map and the menu are rendered
- **THEN** both C7 items contain "Example optional"

#### Scenario: Either navigation rule
- **GIVEN** the same map rendered once with no lesson locked (D20's rule) and once with every lesson after the current one locked (ID 8.2's rule)
- **WHEN** both are rendered
- **THEN** each item's state is exactly the one given, and the component output differs only in those items

### Requirement: Done is neutral ink, apart from mastery
A done lesson's border, symbol and fill SHALL use neutral ink tokens, never a `--mastery-*` token. When a mastery state is given for a done lesson, the existing MasteryBadge SHALL appear beneath it as a separate element, with its word. (design system ProgressMap, quality bar 2)

#### Scenario: Stylesheet
- **WHEN** `src/ui/progress/progress.css` is scanned
- **THEN** no rule for a `data-state` uses a `--mastery-` token

#### Scenario: Badge is separate
- **GIVEN** C1 done with mastery `secure` and C2 done with no mastery
- **WHEN** the map is rendered
- **THEN** C1 has a MasteryBadge reading its word, C2 has none, and both done items have the same computed border colour

### Requirement: Locked lessons say why, in text
A locked lesson SHALL NOT navigate. In the map and the menu it SHALL stay focusable with `aria-disabled="true"`, show its given reason as visible text (for example "Opens when C3 is done") and expose that reason as its accessible description. The words "locked", "fail" and "wrong" SHALL NOT come from the component. (ID 8.2, FR-LRN-04, D27, proposal question 5)

#### Scenario: Reason announced
- **GIVEN** C5 locked with reason "Example: opens when C4 is done"
- **WHEN** C5's item is focused
- **THEN** its accessible description is "Example: opens when C4 is done" and the text is visible

#### Scenario: No navigation
- **WHEN** a locked item is clicked or Enter is pressed on it
- **THEN** the location does not change and no callback is called

#### Scenario: Calm markup
- **WHEN** the map and the menu are rendered with fixture words
- **THEN** their markup adds none of "locked", "fail" or "wrong"

### Requirement: Hub screen
HubView SHALL render the ProgressMap, then a UnitCard for the current lesson (ID, title, one-line goal, estimated time and state word), its ActivityList, and one primary action that opens the current lesson. Beside or below them it SHALL render the SandboxCard and the LectureQuestionsCard. It SHALL show no points, streaks or comparison. (FR-LRN-03, FR-LRN-05, FR-MOT-04, wireframe 1e notes 3 and 4)

#### Scenario: Contents
- **GIVEN** HubView with C4 current and fixture goal "Example goal" and time "Example about 6 min"
- **WHEN** it is rendered
- **THEN** the UnitCard names C4 with its title, goal and time, and exactly one element is styled as the primary button

#### Scenario: Activity list
- **GIVEN** phases "Problem" done, "Learn" next and "Check" to do
- **WHEN** the ActivityList is rendered
- **THEN** it is an ordered list in that order, each phase with its state word and border, with no reorder control

#### Scenario: Sandbox in every state
- **GIVEN** HubView rendered with the current lesson at each of C1 to C9, and with all lessons done
- **WHEN** each is rendered
- **THEN** the SandboxCard and its open link are present every time (D11)

#### Scenario: Sandbox suggestion
- **GIVEN** a SandboxCard with the optional suggestion line and one without
- **WHEN** both are rendered
- **THEN** only the first shows the line, and both have the open link

#### Scenario: Lecture questions
- **GIVEN** a LectureQuestionsCard with count 2 and the text "Example: 2 questions saved", and one with count 0 and "Example: none yet"
- **WHEN** both are rendered
- **THEN** each shows its text and a link to the list

#### Scenario: No scores
- **WHEN** HubView's markup is read
- **THEN** the component adds none of "score", "points", "streak", "rank", "grade", "pass" or "fail"

### Requirement: Lesson progress readout
LessonProgress SHALL show the given label as text and an outlined, `aria-hidden` bar filled to the given completed share of the total, fitting the TopBar `progress` slot (D117) at 390 px. [OPEN] The bar's FR ID (FR-LRN-03?); check the SE document. (ID 8.2, 8.3, 10.4, D117)

#### Scenario: Text and bar
- **GIVEN** label "Example lesson 4 of 9", 3 completed of 9
- **WHEN** it is rendered
- **THEN** the label text is visible, and the bar's fill is one third of its track with the track outlined

#### Scenario: Ends
- **WHEN** it is rendered with 0 and with 9 completed of 9
- **THEN** the fill is empty and full, and the label is still shown

### Requirement: Lesson menu
LessonMenu SHALL be a disclosure button (`aria-expanded`, `aria-controls`) whose panel lists every lesson with its state. Tab SHALL reach every item, Enter SHALL open a lesson that is not locked, and Escape or the button SHALL close the panel with focus on the button. On a phone the panel SHALL sit in the page flow at full width, not as a modal. (ID 8.2 "Lesson list", ID 11.2, FR-LRN-04, NFR-02, proposal question 4)

#### Scenario: Open and close by keyboard
- **WHEN** the button is focused and Enter is pressed, then Escape is pressed
- **THEN** the panel shows with `aria-expanded="true"`, then hides with `aria-expanded="false"` and focus on the button

#### Scenario: Every item reachable
- **GIVEN** an open menu with nine lessons, two of them locked
- **WHEN** Tab is pressed through the panel
- **THEN** focus visits all nine items in order, and the locked items announce their reasons

#### Scenario: Opening a lesson
- **WHEN** Enter is pressed on an open or done lesson
- **THEN** that lesson's link is followed (`href` from props) and the panel closes

#### Scenario: Phone placement
- **WHEN** the gallery's menu is opened at 390 px
- **THEN** the panel is as wide as the page content, below the button, and the page has no horizontal scroll

### Requirement: Progress components at three widths
The map SHALL be a vertical list below 1366 px and a horizontal row from 1366 px. Every link and button SHALL be at least 44 px in both dimensions and running text at least 16 px. There SHALL be no horizontal page scroll at 390, 768 and 1366 px, in light and dark. The stylesheet SHALL use only tokens and only the D118 media queries. axe SHALL report no violations. (NFR-02, D3, D118, quality bar 2, 4, 5 and 8)

#### Scenario: Map direction
- **WHEN** the gallery's progress section is shown at 390, 768 and 1366 px
- **THEN** the map's items stack vertically at 390 and 768 and sit in one row at 1366

#### Scenario: Fit and targets
- **WHEN** the gallery's progress section is shown at each width in each theme
- **THEN** the page does not scroll sideways, every target is at least 44 by 44 px, running text is at least 16 px, and the screenshots match the baselines

#### Scenario: Tokens and queries
- **WHEN** `npm run lint` runs
- **THEN** `progress.css` passes the token rule and the media-query allow-list

#### Scenario: Accessible
- **WHEN** StartView (both states, dialog open), HubView and LessonMenu (open) are rendered
- **THEN** axe reports no violations
