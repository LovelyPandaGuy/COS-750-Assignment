# learner-session Delta

## ADDED Requirements

### Requirement: Screens can record results
The session SHALL let a screen record an attempt and complete a module. Both SHALL change the learner state once, be saved like any other change, and survive a reload. Recording an attempt SHALL NOT complete a module, and completing a module already completed SHALL change nothing. An attempt that fails the learner-state validator SHALL NOT be stored. (FR-ASM-05 groundwork, FR-LRN-05)

#### Scenario: Attempt saved
- **WHEN** an attempt is recorded and the app is reloaded
- **THEN** the restored state holds that attempt

#### Scenario: Completing twice
- **WHEN** C2 is completed twice
- **THEN** the completed modules hold C2 once and the second call writes nothing

#### Scenario: Reset clears them
- **GIVEN** attempts and a completed module
- **WHEN** the learner resets
- **THEN** both are gone
