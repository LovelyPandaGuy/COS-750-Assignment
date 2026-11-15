# narration Specification

## Purpose
Reads the current lesson screen aloud with an on-device voice when the student asks, using only the words already on the screen, so a student can listen as well as read (ID 8.1, ID 11, D26) without any text leaving the device (NFR-05).

## Requirements

### Requirement: Read aloud on every lesson screen when narration is on
With the narration setting on and an on-device voice available, every lesson screen SHALL show a Read aloud control directly under the screen heading. With the setting off, or with no on-device voice, no narration control SHALL be shown. Nothing SHALL be spoken until the student activates Read aloud. (ID 8.1, D145, proposal questions 1, 5 and 7)

#### Scenario: Shown when on
- **GIVEN** narration on and a fake speech engine with one on-device English voice
- **WHEN** any lesson screen is shown
- **THEN** a Read aloud button is shown after the screen heading, and nothing has been spoken

#### Scenario: Hidden when off
- **GIVEN** narration off
- **WHEN** a lesson screen is shown
- **THEN** there is no Read aloud button

#### Scenario: No automatic speech on a screen change
- **GIVEN** narration on
- **WHEN** the student moves to the next screen
- **THEN** nothing is spoken until Read aloud is activated

### Requirement: Reads the visible screen in reading order, words from the screen only
Read aloud SHALL speak, in document order, the text of the screen's marked parts that are currently visible: the heading, the main text and points, each tree's text description, the step caption, an open rule or hint, the support text, a question's stem and options, and feedback once shown. It SHALL NOT speak buttons, the position line or the top bar, and SHALL NOT add words of its own. (D146, guardrail "never invent teaching content", proposal question 2)

#### Scenario: Text screen
- **GIVEN** a lesson screen with a heading, a paragraph and two points
- **WHEN** Read aloud is activated
- **THEN** the fake engine receives the heading, the paragraph and the two points, in that order, and no button label

#### Scenario: Tree screen
- **GIVEN** a screen showing a tree
- **WHEN** Read aloud is activated
- **THEN** the spoken text includes the tree's text description, word for word as the Describe button shows it

#### Scenario: Hidden parts are not read
- **GIVEN** a screen whose hint panel is closed
- **WHEN** Read aloud is activated
- **THEN** the hint text is not spoken; after the hint is opened and Read aloud is activated again, it is

#### Scenario: Question and feedback
- **GIVEN** a check question that has been answered and shows feedback
- **WHEN** Read aloud is activated
- **THEN** the stem, the options and the feedback text are spoken, in that order

### Requirement: Pause, resume and stop
While speaking, the control SHALL offer Pause and Stop; while paused, Resume and Stop. Each control SHALL name its action in words and be at least 44 by 44 px, operable by keyboard, touch and pointer. Speech SHALL stop when the screen changes, when narration is turned off, and when the page is hidden. (D148, NFR-02, D3)

#### Scenario: Pause and resume
- **WHEN** Read aloud is activated, then Pause, then Resume
- **THEN** the engine is paused and resumed once each, and the control reads Pause, then Resume, then Pause

#### Scenario: Stop
- **WHEN** Stop is activated while speaking
- **THEN** the engine is cancelled and the control reads Read aloud again

#### Scenario: Screen change stops speech
- **GIVEN** speech in progress
- **WHEN** the student presses Next
- **THEN** the engine is cancelled and the new screen shows Read aloud

#### Scenario: Hidden page stops speech
- **GIVEN** speech in progress
- **WHEN** the page becomes hidden
- **THEN** the engine is cancelled

#### Scenario: Keyboard and targets
- **WHEN** the control is reached with Tab and activated with Enter or Space
- **THEN** it acts as a click, every control is at least 44 by 44 px, and axe reports no violations

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

### Requirement: Labels from content
Every narration label and note SHALL come from `src/content/narration.ts`, and no wrong-answer wording SHALL be used. (D18, D27)

#### Scenario: Labels
- **WHEN** the controls and the unavailable note are rendered
- **THEN** each visible word is a value from the narration content file
