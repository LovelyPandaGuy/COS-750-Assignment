# learner-session Delta

## ADDED Requirements

### Requirement: Screens can record lecture questions, and status follows attempts
The session SHALL let a screen record a lecture question, saved like any other change; recording one for an item that already has one SHALL change nothing. Recording an attempt at a bank item SHALL also update that item's sub-skill status in the same change. (FR-SCA-01, FR-SCA-03)

#### Scenario: Recorded once
- **WHEN** a lecture question is recorded twice for the same item
- **THEN** the learner state holds it once and the second call writes nothing

#### Scenario: Survives reload
- **WHEN** a lecture question is recorded and the app is reloaded
- **THEN** it is restored

#### Scenario: Status in the same change
- **WHEN** an attempt at a bank item is recorded
- **THEN** the saved state holds the attempt and the updated sub-skill status together
