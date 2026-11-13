# readiness-summary Specification

## Purpose
The readiness summary that closes the session: Ready or Revise per outcome, confident errors, the questions to take to the lecture, and print, save or copy.

## ADDED Requirements

### Requirement: Ready or Revise per outcome
The summary at `/readiness` SHALL list LO1 to LO9, each with its outcome text, Ready or Revise in words, and a link to the Worked example of the module that teaches it. Each outcome SHALL read Ready or Revise as the readiness report gives it (readiness-report capability). LO8 SHALL be marked optional and SHALL never hold back the overall verdict. The rows SHALL match the stored attempts. (FR-RDY-01, D4, D8)

#### Scenario: Matches attempts
- **GIVEN** stored attempts where the LO2 readiness item's latest attempt is right and the LO3 readiness item's latest attempt is wrong
- **WHEN** the summary is shown
- **THEN** LO2 reads Ready and LO3 reads Revise

#### Scenario: LO8 never blocks
- **WHEN** a learner has never tried the LO8 item and every other outcome is Ready
- **THEN** LO8 is listed with "optional" and the overall verdict is Ready

#### Scenario: Links back
- **WHEN** the LO6 row's link is followed
- **THEN** the C5 Worked example opens

### Requirement: Confident errors are flagged
An outcome row SHALL carry a flag in words when any attempt at that outcome was wrong with confidence "sure". (FR-RDY-01, FR-ASM-05)

#### Scenario: Flag
- **GIVEN** a wrong LO3 attempt with confidence "sure"
- **WHEN** the summary is shown
- **THEN** the LO3 row carries the flag and no row without such an attempt does

### Requirement: Bring to the lecture
The summary SHALL list plain-language questions to take to the lecture: every recorded lecture question, and the template question for each misconception whose latest wrong attempt has no later correct attempt on an item of the same sub-skill, as the readiness report's lecture list gives it, without duplicates. The list SHALL be empty only when nothing is unresolved. (FR-RDY-02, D19)

#### Scenario: Unresolved misconception
- **GIVEN** a wrong attempt tagged with a misconception and no later right attempt on that sub-skill
- **WHEN** the summary is shown
- **THEN** that misconception's lecture question is listed

#### Scenario: Resolved
- **GIVEN** the same wrong attempt followed by a right one at the same item
- **WHEN** the summary is shown
- **THEN** that question is not listed

### Requirement: The student's own question
The summary SHALL ask the student to write at least one question of their own, with a field, an add button and the questions added so far, and SHALL say not to include a name or student number. Each own question SHALL be stored as a lecture question with the ID `own` (`OWN_LECTURE_QUESTION`). Print, save and copy SHALL stay unavailable until one is written. More SHALL be allowed. (FR-RDY-02, D14)

#### Scenario: Required
- **WHEN** no own question is written
- **THEN** print, save and copy are disabled and the reason is shown

#### Scenario: Added and kept
- **WHEN** a question is typed and added, and the page is reloaded
- **THEN** the question is listed and print, save and copy are available

### Requirement: Print, save or copy
The summary SHALL offer print (a print stylesheet that hides navigation and fits one A4 page), save (a plain-text file download) and copy (the same text to the clipboard), with a calm confirmation after copy. The text SHALL hold each outcome's status, the flags, the lecture list and the own questions, and no profile ID. (FR-RDY-03, NFR-05)

#### Scenario: Text content
- **WHEN** the summary text is built
- **THEN** it contains every outcome's status, every listed question and every own question, and not the profile ID

#### Scenario: Copy
- **WHEN** copy is pressed
- **THEN** the clipboard receives the summary text and a polite status confirms it

### Requirement: Calm and accessible
The summary SHALL use no score, points, rank, grade, pass or fail wording, SHALL show status in words as well as any symbol, and SHALL have no axe violations. (FR-MOT-04, D25, NFR-02)

#### Scenario: Axe and wording
- **WHEN** the summary is rendered for a fresh learner and for one with attempts
- **THEN** axe reports no violations and none of those words appears
