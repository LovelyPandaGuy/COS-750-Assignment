# display-settings (delta)

## ADDED Requirements

### Requirement: Narration can be turned on where the device can speak
The narration switch SHALL be enabled when the browser offers speech with at least one on-device voice, and its choice SHALL be kept in settings storage like the other settings and survive a reload. Where no on-device voice exists, the switch SHALL be shown off and disabled with the note from the narration content, and a stored "on" SHALL have no effect. (ID 8.1, D115, D145, D147, NFR-05)

#### Scenario: Turned on and kept
- **GIVEN** a fake speech engine with an on-device voice
- **WHEN** the student turns "Read text aloud (text-to-speech)" on and reloads
- **THEN** the switch is On and enabled

#### Scenario: No on-device voice
- **GIVEN** no speech support, or only remote voices
- **WHEN** the settings screen or the Aa menu is shown
- **THEN** the narration switch is Off and disabled, with the "cannot read aloud on this device" note

#### Scenario: Damaged value
- **GIVEN** a stored settings value whose narration is not a boolean
- **WHEN** the settings are loaded
- **THEN** narration takes its default, Off, and the other settings are kept

## REMOVED Requirements

### Requirement: Narration comes later
**Reason**: Narration is built by this change (add-narration, D145).
**Migration**: Replaced by "Narration can be turned on where the device can speak". The "Added in a later update" line is no longer shown for narration.
