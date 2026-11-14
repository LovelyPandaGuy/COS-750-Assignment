# ui-feedback Specification

## Purpose
TBD - created by archiving change revamp-question-and-feedback. Update Purpose after archive.

## Requirements

### Requirement: FeedbackPanel has three variants with four parts
`src/ui/learn/FeedbackPanel` SHALL take a variant (`correct`, `not-yet`, `cap`, or none), a verdict, a why, a concept link (label and route) and a next step (label and action) as props. Each variant SHALL show, in order, a verdict heading, the why, the concept link and the next-step button, which is the only primary action. (FR-ASM-03, FR-SCA-03, D27, D129)

#### Scenario: Each variant shows four parts
- **GIVEN** each variant with verdict "Example verdict", why "Example why", concept "Example concept" and next step "Example next"
- **WHEN** it renders
- **THEN** a heading reads "Example verdict", then "Example why", then a link "Example concept" to the given route, then one primary button "Example next", in that DOM order

### Requirement: Feedback is calm
The panel SHALL use the feedback tokens and a neutral icon for its variant, and SHALL NOT use a red token, a cross glyph, or the words "wrong", "incorrect" or "fail" of its own. (D27, NFR-02)

#### Scenario: Calm styling
- **WHEN** the panel stylesheet and every variant's markup are read
- **THEN** they use only `--feedback-*` and other non-red tokens, contain no ✗, ✕ or ❌, and the variant is also named in text (the verdict), not by colour alone

### Requirement: The answer appears only at the cap
The `not-yet` variant SHALL NOT accept an answer: its props type has no answer field and no full-answer or lecture slot. Only the `cap` variant SHALL take `fullAnswer` (a `FullAnswer` element) and `lectureDraft` (a `LectureQuestionDraft` element) and render them after the why. The `correct` variant MAY take neither. (FR-SCA-03, D130)

#### Scenario: First miss
- **GIVEN** the `not-yet` variant
- **THEN** no FullAnswer and no lecture draft is rendered, and passing `fullAnswer` is a type error (checked by a `@ts-expect-error` test)

#### Scenario: Retry cap
- **GIVEN** the `cap` variant with a FullAnswer and a LectureQuestionDraft
- **THEN** both render inside the panel after the why, and there is no Try again button

### Requirement: Focus and announcement on feedback
The panel SHALL always render a polite live region (`role="status"`), empty while there is no variant, so later feedback is announced. When a variant is shown or changes, the live region SHALL hold the verdict and the why, and nothing else, and focus SHALL move to the verdict heading (`tabIndex=-1`). It SHALL NOT take focus on its first render, with or without a variant, so a page that opens with feedback shown does not steal focus. (NFR-02, FR-VIS-10)

#### Scenario: Submit moves focus and announces
- **GIVEN** a panel with no variant
- **WHEN** it re-renders with `not-yet`, verdict "Example verdict" and why "Example why"
- **THEN** the verdict heading has focus and the live region's text is "Example verdict. Example why"

#### Scenario: Keyboard only, end to end
- **GIVEN** the gallery's composed flow (QuestionItem, ConfidenceRating, a check button and FeedbackPanel)
- **WHEN** the student uses only Tab, arrows, letters, Space and Enter to answer, check, read the feedback, and press the next step
- **THEN** focus moves to the feedback heading after checking, the next-step button is reached by Tab, and Try again returns focus to the first input

### Requirement: FullAnswer
`FullAnswer` SHALL be a disclosure, collapsed by default: a button with `aria-expanded` named by `labels.show`, which reveals the worked example's answer (the option text, the signed number, or a read-only `TreeView` for a tree answer) and its explanation, all from the `example` prop. (FR-SCA-03)

#### Scenario: Collapsed then open
- **GIVEN** a worked example whose answer is "+2" with explanation "Example explanation"
- **THEN** the answer and explanation are hidden until the button is pressed, then shown, with `aria-expanded` true

### Requirement: LectureQuestionDraft
`LectureQuestionDraft` SHALL show a heading, a short note and an editable multi-line field holding `text`, named by `labels.field`, and two buttons: Add (primary) calling `onAdd` and No thanks (quiet) calling `onDecline`. Editing SHALL call `onChange(text)`. When `added` is true it SHALL show `labels.added` in a polite status and disable Add. It SHALL save nothing itself. (FR-SCA-03, FR-RDY-02)

#### Scenario: Edit and add
- **WHEN** the student types in the field and presses Add
- **THEN** `onChange` receives the edited text and `onAdd` is called once; nothing is written to storage

#### Scenario: Added
- **GIVEN** `added` true
- **THEN** the status shows the added label and Add is disabled

### Requirement: ScaffoldPanel shows rungs as given
`ScaffoldPanel` SHALL render the ordered `rungs` it is given, each with a kind (`nudge`, `fuller-hint`, `worked-example`, `guided`), a state (`open`, `seen`, `available`, `waiting`), a title and a body. Each rung SHALL show its number, its state word from `labels.state` and a border per state, and its body only when open. How many rungs and which kinds SHALL come from props. (FR-SCA-02, D21, D76, D131)

#### Scenario: Practice and check ladders from props
- **GIVEN** two rungs (nudge, fuller hint) for practice, and three rungs (fuller hint, worked example, guided) for a check
- **THEN** each panel shows exactly the rungs given, in order, with number, state word and border, and only open rungs show their body

#### Scenario: States without colour
- **WHEN** the panel renders in greyscale
- **THEN** every rung's state is readable from its word and border style: open thick, seen grey, available solid, waiting dashed

### Requirement: Hint button shows the hints left
`ScaffoldPanel` SHALL render a Hint button whose visible text includes the count `hintsLeft` as a numeral and whose accessible name is `labels.hint(hintsLeft)`. Pressing it SHALL call `onHint`. At 0 it SHALL stay in place, show 0, set `aria-disabled="true"` and not call `onHint`. (FR-VIS-10, D21, D23)

#### Scenario: Count on the button
- **GIVEN** `hintsLeft` 2 and `labels.hint` returning "Example hint, 2 left"
- **THEN** the button shows "2", its accessible name is "Example hint, 2 left", and pressing it calls `onHint`

#### Scenario: None left
- **GIVEN** `hintsLeft` 0
- **THEN** the button is still rendered with "0" and `aria-disabled="true"`, and pressing it does not call `onHint`

### Requirement: Feedback components at three widths
At 390, 768 and 1366 px the learn gallery's feedback section SHALL have no horizontal scroll, every button and link SHALL measure at least 44 by 44 CSS px, text SHALL be at least 16 px, axe SHALL report no violations in every variant and state, and styles SHALL use tokens only. (NFR-02, D93)

#### Scenario: Visual and axe
- **WHEN** the visual test and the unit tests render every variant and state
- **THEN** there is no horizontal scroll, targets are at least 44 px, screenshots match the baselines, and axe is clean

### Requirement: Feedback states are in the state matrix and meet the quality bar
Each state of FeedbackPanel, FullAnswer, LectureQuestionDraft, ScaffoldPanel and the Hint button SHALL have a state-matrix entry, and each entry SHALL pass the ui-foundation quality-bar requirements: three widths in light and dark, axe, the keyboard walk, the colour simulations and forced colours, targets and text size, reduced motion, and calm wording. (Quality bar 1 to 10, ui-quality-sweep)

#### Scenario: States listed
- **WHEN** the state-matrix manifest is read
- **THEN** it has an entry for each of these states: each FeedbackPanel variant, FullAnswer, LectureQuestionDraft empty and saved, ScaffoldPanel at each rung, the Hint button with hints left and with none

#### Scenario: Entries pass
- **WHEN** the matrix spec and the quality checks run on those entries
- **THEN** each has a matching baseline at 390, 768 and 1366 px in light and dark, and each quality-bar check passes or is recorded as a deferred finding in the change that deferred it
