# display-settings Specification

## Purpose
Keeps the display settings that C1's settings screen and the Aa menu offer (larger text, confetti, narration), so a setting chosen once stays chosen.

## Requirements

### Requirement: The settings from the lesson file
The settings screen and the Aa menu SHALL offer the settings listed in `c1.json` (`confetti`, `narration`, `textSize`), with their labels and defaults, as switches that say On or Off in words. A change SHALL be kept in settings storage and SHALL survive a reload. (ID 7.2 C1, ID 10.4 "once it is off it stays off")

#### Scenario: Defaults
- **WHEN** a fresh learner opens the settings screen
- **THEN** "Confetti when a lesson is completed" is On, "Read text aloud (text-to-speech)" is Off and "Larger text" is Off

#### Scenario: Kept
- **WHEN** confetti is turned off and the app reloads
- **THEN** it is still off

### Requirement: Larger text
With Larger text on, the app's root text size SHALL increase so every token-based font grows together, without horizontal page scroll at 360 px. (ID 11.2)

#### Scenario: Text grows
- **WHEN** Larger text is turned on
- **THEN** the root element carries the larger-text setting and the body text size computed from tokens increases

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
