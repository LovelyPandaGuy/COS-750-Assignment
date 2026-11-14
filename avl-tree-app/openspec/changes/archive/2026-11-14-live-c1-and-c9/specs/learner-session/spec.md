# Spec Delta

## MODIFIED Requirements

### Requirement: Screens can record lecture questions, and status follows attempts
The session SHALL let a screen record a lecture question, saved like any other change; recording one for an item that already has one SHALL change nothing. Recording an attempt SHALL store the attempt only: no sub-skill status is kept (the old mastery rule is removed; the ID's mastery is per lesson, ID 9.3). (FR-RDY-02)

#### Scenario: Recorded once
- **WHEN** a lecture question is recorded twice for the same item
- **THEN** the learner state holds it once and the second call writes nothing

#### Scenario: Survives reload
- **WHEN** a lecture question is recorded and the app is reloaded
- **THEN** it is restored

#### Scenario: Status in the same change
- **WHEN** an attempt is recorded
- **THEN** the saved state holds the attempt and no sub-skill status

## REMOVED Requirements

### Requirement: Screens can set the learning path
**Reason**: The only other path was "diagnostic skipped", and the ID offers no way to skip C1's readiness questions (ID 7.2, 8.2).
**Migration**: The learner's path is always the guided order; see `lesson-c1` "No skipping the readiness check".
