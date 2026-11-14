# lesson-player Specification

## Purpose
Plays a lesson's JSON screens one at a time in one consistent frame, the same for every lesson, so students always find the title, their position, the main representation, the caption and the controls in the same place.

## Requirements

### Requirement: A lesson plays its screens in order
The lessons C2 to C8 SHALL each be played by one lesson player that shows the lesson's screens one at a time, in the order of its lesson file, starting at the first screen. (ID 3.2, ID 8.2 "each screen holds one concept")

#### Scenario: First screen
- **WHEN** the C3 lesson is opened
- **THEN** the screen shown is `c3-s01` ("Spot the problem")

#### Scenario: Every lesson uses the player
- **WHEN** each of C2 to C8 is opened
- **THEN** each is shown by the same lesson player, with the same frame regions

### Requirement: The lesson frame
Every lesson screen SHALL show, from top to bottom: a top region with the lesson title as the level-1 heading, "Lesson n of 9" (from `conventions.labels.progress`), "Screen n of m" and the screen's phase; the screen title as a level-2 heading; the screen's main representation; its caption directly under it; its supporting text; and the control strip. The regions SHALL keep the same order and position on every screen of every lesson. (ID 8.2, ID 8.3, D23)

#### Scenario: Top region
- **WHEN** the fourth screen of C3 is shown
- **THEN** the level-1 heading is "The AVL property", the top region reads "Lesson 3 of 9" and "Screen 4 of 13", and the level-2 heading is "Height"

#### Scenario: Same regions everywhere
- **WHEN** every screen of C2 to C8 is rendered
- **THEN** each has, in document order, the top region, the screen heading, the main region, the caption region (empty when the screen has no caption) and the control strip

### Requirement: The screen's phase is shown in words
The top region SHALL name the current screen's phase from its `merrillPhase`, using one word per phase (Problem, Recall, Learn, Practise, Check and summary), so the student knows where they are in the lesson. The phase SHALL be text, never colour alone. (ID 3.2, ID 8.3 "where am I")

#### Scenario: Phases
- **WHEN** the C3 screens `c3-s01`, `c3-s03`, `c3-s04`, `c3-s09` and `c3-s13` are shown
- **THEN** their phases read Problem, Recall, Learn, Practise and Check and summary

### Requirement: Controls in one place
The control strip SHALL sit in the same place on every screen, with Back, Next and (on animation screens) Replay step on one side and Show the rule and Hint on the other. Show the rule SHALL appear only on screens with a `showRule`; Hint only on screens with a `hint`. Back SHALL be disabled on the first screen. Next on the last screen SHALL return to the path. Every control SHALL be at least 44 by 44 px and work by keyboard. (ID 8.2, ID 8.3, NFR-02)

#### Scenario: Next and Back
- **GIVEN** the C3 lesson at screen 4
- **WHEN** Next is activated, then Back
- **THEN** screen 5, then screen 4, is shown

#### Scenario: Show the rule only where it exists
- **WHEN** `c3-s05` (which has a `showRule`) and `c3-s04` (which has none) are shown
- **THEN** Show the rule is present on `c3-s05` and absent on `c3-s04`

#### Scenario: Last screen
- **WHEN** Next is activated on the summary screen of C3
- **THEN** the path is shown

### Requirement: Show the rule toggles the written rule
Show the rule SHALL toggle the screen's `showRule` text in a region next to the main representation, without leaving the screen, and SHALL say whether it is open (`aria-expanded`). (ID 8.2 "Show the rule")

#### Scenario: Toggle
- **WHEN** Show the rule is activated twice on `c3-s05`
- **THEN** the rule text "bf = height of right branch − height of left branch. An empty branch has height −1." is shown, then hidden, and `aria-expanded` is true, then false

### Requirement: Skip ahead only on explanation screens
A "Skip ahead" control SHALL be offered on explanation screens (Merrill phase `demonstration`) and SHALL move to the next screen that is not a demonstration screen. It SHALL NOT be offered on problem, recall, practice, check or summary screens. (ID 8.2 "Skip ahead is allowed on explanation screens but not on checks", D20)

#### Scenario: Skip from an explanation
- **GIVEN** the C3 lesson at `c3-s04` (the first of its demonstration screens)
- **WHEN** Skip ahead is activated
- **THEN** `c3-s09` (the first practice screen) is shown

#### Scenario: No skip on a check
- **WHEN** `c3-s12` (the lesson check) is shown
- **THEN** there is no Skip ahead control

### Requirement: Focus moves to each screen
When the screen changes, focus SHALL move to the screen's level-2 heading, so keyboard and screen-reader users start at the new screen. (NFR-02, FR-LRN-04)

#### Scenario: Focus after Next
- **WHEN** Next is activated
- **THEN** the focused element is the new screen's level-2 heading

### Requirement: The summary recaps the objectives
The summary screen of each lesson SHALL show the summary points, then an "Objectives recap" listing the lesson's objectives in the words of its objectives screen. (User request 13 Nov, ID 3.2 Gagné 9)

#### Scenario: C3 recap
- **WHEN** `c3-s13` is shown
- **THEN** its three summary points are shown, followed by an "Objectives recap" that contains "Calculate heights and balance factors, and decide whether a tree is an AVL tree (LO2)."

### Requirement: Lesson screens are accessible and responsive
Every lesson screen SHALL have no axe violations, SHALL be usable by keyboard alone, and SHALL fit a 360 px wide viewport without horizontal page scroll (a wide tree scrolls inside its own region, D17). Text SHALL meet 4.5:1 contrast in the light and dark themes. (NFR-02, D3, ID 11.2)

#### Scenario: Axe on every screen
- **WHEN** every screen of C2 to C8 is rendered
- **THEN** axe reports no violations

#### Scenario: Phone width
- **WHEN** a C6 screen with the largest tree is rendered at 360 px
- **THEN** the page has no horizontal scroll and the tree region scrolls on its own

### Requirement: Hint follows the screen's question
The Hint control SHALL be offered on any screen whose question (or check question) has a `hint`, and SHALL open that static hint in the hint region. Opening it SHALL count as one hint used for the current question. (ID 9.4)

#### Scenario: Hint on a practice screen
- **WHEN** Hint is activated on `c3-s09`
- **THEN** "This checks heights and balance factors: …" is shown, and the next stored attempt for `c3-s09-task` has `hintsUsed` 1
