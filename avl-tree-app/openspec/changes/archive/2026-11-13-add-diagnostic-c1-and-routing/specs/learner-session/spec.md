# learner-session Delta

## ADDED Requirements

### Requirement: Screens can set the learning path
The session SHALL let a screen set the learning path to "guided" or "diagnostic skipped", saved like any other change; setting the value it already has SHALL change nothing. (FR-DIA-04)

#### Scenario: Saved
- **WHEN** the path is set to "diagnostic skipped" and the app is reloaded
- **THEN** the restored state has that path

#### Scenario: No-op
- **WHEN** the path is set to the value it already has
- **THEN** nothing is written
