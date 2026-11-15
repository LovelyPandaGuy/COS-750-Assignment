## MODIFIED Requirements

### Requirement: On-device voices only
Narration SHALL use only voices the browser reports as on the device, preferring one whose language is English. It SHALL never use a remote voice, and SHALL make no network request. Narration SHALL find on-device voices that the browser loads before the app starts listening for voice changes, and voices that appear without a voice-change event, within the voice re-check window (D174). (NFR-05, D147, D174, proposal question 3)

#### Scenario: Remote voices are skipped
- **GIVEN** a fake engine with a remote English voice and an on-device English voice
- **WHEN** Read aloud is activated
- **THEN** every utterance uses the on-device voice

#### Scenario: Only remote voices
- **GIVEN** a fake engine whose only voices are remote
- **WHEN** the settings are shown
- **THEN** narration is unavailable (see display-settings), and no lesson screen shows Read aloud

#### Scenario: Voices loaded before the app listens
- **GIVEN** a fake engine whose voice list is empty on the first read and holds an on-device English voice from the second read on, and which never fires a voice-change event
- **WHEN** the narration provider mounts with narration on
- **THEN** Read aloud is shown without any further event, and the narration switch is enabled

#### Scenario: Voices that appear without an event
- **GIVEN** a fake engine with no voices, and fake timers
- **WHEN** the provider mounts, and after 1 s an on-device voice is added to the list without a voice-change event
- **THEN** Read aloud is shown within one re-check interval

#### Scenario: Re-checking stops
- **GIVEN** a fake engine whose voices are never on the device, and fake timers
- **WHEN** the provider mounts and the re-check window passes
- **THEN** the voice list is no longer read, and narration stays unavailable with the "no built-in voice" note

#### Scenario: No re-check after a voice is found
- **GIVEN** a fake engine with an on-device voice from the start, and fake timers
- **WHEN** the provider mounts and the re-check window passes
- **THEN** no timer is left running

#### Scenario: No network
- **WHEN** Read aloud, Pause, Resume and Stop are used
- **THEN** `fetch` and `XMLHttpRequest` are never called
