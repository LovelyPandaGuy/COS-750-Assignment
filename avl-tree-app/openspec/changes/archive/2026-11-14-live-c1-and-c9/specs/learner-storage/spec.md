# Spec Delta

## MODIFIED Requirements

### Requirement: Stored data is validated on load
On load, the system SHALL treat stored learner data as corrupt if it is not valid JSON, has a schema version other than 2, or any field is missing or of the wrong type or value. Corrupt data, including a version-1 save from before the JSON questions, SHALL be replaced by a fresh saved state and the load status SHALL be "reset-corrupt", which shows the "earlier progress was replaced" notice. Load SHALL NOT throw. (NFR-06, proposal item 7)

#### Scenario: Unreadable JSON
- **WHEN** the stored learner value is `{not json`
- **THEN** the load status is "reset-corrupt", a fresh state is returned and stored, and no error is thrown

#### Scenario: Unknown schema version
- **WHEN** the stored learner value is a valid state with schema version 1 or 3
- **THEN** the load status is "reset-corrupt" and a fresh state is returned

#### Scenario: Tampered fields
- **WHEN** a valid stored state is altered in one way at a time: currentModule "C10", completedModules "C1" (a string), an attempt with correct "yes", an attempt with confidence "maybe", an attempt with hintsUsed -1, an attempt with attempt 0, profileId empty
- **THEN** each load has status "reset-corrupt" and returns a fresh state
#### Scenario: Fuzzed storage never crashes
- **WHEN** arbitrary strings (property test) are stored as the learner value and loaded
- **THEN** every load returns a valid learner state with status "restored" or "reset-corrupt" and never throws

