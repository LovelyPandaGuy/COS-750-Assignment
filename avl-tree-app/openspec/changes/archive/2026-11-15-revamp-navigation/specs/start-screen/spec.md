# Spec Delta

## MODIFIED Requirements

### Requirement: Message when progress is not saved
When persistence is off, the Start screen SHALL show a short message that progress will not be kept after the tab closes, in a polite live region. No status pill SHALL be shown in the TopBar in either case. (NFR-06, D157)

#### Scenario: Storage blocked
- **WHEN** the app starts over a storage whose every call throws
- **THEN** the Start screen shows the not-being-saved message, no pill is shown, and no error is thrown

#### Scenario: Storage working
- **WHEN** the app starts over working storage
- **THEN** no pill is shown on the Start screen or a module screen, and the not-being-saved message is absent

#### Scenario: Storage fills during the session
- **GIVEN** the app started with working storage
- **WHEN** a save fails because storage is full and the Start screen is shown again
- **THEN** the not-being-saved message is shown

### Requirement: Copy comes from content
Every piece of text on the Start screen, ResumeCard, confirmation dialog, status messages and module placeholder SHALL come from `src/content/`. The module titles SHALL be the lesson titles from `src/live_content/lessons/` (D92 supersedes D1's titles). (CLAUDE.md content rules; ID 7.1)

#### Scenario: No literal copy in components
- **WHEN** the Start page, ResumeCard, ConfirmDialog, StorageNotice and module placeholder sources are read
- **THEN** their visible strings are imported from `src/content/`, not written as literals

#### Scenario: D1 titles
- **WHEN** the module titles are read from content
- **THEN** there is one title for each of `C1` to `C9`, each equal to the `title` of its lesson file
