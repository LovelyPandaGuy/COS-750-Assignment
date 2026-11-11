# start-screen Specification

## Purpose

The screen a student sees first on every visit. It explains the app, starts a first-time student, resumes a returning one, offers a reset with a confirmation step, and says plainly when stored progress was replaced or is not being saved.

## Requirements

### Requirement: No sign-in
The Start screen and the module placeholder SHALL contain no field for a credential, email address, student number or password. (FR-ONB-01)

#### Scenario: No credential fields
- **WHEN** the Start screen renders on a first visit and on a return visit, and the module placeholder renders
- **THEN** none contains an `input` of type `password` or `email`, nor any field whose label mentions password, email, student number or login

### Requirement: First visit
When the learner has no saved progress, the Start screen SHALL show the StartPanel heading, its intro text and a Start button, and SHALL NOT show the ResumeCard or the reset link. A learner has saved progress when the current module is not `C1`, or at least one module is completed, or at least one attempt is recorded. (Wireframe 1b; FR-ONB-02)

#### Scenario: Fresh learner
- **WHEN** the app starts over empty storage
- **THEN** the Start screen shows one level-1 heading and the Start button, and no ResumeCard and no reset link

#### Scenario: Restored but no progress
- **GIVEN** storage holds a valid state at `C1` with no completed modules and no attempts
- **WHEN** the app starts
- **THEN** the Start screen shows the first-visit layout

### Requirement: Start reaches C1 in one step
Activating the Start button SHALL open module C1 at once, with no step in between. (NFR-01: C1 content within 3 clicks; SE §6.5)

#### Scenario: Start
- **GIVEN** a first visit
- **WHEN** the Start button is activated by click, or by Enter while it has focus
- **THEN** the module screen for `C1` is shown, with its D1 title as the level-1 heading

### Requirement: Resume on return
When the learner has saved progress, the Start screen SHALL show the ResumeCard instead of the Start button. The card SHALL name the current module by its ID and D1 title. Its Resume button SHALL open that module. (FR-ONB-03; wireframe 1b note 2)

#### Scenario: Return visit
- **GIVEN** storage holds a valid state with current module `C4` and completed modules `C1` to `C3`
- **WHEN** the app starts
- **THEN** the ResumeCard is shown and contains "C4" and the D1 title of C4, the Start button is absent, and the reset link is present

#### Scenario: Resume
- **GIVEN** the return visit above
- **WHEN** Resume is activated
- **THEN** the module screen for `C4` is shown

### Requirement: Module screen placeholder
Until the module screens exist, each module ID `C1` to `C9` SHALL have a placeholder screen that shows only that module's D1 title as its heading. Any other module ID SHALL go to the Start screen. (D1; SE §6.5)

#### Scenario: Known module
- **WHEN** the module screen for each of `C1` to `C9` is opened directly
- **THEN** its level-1 heading is that module's D1 title

#### Scenario: Unknown module
- **WHEN** the module screen for `C10` is opened directly
- **THEN** the Start screen is shown

### Requirement: Reset asks first
Activating the reset link SHALL open a confirmation dialog and SHALL NOT clear anything yet. The dialog SHALL be modal, SHALL be named by its title and described by its body text, and SHALL move focus to its Cancel button. (FR-ONB-04: reset needs a confirmation step; wireframe 1b note 4)

#### Scenario: Dialog opens
- **GIVEN** a return visit
- **WHEN** the reset link is activated
- **THEN** a dialog with `aria-modal="true"` is shown, its accessible name is the dialog title, its description is the body text, focus is on Cancel, and storage still holds the earlier state

### Requirement: Focus stays in the dialog
While the confirmation dialog is open, keyboard focus SHALL stay inside it and the rest of the page SHALL be inert. (NFR-02; wireframe 1b note 4)

#### Scenario: Tab wraps
- **GIVEN** the dialog is open with focus on Cancel
- **WHEN** Tab is pressed until focus has passed the last control, then Shift+Tab is pressed from the first control
- **THEN** focus moves only between Cancel and Reset and never leaves the dialog

#### Scenario: Page behind is inert
- **GIVEN** the dialog is open
- **WHEN** the accessibility tree is read
- **THEN** the TopBar and the Start screen content behind the dialog are not reachable (inert or hidden from assistive technology)

### Requirement: Cancel keeps progress
Cancel and the Escape key SHALL close the dialog, SHALL return focus to the reset link, and SHALL leave the stored data and the screen unchanged. (FR-ONB-04; wireframe 1b note 4, Esc cancels)

#### Scenario: Cancel button
- **GIVEN** the dialog is open
- **WHEN** Cancel is activated
- **THEN** the dialog is gone, focus is on the reset link, storage holds the earlier state, and the ResumeCard still shows `C4`

#### Scenario: Escape
- **GIVEN** the dialog is open
- **WHEN** Escape is pressed
- **THEN** the result is the same as Cancel

### Requirement: Confirmed reset returns to the start
Confirming the reset SHALL clear all stored app data and SHALL show the first-visit Start screen. The Start screen SHALL announce that progress was reset and SHALL move focus to its heading. (FR-ONB-04: clears all stored data and returns to the start screen)

#### Scenario: Reset confirmed
- **GIVEN** a return visit with an extra app-prefixed key and an unrelated key in storage
- **WHEN** the reset link is activated and then Reset in the dialog
- **THEN** the dialog is gone, the Start button is shown and the ResumeCard is not, the reset message is shown in a polite live region, focus is on the level-1 heading, the extra app-prefixed key is gone, the unrelated key is unchanged, and a new app start shows the first-visit layout

### Requirement: Message when stored data was replaced
When the load status is "reset-corrupt", the Start screen SHALL show a short message that saved progress could not be read and the app started fresh. The message SHALL be in a polite live region, SHALL carry an icon and words (not colour alone), and SHALL NOT use red, "error", "fail", "corrupt" or "invalid" wording. (NFR-06: starts fresh with a message instead of crashing)

#### Scenario: Corrupt data
- **GIVEN** storage holds `{not json` as the learner value
- **WHEN** the app starts
- **THEN** no error is thrown, the Start screen shows the first-visit layout and the started-fresh message in a polite live region

#### Scenario: Wording and style
- **WHEN** the started-fresh, not-being-saved and reset messages are read from content, and their styles are read
- **THEN** no message contains "error", "fail", "corrupt" or "invalid" (any case), and their styles use no `--feedback-notyet-*` or `--mastery-notyet*` token and no colour value outside `tokens.css`

#### Scenario: No message on a normal start
- **WHEN** the app starts over empty storage, or over a valid stored state
- **THEN** the started-fresh message is absent

### Requirement: Message when progress is not saved
When persistence is off, the Start screen SHALL show a short message that progress will not be kept after the tab closes, in a polite live region. The TopBar SHALL show a status pill on every screen: a saved variant when persistence is on and a not-saved variant when it is off. (NFR-06; wireframe 1e "Saved on this device")

#### Scenario: Storage blocked
- **WHEN** the app starts over a storage whose every call throws
- **THEN** the Start screen shows the not-being-saved message, the TopBar pill shows the not-saved text, and no error is thrown

#### Scenario: Storage working
- **WHEN** the app starts over working storage
- **THEN** the TopBar pill shows the saved text on the Start screen and on a module screen, and the not-being-saved message is absent

#### Scenario: Storage fills during the session
- **GIVEN** the app started with working storage
- **WHEN** a save fails because storage is full and the Start screen is shown again
- **THEN** the pill shows the not-saved text and the not-being-saved message is shown

### Requirement: Copy comes from content
Every piece of text on the Start screen, ResumeCard, confirmation dialog, status messages, pill and module placeholder SHALL come from `src/content/`. The module titles SHALL be the D1 titles. (CLAUDE.md content rules; D1)

#### Scenario: No literal copy in components
- **WHEN** the Start page, ResumeCard, ConfirmDialog, StorageNotice and module placeholder sources are read
- **THEN** their visible strings are imported from `src/content/`, not written as literals

#### Scenario: D1 titles
- **WHEN** the module titles are read from content
- **THEN** there is one title for each of `C1` to `C9`, matching D1

### Requirement: Accessible Start screen
The Start screen and dialog SHALL pass axe in every state, every control SHALL be operable by keyboard alone, and every button and the reset link SHALL have a target of at least 44 px. (NFR-02, D3, FR-VIS-10)

#### Scenario: Axe in every state
- **WHEN** axe runs on the first visit, the return visit, the dialog open, after a confirmed reset, with the started-fresh message and with the not-being-saved message
- **THEN** it reports no violations

#### Scenario: Keyboard only
- **GIVEN** a return visit
- **WHEN** the student uses only Tab, Shift+Tab, Enter, Space and Escape
- **THEN** they can reach and activate Resume, open the dialog, cancel it, open it again and confirm the reset

#### Scenario: Targets
- **WHEN** the Start screen and dialog stylesheet rules are read
- **THEN** the Start, Resume, Cancel and Reset buttons and the reset link have `min-height: var(--target-min)`
