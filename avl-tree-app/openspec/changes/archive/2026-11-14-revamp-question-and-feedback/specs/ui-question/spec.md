## ADDED Requirements

### Requirement: QuestionItem shows what it is given
`QuestionItem` SHALL render the stem of its `question` (the live `Question`, `src/live/types`), then a read-only `TreeView` from its optional `tree` prop (`TreeViewProps`), then the answer input: a radio group when the question has options, otherwise the value stepper, or the optional `editor` slot in its place (change A3). It SHALL render options in the order given and SHALL NOT shuffle, mark or compute anything. (FR-ASM-01, D128)

#### Scenario: Stem, tree and options in the given order
- **GIVEN** a choice question with stem "Example stem" and options "Option one" to "Option four", and `tree` props for a 3-node tree
- **WHEN** `QuestionItem` renders
- **THEN** the stem appears first, the tree is a read-only image named by the tree label, and the four options appear in exactly the order given

#### Scenario: The editor slot replaces the answer input
- **GIVEN** a tree question and an `editor` element with test id "editor-slot"
- **WHEN** `QuestionItem` renders
- **THEN** "editor-slot" is rendered and no radio group or stepper is

### Requirement: Question wording comes from props
Every word a learn component shows that is not from its question or data SHALL come from its `labels` prop. No file in `src/ui/learn/` SHALL import from `src/content/`. (D128)

#### Scenario: No content import and no hard-coded wording
- **WHEN** every source file under `src/ui/learn/` is read
- **THEN** none imports from `src/content/`, and rendering each component with fixture labels shows no text that is not in the question or the labels

### Requirement: Choice answers are a lettered radio group
A choice question (multiple choice and identify-the-case alike) SHALL render as a radio group named by `labels.choiceLegend`, each option a radio with a visible letter A, B, C and so on, in order. Arrow keys SHALL move the selection within the group (native radio behaviour), and pressing an option's letter SHALL select it while focus is inside the group and SHALL do nothing outside it. Selecting an option SHALL call `onResponse({ kind: 'option', id: option.id })`. (FR-ASM-01, FR-VIS-10)

#### Scenario: Pick by click, arrows and letter
- **GIVEN** a choice question with four options and no response
- **WHEN** the student clicks option B, presses ArrowDown, then presses "a"
- **THEN** `onResponse` is called with options B, C, then A in that order, and each option's accessible name starts with its letter

#### Scenario: Letters do nothing outside the group
- **WHEN** focus is on the stem's surrounding page and the student presses "b"
- **THEN** `onResponse` is not called

### Requirement: Compute-a-value answers are a stepper
A question without options SHALL render a minus button, the value as a spin button, and a plus button, named by `labels.decrease`, `labels.value` and `labels.increase`, with no free text entry. ArrowUp and ArrowDown on the value SHALL match plus and minus. Each change SHALL call `onResponse({ kind: 'values', values: [n] })` with the new value. [OPEN] Using it in module checks changes the `module-checks` text-field requirement in the wiring change. (FR-ASM-01, FR-VIS-10)

#### Scenario: Stepping within the range
- **GIVEN** a number question with `min` -3, `max` 3, `step` 1 and no response
- **WHEN** the student presses plus three times, then ArrowDown on the value once
- **THEN** `onResponse` receives the values 0, 1, 2, then 1, and there is no text input on the page

### Requirement: Stepper range
With a null response the stepper SHALL show `labels.empty`. The first press of either button SHALL go to the value nearest 0 within `[min, max]`; later presses SHALL move by `step`. Each button SHALL be disabled at its end of the range. (FR-ASM-01)

#### Scenario: Empty start
- **GIVEN** `min` 1, `max` 5 and no response
- **WHEN** the student presses minus
- **THEN** `onResponse` receives "+1"

#### Scenario: Ends of the range
- **GIVEN** the response value 3 with `max` 3
- **THEN** the plus button is disabled and the minus button is enabled

### Requirement: QuestionItem states
`QuestionItem` SHALL show default, hover, focus (shared ring), selected (thicker border), disabled (every input disabled while `disabled` is true) and submitted (`mark` given). When submitted, the chosen option SHALL carry `labels.yourAnswer`; on a correct mark it SHALL also have the correct style, and on a not-quite-yet mark a dashed border and a neutral bulb glyph, with no red and no cross. (FR-ASM-03, NFR-02, D27)

#### Scenario: Locked after submit
- **GIVEN** `disabled` true
- **THEN** every radio, stepper button and the spin button is disabled or read-only, and clicking them does not call `onResponse`

#### Scenario: Every state reachable in the gallery
- **WHEN** the learn gallery renders
- **THEN** it shows a QuestionItem in each of default, selected, disabled, submitted correct, submitted not quite yet and revealed at the cap, for both a choice and a value question, and the stylesheet has hover and focus rules for options and stepper buttons

### Requirement: Correct option revealed only at the cap
`QuestionItem` SHALL mark an option with `labels.correct` only when `revealCorrect` names it. The caller passes the engine's correct option ID (`engineAnswer`, never the content's typed `correctOptionId`, D95) only at the retry cap. A mark with verdict `partial` SHALL look like not quite yet. (FR-ASM-07, FR-SCA-03, D130)

#### Scenario: First miss does not reveal the answer
- **GIVEN** a choice question, the response option B (not correct), a not-quite-yet mark and no `revealCorrect`
- **THEN** option B carries "Your answer" and `data-state="not-yet"`, no option carries the correct label or `data-state="correct"`, and no element has a red token or a cross glyph

#### Scenario: At the cap the correct option is marked
- **GIVEN** the same props with `revealCorrect` set to option C's ID
- **THEN** the correct option carries the correct label and `data-state="correct"`, and option B still carries "Your answer"

### Requirement: Try again returns focus to the first input
When `disabled` changes from true to false, `QuestionItem` SHALL move focus to its first answer input (the first radio, or the stepper's minus button). It SHALL NOT take focus on its first render. (FR-VIS-10, NFR-02)

#### Scenario: Focus after Try again
- **GIVEN** a QuestionItem rendered with `disabled` true
- **WHEN** it re-renders with a new question and `disabled` false
- **THEN** the first radio has focus

#### Scenario: No focus on mount
- **WHEN** a QuestionItem first renders with `disabled` false
- **THEN** focus is not moved

### Requirement: ConfidenceRating levels
`ConfidenceRating` SHALL render a radio group named by `label`, with the optional note when given, and one radio per entry of `levels` in order, each named by its text and drawn with n bars of which its position (1 to n) are filled. [OPEN] Two stored levels or the design's three (proposal question 4). (FR-RDY-01, NFR-02, D89)

#### Scenario: Bars per level
- **GIVEN** two levels
- **THEN** the first shows 1 of 2 bars filled and the second 2 of 2

### Requirement: ConfidenceRating input
Arrow keys SHALL move between levels and selecting SHALL call `onChange(value)`. With `value` null no level SHALL be checked; with `disabled` every radio SHALL be disabled. (NFR-02, FR-VIS-10)

#### Scenario: Three levels by keyboard
- **GIVEN** levels "Level one", "Level two", "Level three" with values and `value` null
- **WHEN** the student tabs into the group and presses ArrowRight twice
- **THEN** `onChange` is called for the second then the third level, and the levels show 1, 2 and 3 filled bars

#### Scenario: Labels, not colour
- **WHEN** the rating renders in greyscale
- **THEN** each level is identified by its text label and bar count, and the checked level also has the selected border

### Requirement: Question components at three widths
At 390, 768 and 1366 px the learn gallery page SHALL have no horizontal scroll. Every radio row, stepper button and confidence level SHALL measure at least 44 by 44 CSS px. Stem, option and label text SHALL be at least 16 px. axe SHALL report no violations. Styles SHALL use tokens only (stylelint). (NFR-02, FR-VIS-10, D93)

#### Scenario: Visual check
- **WHEN** `tests/visual/learn.spec.ts` opens the gallery's learn section at each width
- **THEN** the page scroll width is at most the viewport width, the measured targets are at least 44 px, and the screenshot matches the baseline

#### Scenario: axe clean in every state
- **WHEN** each gallery state is rendered in the unit tests
- **THEN** axe reports no violations
