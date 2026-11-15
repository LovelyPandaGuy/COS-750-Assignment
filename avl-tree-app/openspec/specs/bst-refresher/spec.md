# bst-refresher Specification

## Purpose
A short refresher on the binary search tree ideas the course assumes, shown after a low diagnostic result or on request.

## Requirements

### Requirement: A short sequence
The refresher at `/module/C1/refresher` SHALL play the screens of the `refresher` in `lessons/c1.json`, in order, on the lesson player, headed "BST refresher" (its `title`), covering the ordering property, search, insert, and tree terms with height (leaf 0, empty −1). It SHALL end by offering the re-check when the diagnostic routed here, and C2 otherwise. (ID 7.2 C1, FR-DIA-03, user decision 14 Nov)

#### Scenario: Topics
- **WHEN** the refresher's screens are read
- **THEN** their headings are "The BST rule", "Searching a BST", "Inserting into a BST", "Tree terms and height", "Try it" and "Short re-check", in that order

#### Scenario: Heading
- **WHEN** the refresher is opened
- **THEN** its level-1 heading is "BST refresher" and its top region reads "Lesson 1 of 9"

#### Scenario: Ending
- **WHEN** the last screen is shown after a refresher route
- **THEN** a link to the re-check is offered; after any other route a link to C2 is

### Requirement: Reachable, skippable, calm
The refresher SHALL be reachable from the result and the C1 module screen, whatever the learner state; its explanation screens SHALL offer "Skip ahead" as lesson screens do; and its UI wording SHALL use no mark, grade, pass, fail, test or score wording. (FR-DIA-04, D20, FR-DIA-05, ID 8.2, D159)

#### Scenario: Reachable
- **WHEN** the C1 module screen is shown for any learner state
- **THEN** it links to the refresher

#### Scenario: Skip on content steps
- **WHEN** an explanation screen of the refresher is shown
- **THEN** "Skip ahead" is offered

### Requirement: The refresher comes from the lesson file
The refresher's screens SHALL be validated with the rest of the content: its animations' captions and results SHALL equal the engine's, and its practice task and re-check SHALL show the interactive-screen placeholder until `add-live-lesson-questions`. (ID 12.2, live-content)

#### Scenario: Insert animation agrees with the engine
- **WHEN** `c1-r03` (insert 4 into the plain BST from 5, 3, 7, 1, 6, 9) is validated
- **THEN** there is no content error, and its captions end with "Every node has a balance factor of −1, 0 or +1."

#### Scenario: A changed caption is reported
- **GIVEN** a copy of `c1-r03` whose third caption is changed
- **WHEN** it is validated
- **THEN** there is a content error naming `c1-r03` and `steps`
