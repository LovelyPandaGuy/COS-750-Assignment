# learner-storage Delta

## ADDED Requirements

### Requirement: Own lecture questions are stored
The learner state SHALL hold a list of the student's own questions, each with its text (1 to 300 characters, trimmed) and a time. A saved state without the list SHALL load as an empty list; a list or entry of the wrong type SHALL make the state corrupt. The stored-data inventory SHALL say that this text is typed by the student, stays in the browser, and should not include a name or student number. (FR-RDY-02, NFR-05, NFR-06)

#### Scenario: Older save
- **WHEN** a valid saved state with no own questions is loaded
- **THEN** the status is "restored" and the list is empty

#### Scenario: Tampered
- **WHEN** the list is a string, or an entry's text is empty
- **THEN** the load status is "reset-corrupt"

#### Scenario: Inventory
- **WHEN** the learner key's inventory entry is read
- **THEN** it mentions the student's own questions
