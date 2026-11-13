# diagnostic-c1 Specification

## Purpose
The C1 warm-up: how the app works, the conventions card, five private prerequisite questions, a per-skill result with no score, and a way to skip.

## ADDED Requirements

### Requirement: Getting started screens
The warm-up check at `/module/C1/check` SHALL open with two screens before any question: how the app works (what a module is, the confidence buttons, the replay option, that nothing is graded) and the conventions card (leaf height 0, empty tree height −1, balance factor from the conventions module). Each SHALL show the skip control, and the conventions card text SHALL come from the conventions module. (ID C1, D2, D19, FR-DIA-04)

#### Scenario: Order
- **WHEN** the warm-up check is opened for a learner with no diagnostic attempts
- **THEN** the how-the-app-works screen shows first, then the conventions card, then question 1

#### Scenario: Conventions card from the module
- **WHEN** the conventions card is shown
- **THEN** its formula and height rule equal the conventions wording's, and no number or sign is typed in the content file

### Requirement: Five questions, one per screen
The diagnostic SHALL have five items, each tagged to one prerequisite sub-skill of `bst-terminology`, `bst-insert`, `bst-search` or `tree-height`, with terms and "is this a BST?" under `bst-terminology`. Each SHALL appear alone on its screen with optional confidence buttons and a Next button disabled until an answer is given. It SHALL give no feedback on the answer. Back SHALL keep answers given, and the engine SHALL build every figure and answer. (FR-DIA-01, D6, D7, FR-ASM-07)

#### Scenario: Five items
- **WHEN** the diagnostic items are listed
- **THEN** there are five, covering the four sub-skills, with `bst-terminology` having two

#### Scenario: One at a time, no feedback
- **WHEN** an answer is chosen and Next is pressed
- **THEN** the next question shows and no verdict or explanation was shown for the first

#### Scenario: Back keeps answers
- **WHEN** question 3 is answered and the student goes Back twice and forward again
- **THEN** the earlier answers are still selected

#### Scenario: Stored
- **WHEN** the five questions are answered
- **THEN** the learner state holds five attempts, with confidence if given, and no hints used

### Requirement: Private practice wording
No screen of the warm-up check, its result or the refresher SHALL use "mark", "grade", "pass", "fail", "test", "score" or "points", and the first screen SHALL say the questions are private practice. (FR-DIA-05, design principle 1)

#### Scenario: Wording scan
- **WHEN** every string of the diagnostic, result and refresher content is read
- **THEN** none of those words appears, and the first screen says the questions are private practice

### Requirement: Per-skill result, no total
The result at `/module/C1/check/result` SHALL list the four sub-skills each as "Secure" or "Needs review", by words as well as any symbol, and SHALL NOT show a count, fraction, percentage or overall verdict. It SHALL offer the BST refresher whatever the result. (FR-DIA-02, FR-DIA-04, D6, D8)

#### Scenario: Statuses
- **GIVEN** the five answers correct except the search-path item
- **WHEN** the result is shown
- **THEN** `bst-search` reads "Needs review" and the other three read "Secure"

#### Scenario: No total
- **WHEN** any result is shown
- **THEN** the page text contains no digit-over-digit fraction, no percentage, and no "of 5"

#### Scenario: Refresher always reachable
- **WHEN** the result is shown with every skill secure
- **THEN** a link to `/module/C1/refresher` is present

### Requirement: Skipping the diagnostic
Every screen before and during the questions SHALL show a "Skip the warm-up" control. Skipping SHALL set the learning path to "diagnostic skipped", set the current module to C2, show C2, and leave C1 not completed and the refresher reachable from the hub. Skipping SHALL NOT discard answers already given. (FR-DIA-04, D20)

#### Scenario: Visible first
- **WHEN** the first screen of the warm-up check is shown
- **THEN** the skip control is present

#### Scenario: Skip from question 3
- **WHEN** two questions are answered and the student skips
- **THEN** the path is "diagnostic skipped", the current module is C2, C1 is not completed, and the two attempts are kept

#### Scenario: Refresher after a skip
- **WHEN** the hub and the C1 module screen are shown after a skip
- **THEN** each links to the BST refresher

### Requirement: Accessible diagnostic
The diagnostic screens SHALL have no axe violations, SHALL work by keyboard alone, SHALL move focus to each new screen's heading, and SHALL have controls at least 44 by 44 px. Colour SHALL NOT be the only signal of a status. (NFR-02, D25)

#### Scenario: Axe
- **WHEN** each screen of the flow and the result is rendered
- **THEN** axe reports no violations
