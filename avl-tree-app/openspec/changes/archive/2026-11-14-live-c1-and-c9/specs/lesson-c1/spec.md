# Spec Delta

## Purpose

Plays C1 "Getting started and readiness check" from `lessons/c1.json` and `questions/diagnostic.json`: how the app works, the conventions card and the settings, five prerequisite questions, a per-skill result and the route to C2 or the BST refresher and its re-check.

## ADDED Requirements

### Requirement: C1 plays its lesson file
`/module/C1` SHALL play the screens of `lessons/c1.json` on the lesson player, in order: the welcome, the route of the nine lessons with the objectives, how the app works, the conventions card (its tree and points), the settings, the readiness questions and the result. (ID 7.2 C1)

#### Scenario: Screens in order
- **WHEN** C1 is played from the start
- **THEN** its screen headings are "Welcome", "Your route", "How the app works", "The conventions card", "Settings", "Quick readiness check" and "Your result"

#### Scenario: Conventions card
- **WHEN** "The conventions card" is shown
- **THEN** its tree from 20, 10, 40, 30, 50 shows heights and balance factors and its five points are listed

### Requirement: Five readiness questions, one per screen
The question-set screen SHALL ask the five questions in `diagnostic.json` `questionIds` order, one at a time, with the lesson's question controls and a confidence rating. Each answer SHALL be stored; no verdict SHALL be shown until the result. Back SHALL keep answers. A reload SHALL resume at the first unanswered question. (ID 7.2, ID 9.1, FR-DIA-01)

#### Scenario: No verdict during the set
- **WHEN** `dia-01` is answered wrongly
- **THEN** no verdict is shown, the attempt is stored, and Next opens `dia-02`

#### Scenario: Resume
- **GIVEN** three questions answered
- **WHEN** the app reloads and C1's question set is opened
- **THEN** `dia-04` is shown

### Requirement: Per-skill result and route
The result screen SHALL list each prerequisite skill (named as ID 7.2 names them) as "Secure" or "Needs review" (`conventions.labels`), with no total. With at least `route.minCorrect` (4) of 5 right it SHALL recommend C2 with the `passMessage`; otherwise the BST refresher with the `failMessage`. Both choices SHALL be offered; the recommended one carries "Suggested". C1 SHALL complete when the route is to C2. (ID 7.2, ID 9.1, ID 9.3 "the student decides")

#### Scenario: Four right
- **WHEN** four of the five are right
- **THEN** four skills read Secure and one Needs review, C2 is suggested with "Your BST basics are secure. On to C2.", and C1 is in the completed modules

#### Scenario: Three right
- **WHEN** three are right
- **THEN** the refresher is suggested with the fail message, C2 is still offered, and C1 is not completed

### Requirement: The re-check after the refresher
After the refresher, the re-check SHALL ask the return form (`recheckIds`) of each question missed in the first round, then show the result again and complete C1, offering C2. The refresher's "Short re-check" screen SHALL start it, and its "Try it" practice task SHALL be asked like any practice question. (ID 7.2 "BST refresher, a short re-check, then C2")

#### Scenario: Only the missed skills
- **GIVEN** `dia-02` and `dia-05` were missed
- **WHEN** the re-check is taken
- **THEN** it asks `dia-02-r` and `dia-05-r` only, and afterwards C1 is completed and C2 is offered

### Requirement: No skipping the readiness check
C1 SHALL offer no way to skip the readiness questions; they SHALL count as a check screen (no Skip ahead). (ID 7.2, ID 8.2)

#### Scenario: No skip
- **WHEN** the question-set screen is shown
- **THEN** there is no skip control
