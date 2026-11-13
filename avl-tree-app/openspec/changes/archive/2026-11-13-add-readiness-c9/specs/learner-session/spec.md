# learner-session Delta

## ADDED Requirements

### Requirement: Screens can record an own question
The session SHALL let a screen add one of the student's own questions, trimmed and capped at 300 characters, saved like any other change; a blank question SHALL change nothing. (FR-RDY-02)

#### Scenario: Added
- **WHEN** "  Why rotate at the lowest node?  " is added and the app is reloaded
- **THEN** the restored list holds "Why rotate at the lowest node?"

#### Scenario: Blank
- **WHEN** an empty or spaces-only question is added
- **THEN** nothing is written
