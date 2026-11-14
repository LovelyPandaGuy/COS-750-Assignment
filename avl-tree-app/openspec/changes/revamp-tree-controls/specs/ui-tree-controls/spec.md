## ADDED Requirements

### Requirement: Caption under the tree
The replay SHALL show a caption directly below the tree. It SHALL hold the sentence for the current position (at most two sentences) and, for a search, "Nodes visited: n". The caption SHALL be the replay's only polite live region that holds text, and SHALL update on every position change. The tree view's own live region SHALL stay empty, because the replay passes no `announce`. The tree and the caption SHALL be shown whatever representations are switched off. Together they satisfy FR-LRN-02. The caption SHALL use `--type-body` and the `--reading-column` width (66ch). (D22, D23, FR-LRN-02, FR-VIS-07, FR-VIS-11, screen 1f)

#### Scenario: Caption follows the tree (FR-VIS-07)
- **GIVEN** the 9-step insert of 10 into 30 with left child 20
- **WHEN** the student steps to position 8
- **THEN** the element directly after the tree region in DOM order is the caption, and it names node 30, balance factor +2 and the taller child 20

#### Scenario: One live region (D23)
- **WHEN** the replay is rendered with every representation shown
- **THEN** the caption has `role="status"` and `aria-live="polite"`
- **AND** every other `aria-live` element inside the replay (the tree view's own region) has no text, before and after a Step

#### Scenario: Search count in the caption (FR-VIS-11)
- **GIVEN** a search replay of 30 in the tree 20 with children 10 and 30
- **WHEN** the replay is at position 3
- **THEN** the caption contains "Nodes visited: " followed by the engine's visited count at that position

#### Scenario: Floor never hidden (FR-LRN-02)
- **GIVEN** a replay with representations whose primary is `animation`
- **WHEN** Text and Pseudocode are unticked
- **THEN** the tree and the caption are still shown and the caption still updates on Step

### Requirement: Replay control strip
`StepControls` SHALL be one strip directly below the caption with two named groups:
- **replay navigation**: Back, Play or Pause, Step, Replay;
- **progress and speed**: "Step p / n", the progress bar and Speed.

The strip SHALL wrap to the width it is given, with the navigation group first and no horizontal scroll at 390, 768 or 1366 px (on module pages the replay is at most `--reading-column` wide, so the groups wrap at every width; review C1, assumed). Replay SHALL return to position 0 and start playing. It SHALL be disabled at position 0 when not playing and while the replay is held. Learning aids (Show the rule, Hint) SHALL stay in the module control strip and SHALL NOT appear in the replay strip. (D23, FR-VIS-03, FR-VIS-10, screen 1f note 2)

#### Scenario: Two groups in order (D23)
- **WHEN** the controls are rendered
- **THEN** there are two groups with accessible names, the first holding Back, Play, Step and Replay in that order, the second holding the counter, the progress bar and the speed buttons

#### Scenario: Wraps, navigation first (D23, review C1)
- **WHEN** the replay stylesheet is read
- **THEN** `.replay-controls` wraps (`flex-wrap: wrap`), and in DOM order the navigation group comes before the progress and speed group

#### Scenario: Replay restarts (FR-VIS-03)
- **GIVEN** a 9-step trace at position 5, paused, at 1×, with fake timers
- **WHEN** Replay is pressed
- **THEN** the position is 0 and the control reads Pause
- **AND WHEN** 1200 ms pass **THEN** the position is 1

#### Scenario: Replay disabled (FR-VIS-03)
- **WHEN** the replay is at position 0 and paused, or is held for a prediction
- **THEN** Replay is disabled

#### Scenario: No learning aids in the replay strip (D23)
- **WHEN** the replay is rendered inside a module step
- **THEN** no "Show the rule" or "Hint" button is inside the replay's controls group

### Requirement: Focus is never lost in the strip
When a control in the replay strip has focus and becomes disabled (Back at position 0, Step at position n or at the end of playback, Replay at position 0 while paused, Play, Step or Replay when the replay is held), focus SHALL move to the next enabled button in the strip, in DOM order, or to the previous enabled one when none follows. Buttons keep the native `disabled` attribute. (WCAG 2.4.3, NFR-02, FR-VIS-03, review C4)

#### Scenario: Back at the start (review C4)
- **GIVEN** the replay is at position 1 and Back has focus
- **WHEN** the student presses Back
- **THEN** the position is 0, Back is disabled, and focus is on Play

#### Scenario: Step at the end (review C4)
- **GIVEN** the replay is at position n − 1 and Step has focus
- **WHEN** the student presses Step
- **THEN** the position is n, Step is disabled, and focus is on Replay

#### Scenario: Playback reaches the end (review C4)
- **GIVEN** Step has focus and the replay is playing at 1×, with fake timers
- **WHEN** playback reaches position n
- **THEN** Step is disabled and focus is on Replay

#### Scenario: Focus elsewhere is left alone (review C4)
- **GIVEN** focus is on a button outside the replay
- **WHEN** a replay control becomes disabled
- **THEN** focus stays on that outside button

### Requirement: Step timing
One step SHALL last `replayCopy.baseMs` (1200 ms) at 1×, twice that at 0.5× and half at 2×. "[" and "]" SHALL move one speed slower or faster and SHALL stop at the ends. (D29, FR-VIS-03)

#### Scenario: Speed ends (D29)
- **GIVEN** 0.5× is selected and focus is in the player
- **WHEN** "[" is pressed
- **THEN** 0.5× stays selected
- **AND WHEN** "]" is pressed three times **THEN** 2× is selected

### Requirement: Stable steps in the replay
The replay SHALL pass `slots` to the tree view: the in-order keys of the trace's final tree. For an insert, every key SHALL keep the same x at every position where it is present. The replay SHALL pass `transitionMs` equal to the smaller of `TREE_TRANSITION_MS` and half the current step duration, so nodes slide between positions and settle before the next tick. Under `prefers-reduced-motion` every step SHALL snap. Step back SHALL show exactly the previous tree. (A1 follow-up, D29, D32, NFR-03 [OPEN: confirm the ID], quality bar 9)

#### Scenario: Keys keep their x (FR-VIS-01)
- **GIVEN** any insert trace from the property generator (fast-check, trees of up to 15 keys)
- **WHEN** the replay is drawn at every position from 0 to n after the transition settles
- **THEN** each key's x is the same at every position where that key is drawn

#### Scenario: Rotation moves nodes vertically only (FR-VIS-01)
- **GIVEN** an insert trace with a rotation step at position r
- **WHEN** the replay steps from r − 1 to r
- **THEN** no drawn key changes x, and at least one changes y

#### Scenario: Transition capped by speed (NFR-03)
- **WHEN** the replay is rendered at 0.5×, 1× and 2×
- **THEN** the tree view receives `transitionMs` of 300 at each speed (300 ≤ 1200 / 2 / 2)

#### Scenario: Steps snap under reduced motion (quality bar 9)
- **GIVEN** `matchMedia('(prefers-reduced-motion: reduce)')` matches, with fake timers and a stubbed `requestAnimationFrame`
- **WHEN** the student steps forward
- **THEN** every node is at its final position in the same frame, and the replay stylesheet declares no `transition` or `animation`

#### Scenario: Back restores the previous tree (FR-VIS-03)
- **GIVEN** any insert trace and any position p from 1 to n
- **WHEN** the student steps to p and presses Back
- **THEN** the drawn keys, heights and balance factors equal those drawn at p − 1

### Requirement: Representation switcher
The `RepresentationSwitcher` SHALL show a group named "Show" with native checkboxes for Diagram, Text and Pseudocode:
- the box of the step's primary representation SHALL be checked and disabled, with the visible word "main" (Diagram when the primary is `animation`);
- the other boxes SHALL start checked when they are in the step's defaults and toggle on demand;
- it SHALL NOT show a Read aloud box (D26);
- its wording SHALL present the boxes as choices and SHALL NOT mention learning styles.

When given `mode`, it SHALL also show a group named "Mode" with two native radio inputs, Watch and Do it yourself, and when given `task`, that text. (D22, D26, FR-LRN-02, FR-VIS-06, INDEX item 11, screens 1f and 1h)

#### Scenario: Defaults from the step (D22)
- **GIVEN** representations `{ primary: 'animation', supporting: ['text'] }`
- **WHEN** the replay is rendered
- **THEN** Diagram is checked and disabled with the word "main", Text is checked, and Pseudocode is unchecked and the pseudocode panel is not rendered

#### Scenario: On demand (FR-LRN-02)
- **WHEN** the student ticks Pseudocode
- **THEN** the pseudocode panel appears with the current line highlighted, and unticking it removes the panel without changing the position

#### Scenario: New operation resets the boxes (D22)
- **GIVEN** the student has ticked Pseudocode
- **WHEN** the operation changes
- **THEN** the boxes return to the step's defaults

#### Scenario: No switcher without representations (compatibility)
- **WHEN** `ReplayPlayer` is rendered without `representations` or `shown`
- **THEN** no "Show" group is rendered and the tree, caption, controls, pseudocode panel and text are all shown

#### Scenario: Controlled by an outer host (FR-VIS-06)
- **WHEN** `ReplayPlayer` is rendered with `shown={['diagram']}`
- **THEN** it renders no switcher of its own and shows neither the pseudocode panel nor the whole-tree text

#### Scenario: Mode in the same bar (screen 1h)
- **GIVEN** the switcher with `mode={{ value: 'do', onChange }}` and a task text
- **THEN** a "Mode" group shows Watch and Do it yourself as radios with Do it yourself checked, the task text is shown, and choosing Watch calls `onChange('watch')`

#### Scenario: Read aloud hidden (D26)
- **WHEN** the switcher is rendered
- **THEN** it contains no control whose name contains "Read aloud"

#### Scenario: Choices, not styles (D22)
- **WHEN** the switcher's text and accessible names are read
- **THEN** none contains "learning style", "learner type", "visual learner" or "auditory"

### Requirement: Text representation
When Text is shown, the replay SHALL show a visible paragraph headed "The whole tree" below the controls. It SHALL hold the tree view's description (`describeTree`) of the tree at the current position. It SHALL NOT be a live region and SHALL NOT be a disclosure. The tree view's own "Describe tree" button is unchanged and stays the on-demand control. (FR-VIS-07, screen 1f note 4, D105)

#### Scenario: Description follows the step (FR-VIS-07)
- **GIVEN** Text is shown and the replay is at position 8 of the insert of 10 into 30 with left child 20
- **THEN** the paragraph under "The whole tree" is visible without any click, its text equals `describeTree` of the tree at position 8 with the roles at position 8, and it has no `aria-live`

#### Scenario: Text off (D22)
- **WHEN** Text is unticked
- **THEN** the "The whole tree" paragraph is not rendered, and the tree view's own "Describe tree" button is still present

### Requirement: Case and range wording come from the conventions
Replay content (`src/content/replay.ts`) and the insert listing (`src/content/pseudocode.ts`) SHALL NOT type a case code (LL, RR, LR, RL), the balance range, a signed out-of-range value or the balance-factor formula. The case name SHALL come from `conventionsWording().caseName`, the range from `rangeText` and signed numbers from `num`. (D19, D2, screen 1f conflicts)

#### Scenario: Source scan (D19)
- **WHEN** `src/content/replay.ts` and `src/content/pseudocode.ts` are scanned
- **THEN** neither contains `LL`, `RR`, `LR` or `RL` as a word, `−1 to +1`, `+2` or `−2`, or `height(` in a formula

#### Scenario: Wording follows a convention change (D19)
- **GIVEN** `conventionsWording()` mocked so that `caseName` maps LL to "left-left", `rangeText` is a different string and `num` formats numbers differently
- **WHEN** the replay is at the imbalance step of the insert of 10 into 30 with left child 20
- **THEN** the caption and the panel's case label both say "left-left" and never "LL", the caption contains the mocked `rangeText`, and insert listing line 3 shows the out-of-range values in the mocked `num` format

### Requirement: Learning aids on the step strip
The module control strip SHALL show Hint with the number of hints left on practice steps, and that number SHALL fall by one per hint used. "I know this, skip" SHALL be offered on content and worked-example steps, including steps that play a replay, and never on a check step. These are existing behaviours of `src/ui/module/ControlStrip.tsx`. This change verifies them and does not edit them. (D20, D21, D23)

#### Scenario: Hint count falls (D21)
- **GIVEN** a practice step with `PRACTICE_HINTS` = 2
- **WHEN** the student uses one hint
- **THEN** the hint button's accessible name contains 1 and states that it is the number left [wording per proposal question 2]

#### Scenario: Skip on a replay step (D20)
- **GIVEN** the C6 worked-example step that plays an insert replay
- **THEN** "I know this, skip" is present in the module strip and not inside the replay

#### Scenario: No skip on a check (D20)
- **WHEN** any check step is shown
- **THEN** "I know this, skip" is not present

### Requirement: Quality bar for the tree controls
The caption, `StepControls`, `PseudocodePanel` and `RepresentationSwitcher` SHALL pass every line of `.claude/docs/design/quality-bar.md`. (Quality bar 1 to 10, NFR-02, NFR-04, D25, D93)

#### Scenario: QB1 matches screens 1f and 1h
- **WHEN** the replay with representations is rendered, and the switcher alone with a mode and a task
- **THEN** in the switcher the order is Show, then Mode, then the task; in the replay, in DOM order, there are the switcher, the tree, the caption, the controls, the pseudocode panel and the whole-tree text, as in 1f's component tree
- **AND** the reviewer records each remaining 1f and 1h difference as an assumption listed in the proposal, never a silent change

#### Scenario: QB2 tokens only
- **WHEN** `npm run lint` and the style scan run over `src/ui/replay/`
- **THEN** no colour, font, size or radius is a literal, and no rule sets `outline` on `:focus` or `:focus-visible`

#### Scenario: QB3 every state
- **WHEN** `replay.css` is read
- **THEN** buttons, checkboxes and radios each have default, `:hover`, `:focus-visible` (shared ring), selected (`aria-pressed="true"` or `:checked`) and `:disabled` rules, and the locked primary box has a disabled rule
- **AND** "not quite yet" is recorded as not applicable, because these controls give no verdicts

#### Scenario: QB4 three widths
- **GIVEN** the C6 Worked example insert replay with every representation shown
- **WHEN** it is rendered at 390, 768 and 1366 px wide (Playwright, `npm run test:visual`)
- **THEN** `document.documentElement.scrollWidth` is at most the viewport width at each width, and the navigation group's top edge is at or above the progress and speed group's top edge (navigation first; the groups may share a row or wrap, review C1)

#### Scenario: QB5 axe
- **WHEN** the replay is rendered held, at position 0, mid-replay at an imbalance step, and at the end, each with the switcher, and the switcher alone with and without a mode
- **THEN** axe reports no violations in any of them

#### Scenario: QB6 keyboard only
- **GIVEN** focus starts before the replay
- **WHEN** the student presses Tab repeatedly
- **THEN** focus reaches, in order, the switcher's enabled boxes, the mode radios, the tree, Back, Play, Step, Replay, the speed buttons, and the search form (search only), each with the shared focus ring
- **AND** every action is available from the keyboard alone

#### Scenario: QB7 colour never alone
- **WHEN** the selected speed, the locked primary box and the current pseudocode line are read
- **THEN** each carries a non-colour signal: `aria-pressed` plus a 2 px border, the word "main" plus disabled, and the ▶ marker, bold weight and `aria-current="step"`
- **AND** the a11y-checker confirms greyscale and the three colour-vision simulations (D25)

#### Scenario: QB8 targets and text size
- **WHEN** the controls are measured at 390 px
- **THEN** every button, checkbox label and radio label is at least 44 by 44 CSS px, and the caption and labels use `--type-body` (16 px)

#### Scenario: QB9 reduced motion
- **GIVEN** the OS reduced-motion setting is on
- **WHEN** the replay plays, steps and steps back
- **THEN** nothing slides: each position is drawn in its final place at once

#### Scenario: QB10 calm wording
- **WHEN** `src/content/replay.ts` and the replay's rendered text are scanned
- **THEN** none contains "wrong", "fail", "incorrect" or "error", the button labels are the same words in the strip, the help line and the keyboard hint (Back, Play, Pause, Step, Replay, Speed), and no replay style uses a `--feedback-*` token (the replay gives no verdicts)
