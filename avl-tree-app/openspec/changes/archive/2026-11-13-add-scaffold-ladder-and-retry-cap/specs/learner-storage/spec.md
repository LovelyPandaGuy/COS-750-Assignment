# Spec Delta

## MODIFIED Requirements

### Requirement: Anonymous profile on first launch
When nothing is stored, the system SHALL create a fresh learner state with a new random profile ID, no nickname, the `guided` path, current module `C1`, no completed modules, no attempts, no sub-skill results and no lecture questions, and SHALL save it. (FR-ONB-02)

#### Scenario: First launch
- **WHEN** learner state is loaded from empty storage
- **THEN** the load status is "new", the state has schema version 1, a non-empty profile ID, path `guided`, current module `C1` and empty completed modules, attempts, sub-skill results and lecture questions
- **AND** the same state is now in storage

#### Scenario: Profile IDs are random
- **WHEN** learner state is loaded from two separate empty storages
- **THEN** the two profile IDs differ

### Requirement: No personal identifiers stored
Stored learner data SHALL contain only the fields of the learner state model. The profile ID SHALL be random and SHALL NOT be derived from anything about the student or device. A nickname SHALL be optional, trimmed, and at most 24 characters; an empty nickname SHALL be stored as no nickname. (FR-ONB-02, NFR-05)

#### Scenario: Only model fields are written
- **WHEN** a learner state carrying an extra field `email` is saved
- **THEN** the stored value has only the fields schemaVersion, profileId, nickname (if set), path, currentModule, completedModules, attempts, subSkillStatus and lectureQuestions

#### Scenario: Nickname is trimmed and capped
- **WHEN** a state with nickname "  Rotation fan extraordinaire 2026  " is saved and loaded
- **THEN** the loaded nickname is "Rotation fan extraordina" (trimmed, then the first 24 characters)

#### Scenario: Blank nickname
- **WHEN** a state with nickname "   " is saved and loaded
- **THEN** the loaded state has no nickname

## ADDED Requirements

### Requirement: Lecture questions are stored
The learner state SHALL hold a list of lecture questions, each with a question ID, a module ID, a time, a non-empty text and, optionally, a misconception ID. A stored state without the list SHALL load with an empty list and keep schema version 1. A malformed entry SHALL make the stored data corrupt. (FR-SCA-03, NFR-06, D9) The stored-data inventory description SHALL mention lecture questions.

#### Scenario: Round trip
- **WHEN** a state with two lecture questions, one with a misconception and one without, is saved and a new adapter on the same storage loads
- **THEN** the load status is "restored" and the loaded state deep-equals the saved state

#### Scenario: Older stored state still loads
- **GIVEN** a stored schema-version-1 state written before lecture questions existed (no `lectureQuestions` field)
- **WHEN** it is loaded
- **THEN** the load status is "restored", its other fields are unchanged and its lecture questions are an empty list

#### Scenario: Malformed lecture question
- **WHEN** a valid stored state is altered in one way at a time: `lectureQuestions` a string, an entry with module "C10", an entry with empty text, an entry with a numeric question ID, an entry with no question ID
- **THEN** each load has status "reset-corrupt" and returns a fresh state

#### Scenario: Recorded through the session
- **GIVEN** a session state
- **WHEN** a lecture question is recorded
- **THEN** the learner state's lecture questions end with that question and its other fields are unchanged

#### Scenario: Inventory describes it
- **WHEN** the stored-data inventory is read
- **THEN** the learner key's description mentions lecture questions
