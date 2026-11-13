# scaffold-ladder Specification

## Purpose
The support a student can open on a check question: a hint, a worked example and a guided step-through, in that order, built from the engine and drafted wording.

## ADDED Requirements

### Requirement: Three levels in a fixed order
A check question SHALL offer three support levels: 1 a hint, 2 a worked example, 3 a guided step-through. Level n SHALL be openable only after level n-1 is open for that question. Asking for the next level SHALL be possible at any time, and a wrong attempt SHALL open the next level automatically: the first wrong attempt shows level 1, the second level 2, the third level 3. Each level opened SHALL count as one hint used on the next attempt record. (FR-SCA-02, D21)

#### Scenario: Wrong attempts escalate
- **WHEN** a question is answered wrongly three times
- **THEN** the hint is shown after the first, the worked example after the second, and the guided step-through after the third

#### Scenario: Order is enforced
- **WHEN** a question is shown before any answer
- **THEN** the worked example and step-through controls are not available until the hint has been opened

#### Scenario: On request
- **WHEN** the hint is requested before any answer is checked
- **THEN** the hint is shown, and the attempt marked next records one hint used

### Requirement: Hints match the misconception
A hint SHALL be drafted for the misconception the wrong answer was tagged with, or for the question's sub-skill when no misconception was recognised or no answer has been checked. A hint SHALL point at what to look at next, SHALL NOT give the answer, and SHALL name numbers only from the instance's facts. Every misconception in the catalogue and every sub-skill SHALL have a hint. (FR-SCA-02, D19)

#### Scenario: Misconception hint
- **GIVEN** a wrong option tagged with a misconception
- **WHEN** the hint opens
- **THEN** it is that misconception's hint, built with the instance's engine values

#### Scenario: Sub-skill hint
- **WHEN** the hint is requested before any answer, or after a number answer matching no known misconception
- **THEN** the sub-skill's hint is shown

#### Scenario: No answer in a hint
- **WHEN** the hint text of every bank item is built for seeds 0 to 99
- **THEN** it does not contain the item's correct answer as a stated result

### Requirement: Worked example is another variant, solved
The worked example SHALL be a different variant of the same item, shown with its stem, its figure if any, the correct answer and the item's explanation of why. It SHALL differ from the question on screen and SHALL be computed by the engine. (FR-SCA-02, D7)

#### Scenario: A different problem
- **WHEN** the worked example opens for any bank item and seeds 0 to 99
- **THEN** its problem differs from the question on screen and its answer equals the engine's answer for it

### Requirement: Guided step-through walks this question
The guided step-through SHALL walk the question on screen in order, one step at a time, with a control to show the next step, and SHALL end with the correct answer. Its steps SHALL come from the item's explanation of the correct answer, one sentence per step. (FR-SCA-02, D21)

#### Scenario: One step at a time
- **WHEN** the step-through opens
- **THEN** only the first step shows, and each press of "Show next step" adds one, until the answer shows and the control is gone

#### Scenario: Ends with the answer
- **WHEN** every step is shown
- **THEN** the last step states the correct answer from the instance

### Requirement: Calm and accessible
The ladder SHALL be wrapped in a labelled region, SHALL announce each level opened in a polite live region, SHALL use no red, cross or "wrong"/"fail" wording, and its controls SHALL be at least 44 by 44 px. (D27, NFR accessibility)

#### Scenario: Axe and targets
- **WHEN** a question with each level open is rendered
- **THEN** axe reports no violations and each control is at least 44 by 44 px

#### Scenario: Wording scan
- **WHEN** the ladder wording is scanned
- **THEN** it contains none of a cross glyph, "wrong", "incorrect", "fail" or "red"
