# learner-storage Specification

## Purpose

Keeps an anonymous student's progress in their own browser so it survives a reload, can be reset, and never crashes the app when stored data is missing, damaged or cannot be written.

## Requirements

### Requirement: Anonymous profile on first launch
When nothing is stored, the system SHALL create a fresh learner state with a new random profile ID, no nickname, the `guided` path, current module `C1`, no completed modules, no attempts and no sub-skill results, and SHALL save it. (FR-ONB-02)

#### Scenario: First launch
- **WHEN** learner state is loaded from empty storage
- **THEN** the load status is "new", the state has schema version 1, a non-empty profile ID, path `guided`, current module `C1` and empty completed modules, attempts and sub-skill results
- **AND** the same state is now in storage

#### Scenario: Profile IDs are random
- **WHEN** learner state is loaded from two separate empty storages
- **THEN** the two profile IDs differ

### Requirement: No personal identifiers stored
Stored learner data SHALL contain only the fields of the learner state model. The profile ID SHALL be random and SHALL NOT be derived from anything about the student or device. A nickname SHALL be optional, trimmed, and at most 24 characters; an empty nickname SHALL be stored as no nickname. (FR-ONB-02, NFR-05)

#### Scenario: Only model fields are written
- **WHEN** a learner state carrying an extra field `email` is saved
- **THEN** the stored value has only the fields schemaVersion, profileId, nickname (if set), path, currentModule, completedModules, attempts and subSkillStatus

#### Scenario: Nickname is trimmed and capped
- **WHEN** a state with nickname "  Rotation fan extraordinaire 2026  " is saved and loaded
- **THEN** the loaded nickname is "Rotation fan extraordina" (trimmed, then the first 24 characters)

#### Scenario: Blank nickname
- **WHEN** a state with nickname "   " is saved and loaded
- **THEN** the loaded state has no nickname

### Requirement: Restore after reload
Loading SHALL return exactly the learner state that was last saved on the same browser, including current module, completed modules, sub-skill results and every attempt with its confidence, misconception and hints used. (FR-ONB-03)

#### Scenario: Round trip
- **WHEN** a state with current module `C4`, completed modules `C1` to `C3`, two attempts and two sub-skill results is saved, and a new adapter on the same storage loads
- **THEN** the load status is "restored" and the loaded state deep-equals the saved state

#### Scenario: Any valid state survives a round trip
- **WHEN** arbitrary valid learner states (property test) are each saved and loaded
- **THEN** each loaded state deep-equals the saved state after nickname normalisation

#### Scenario: Last save wins
- **WHEN** a state is saved, then a second state with a different current module is saved, then the state is loaded
- **THEN** the loaded state equals the second state

### Requirement: Stored data is validated on load
On load, the system SHALL treat stored learner data as corrupt if it is not valid JSON, has a schema version other than 1, or any field is missing or of the wrong type or value. Corrupt data SHALL be replaced by a fresh saved state and the load status SHALL be "reset-corrupt". Load SHALL NOT throw. (NFR-06)

#### Scenario: Unreadable JSON
- **WHEN** the stored learner value is `{not json`
- **THEN** the load status is "reset-corrupt", a fresh state is returned and stored, and no error is thrown

#### Scenario: Unknown schema version
- **WHEN** the stored learner value is a valid state with schema version 2
- **THEN** the load status is "reset-corrupt" and a fresh state is returned

#### Scenario: Tampered fields
- **WHEN** a valid stored state is altered in one way at a time: currentModule "C10", path "skipped", completedModules "C1" (a string), a sub-skill status "mastered", an attempt with correct "yes", an attempt with confidence "maybe", an attempt with hintsUsed -1, profileId empty
- **THEN** each load has status "reset-corrupt" and returns a fresh state

#### Scenario: Fuzzed storage never crashes
- **WHEN** arbitrary strings (property test) are stored as the learner value and loaded
- **THEN** every load returns a valid learner state with status "restored" or "reset-corrupt" and never throws

### Requirement: Works when storage is unavailable
If browser storage cannot be read or written (blocked, private mode or full), the system SHALL keep running with the learner state held in memory, SHALL report that progress is not being saved, and SHALL NOT throw from load, save or reset. (NFR-06)

#### Scenario: Storage throws on access
- **WHEN** the adapter is created over a storage whose every call throws, then loads, saves and resets
- **THEN** none of the calls throws, load returns a fresh state, the adapter reports persistence as off, and a load after a save returns the saved state from memory

#### Scenario: Storage full on save
- **WHEN** a load succeeds and then a save fails because storage is full
- **THEN** the save does not throw, the adapter reports persistence as off, and a later load returns the saved state from memory

### Requirement: Reset clears all stored data
Reset SHALL remove every key the app stores (every key with the app prefix) and SHALL leave keys of other apps untouched. It SHALL return and save a fresh learner state with a new profile ID. (FR-ONB-04)

#### Scenario: Reset
- **WHEN** a state with attempts is saved, an unrelated key `other-app` and a second app-prefixed key are present, and reset is called
- **THEN** the second app-prefixed key is gone, `other-app` is unchanged, the returned state is fresh with a profile ID different from before, and a later load has status "restored" and returns that fresh state

### Requirement: Stored-data inventory
The system SHALL publish an inventory of every key it may store, each with a plain-language description of what it holds, for the privacy notice and POPIA documentation. Every key written SHALL be listed in the inventory and SHALL start with the app prefix. (NFR-05, FR-ONB-05 groundwork)

#### Scenario: Every written key is listed
- **WHEN** an adapter loads, saves and resets over a recording storage
- **THEN** every key it wrote is in the inventory and starts with the app prefix

#### Scenario: Descriptions are present
- **WHEN** the inventory is read
- **THEN** every entry has a non-empty key and a non-empty description

### Requirement: Single storage access point
No source file under `src/` other than the storage adapter module SHALL reference `localStorage`, `sessionStorage`, `indexedDB` or `document.cookie`. (NFR-05, CLAUDE.md storage guardrail)

#### Scenario: Source scan
- **WHEN** every non-test `.ts` and `.tsx` file under `src/` except the storage adapter module is scanned
- **THEN** none contains `localStorage`, `sessionStorage`, `indexedDB` or `document.cookie`

### Requirement: Lecture questions are stored
The learner state SHALL hold a list of lecture questions, each with an item ID, an optional misconception ID, a text and a time. A saved state without the list SHALL load as an empty list, not as corrupt. A list or entry of the wrong type or with a missing field SHALL make the state corrupt as any other field does. Lecture-question text SHALL be generated by the app, never typed by the student, and the stored-data inventory description SHALL mention lecture questions. (FR-SCA-03, NFR-06, NFR-05)

#### Scenario: Older save loads
- **WHEN** a valid saved state with no lecture questions is loaded
- **THEN** the status is "restored" and the list is empty

#### Scenario: Round trip
- **WHEN** a state with a lecture question is saved and loaded
- **THEN** the question is restored equal

#### Scenario: Tampered list
- **WHEN** the list is a string, or an entry has no item ID
- **THEN** the load status is "reset-corrupt" and a fresh state is returned

#### Scenario: Inventory
- **WHEN** the inventory entry for the learner key is read
- **THEN** its description mentions lecture questions
