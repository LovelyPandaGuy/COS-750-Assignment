# readiness-check Specification

## Purpose
The C9 readiness check: one question per learning outcome plus two combined questions, a recycle of outcomes not yet ready, and C9's completion.

## Requirements

### Requirement: Eleven items
The C9 check SHALL have one item for each of LO1 to LO9 and two combined items, one asking for the root of an AVL tree built from listed keys and one asking how many nodes a search visits in that kind of tree. LO8's item SHALL be optional and no other. Every answer and wrong option SHALL come from the engine, including the LO5 worst-case bound. (ID C9, FR-ASM-06, D4, D13, D14)

#### Scenario: Coverage
- **WHEN** the C9 items are listed
- **THEN** there are eleven, every outcome LO1 to LO9 has at least one, and only the LO8 item is optional

#### Scenario: Engine answers
- **WHEN** every C9 item is built for seeds 0 to 99
- **THEN** each answer equals the engine's for that problem, and the validator reports nothing

### Requirement: The check flow
The C9 check at `/module/C9/check` SHALL show a short introduction, then the items one per step with the same answer controls, feedback, ladder and retry cap as module checks, and Back and Next between steps. (D21, D27, FR-SCA-02, FR-SCA-03)

#### Scenario: Like a module check
- **WHEN** a C9 item is answered wrongly
- **THEN** "Not quite yet", the why, Review, Try again and the hint are shown, and the attempt is stored

#### Scenario: Cap
- **WHEN** a C9 item is answered wrongly three times
- **THEN** Continue is offered and a lecture question is recorded

### Requirement: Missed outcomes come back once
After the eleven items, each outcome that is not Ready when they are finished SHALL bring back its C9 item once, as a new variant, before the summary. An outcome SHALL come back at most once, and the step SHALL be skipped when every outcome is Ready. (ID C9, D14)

#### Scenario: Return once
- **GIVEN** LO3 is not Ready after the eleven items
- **WHEN** the recycle step runs
- **THEN** the LO3 item is shown again as a different problem, and after it LO3 does not come back again

#### Scenario: Nothing to recycle
- **WHEN** every outcome is Ready after the eleven items
- **THEN** the check goes straight to the summary link

### Requirement: C9 completes through its check
C9 SHALL be added to the completed modules when every required C9 item is finished, right or capped, and the recycle step is done. The LO8 item SHALL NOT be required. (D20, FR-LRN-05)

#### Scenario: Complete
- **WHEN** the required items are finished and the recycle step is done
- **THEN** C9 is in the completed modules and a link to the readiness summary is shown

#### Scenario: Not before
- **WHEN** one required item is unfinished
- **THEN** C9 is not completed
