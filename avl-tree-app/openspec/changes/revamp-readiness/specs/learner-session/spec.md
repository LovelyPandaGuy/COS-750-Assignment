## ADDED Requirements

### Requirement: Own lecture questions can be edited and removed
The session SHALL offer `editOwnQuestion(at, text)` and `removeOwnQuestion(at)`. They change or remove only the stored lecture question with ID `own` and that `at` time. An edit SHALL be trimmed and capped like a new own question, and a blank edit SHALL change nothing. Other lecture questions SHALL never change. Both SHALL be saved under the existing key, with no version change. (FR-RDY-02, revamp-readiness question 14)

#### Scenario: Edit
- **GIVEN** own questions at times t1 and t2
- **WHEN** `editOwnQuestion(t1, "  New text ")` is called
- **THEN** the t1 question reads "New text", t2 is unchanged, and the saved state holds the edit

#### Scenario: Blank edit
- **WHEN** `editOwnQuestion(t1, "   ")` is called
- **THEN** the state is unchanged

#### Scenario: Remove
- **WHEN** `removeOwnQuestion(t2)` is called
- **THEN** only t2 is gone

#### Scenario: Drafted questions untouched
- **GIVEN** a drafted question (not ID `own`) at time t3
- **WHEN** `editOwnQuestion(t3, "x")` and `removeOwnQuestion(t3)` are called
- **THEN** the drafted question is unchanged
