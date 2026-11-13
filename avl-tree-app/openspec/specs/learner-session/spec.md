# learner-session Specification

## Purpose

Gives every screen one shared copy of the learner's state for the session. Stored data is read once when the app starts, every change is saved, and screens can tell whether the data was restored, started fresh or is not being saved.

## Requirements

### Requirement: One load per app start
The system SHALL read stored learner data exactly once when the app starts, before the first screen is shown, and SHALL keep the load status from that read for the whole session. Rendering a screen again SHALL NOT read storage again or change the status. (FR-ONB-03, NFR-06)

#### Scenario: Status survives re-rendering
- **GIVEN** storage holds corrupt learner data
- **WHEN** the app starts and its screens render more than once (including the development double-render)
- **THEN** storage was read once, the load status is "reset-corrupt", and it is still "reset-corrupt" after the extra renders

#### Scenario: First launch status
- **WHEN** the app starts over empty storage
- **THEN** the load status is "new" and a fresh learner state is available to every screen

### Requirement: Restore on return
When valid learner data is stored, every screen SHALL see exactly that state after the app starts: the same current module, completed modules, sub-skill results and attempts. (FR-ONB-03)

#### Scenario: Reload restores state
- **GIVEN** storage holds a valid state with current module `C4`, completed modules `C1` to `C3`, two attempts and two sub-skill results
- **WHEN** the app starts
- **THEN** the load status is "restored" and the state every screen sees deep-equals the stored state

### Requirement: Changes are saved
Every change to the learner state SHALL be saved through the storage adapter, so that a reload directly after a change restores it. Starting the app SHALL NOT write anything beyond what the storage adapter's load already wrote. (FR-ONB-03)

#### Scenario: Save after change
- **GIVEN** the app has started
- **WHEN** the learner state changes (in this change, by a reset)
- **THEN** the storage adapter holds the new state, and a second app start over the same storage restores it

#### Scenario: No extra save on start
- **WHEN** the app starts over storage holding a valid state
- **THEN** no save is made until the state changes

### Requirement: Persistence status is visible to screens
Screens SHALL be able to tell whether progress is being saved. The flag SHALL be off from the start when storage cannot be reached, and SHALL turn off during the session as soon as a save fails. (NFR-06)

#### Scenario: Storage blocked at start
- **WHEN** the app starts over a storage whose every call throws
- **THEN** the app renders without throwing, screens see persistence as off and a fresh state

#### Scenario: Storage fills up later
- **GIVEN** the app started with working storage and persistence is on
- **WHEN** a later save fails because storage is full
- **THEN** screens see persistence as off without a reload, and the state they see is the one that was being saved

### Requirement: Reset from any screen
Screens SHALL be able to reset the learner. A reset SHALL clear the stored data through the storage adapter, SHALL replace the session state with the fresh state the adapter returns (new profile ID), and SHALL record that a reset happened so the Start screen can say so. (FR-ONB-04)

#### Scenario: Reset replaces state
- **GIVEN** the app started with a stored state that has attempts and current module `C4`
- **WHEN** reset is called
- **THEN** screens see a fresh state with current module `C1`, no attempts and a profile ID different from before, the adapter holds that fresh state, and the session records that a reset happened

#### Scenario: Reset clears the corrupt-data notice
- **GIVEN** the app started with load status "reset-corrupt"
- **WHEN** reset is called
- **THEN** screens no longer see the "reset-corrupt" status, only the reset

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
