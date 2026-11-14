# Spec Delta

## Purpose

Keeps the display settings that C1's settings screen and the Aa menu offer (larger text, confetti, narration), so a setting chosen once stays chosen.

## ADDED Requirements

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

### Requirement: Narration comes later
The narration switch SHALL be shown off and disabled, with "Added in a later update", until text-to-speech is built. (D26, proposal item 6)

#### Scenario: Disabled
- **WHEN** the settings screen is shown
- **THEN** the narration switch is disabled and the line is shown
