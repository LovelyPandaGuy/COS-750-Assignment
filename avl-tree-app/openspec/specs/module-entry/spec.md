# module-entry Specification

## Purpose

Decides, in one place, whether a student may enter a module and which prerequisite to name, so the path is guided but never locked and locking later is a one-place change.

## Requirements

### Requirement: Each module names one prerequisite
Each module SHALL have at most one prerequisite, from one table: the required module before it in the guided order. C1 SHALL have none. C7 is optional (D4), so C8 SHALL name C6. (D20, assumed)

#### Scenario: Prerequisite table
- **WHEN** the prerequisite of each module is read
- **THEN** C1 has none, C2 to C7 each name the module before them, C8 names C6 and C9 names C8

### Requirement: Entry is never locked
The entry decision SHALL always let the student enter, for every module and every learner state. It SHALL name the module's prerequisite when that prerequisite is not among the completed modules, and name none otherwise. (D20, FR-LRN-04)

#### Scenario: Fresh learner opens C3
- **GIVEN** a fresh learner state
- **WHEN** the entry decision for C3 is made
- **THEN** entry is allowed and the prerequisite named is C2

#### Scenario: Prerequisite done
- **GIVEN** a learner whose completed modules include C2
- **WHEN** the entry decision for C3 is made
- **THEN** entry is allowed and no prerequisite is named

#### Scenario: C1 never has a note
- **GIVEN** any learner state
- **WHEN** the entry decision for C1 is made
- **THEN** entry is allowed and no prerequisite is named

#### Scenario: Never locked
- **GIVEN** any module and any valid learner state (property test over generated states)
- **WHEN** the entry decision is made
- **THEN** entry is allowed

#### Scenario: Deciding changes nothing
- **WHEN** entry decisions are made for every module
- **THEN** the learner state is unchanged
