# lesson-sidebar Specification

## Purpose
A stable list of the nine lessons on every screen, so a student can always see where they are in C1 to C9 and open any lesson in one step (ID 8.2 "lesson list").

## Requirements

### Requirement: The sidebar lists the nine lessons
Every screen SHALL show a navigation landmark named "Lessons" listing C1 to C9 in order, each with its code and its title from its lesson file, and nothing else as a heading or item. Each lesson SHALL be a link to its lesson screen, because no lesson is hard-locked (D20). (ID 8.2, ID 7.1, FR-LRN-03, D155)

#### Scenario: Nine lessons, in order
- **WHEN** any route is rendered
- **THEN** a navigation named "Lessons" holds exactly nine links, `C1` to `C9` in order, each named with the lesson's code and title, linking to `/module/C1` to `/module/C9`

#### Scenario: On every screen
- **WHEN** `/`, `/module/C1`, `/module/C5`, `/module/C1/refresher`, `/sandbox` and `/readiness` are rendered
- **THEN** each has the "Lessons" navigation

#### Scenario: Opening a lesson
- **WHEN** C4's link is followed from the sandbox
- **THEN** the C4 lesson is shown

### Requirement: The sidebar marks progress and the page
Each lesson SHALL show its state in a word and a symbol, not colour alone: "Done" for a completed lesson, "You are here" for the learner's current lesson, otherwise "Not started". The link of the lesson being viewed SHALL carry `aria-current="page"`. (ID 8.3, ID 11.1, D155)

#### Scenario: States in words
- **GIVEN** C1 and C2 completed and the current lesson C3
- **WHEN** `/module/C4` is shown
- **THEN** C1 and C2 read "Done", C3 reads "You are here", and C4 to C9 read "Not started"

#### Scenario: Page marked
- **WHEN** `/module/C5` is shown
- **THEN** only C5's link has `aria-current="page"`, and on `/sandbox` no link has it

### Requirement: The sidebar stays in place
From 768 px the sidebar SHALL be a column to the left of `main` that stays in view while the page scrolls and scrolls by itself when taller than the window. Below 768 px it SHALL be a "Lessons" disclosure button at the top of the page that opens the same list in the page flow, closed by default. In the DOM it SHALL follow the banner and precede `main`, and the skip link SHALL still move focus to `main`. (D3, D155, NFR-04, FR-VIS-10)

#### Scenario: Sticky column from 768 px
- **WHEN** the sidebar stylesheet is read
- **THEN** a `@media (min-width: 768px)` rule makes the page body a two-column grid with the sidebar first, and the sidebar is `position: sticky` with a maximum height and `overflow-y: auto`

#### Scenario: Lessons button on a phone
- **WHEN** the sidebar stylesheet is read and a route is rendered
- **THEN** below 768 px the column list is hidden and a "Lessons" button with `aria-expanded="false"` opens the list

#### Scenario: Order and skip link
- **WHEN** a route is rendered and the skip link is followed
- **THEN** the sidebar is after the banner and before `main`, and focus lands on `main`

### Requirement: The sidebar is accessible
The sidebar SHALL have no axe violations, closed and open on a phone, SHALL be usable by keyboard alone, and SHALL have targets of at least 44 px. (NFR-02, ID 11.2)

#### Scenario: Axe
- **WHEN** `/module/C4` is rendered, and the Lessons button is opened
- **THEN** axe reports no violations

#### Scenario: Targets
- **WHEN** the sidebar stylesheet is read
- **THEN** each lesson link has a `min-height` of `var(--target-min)`
