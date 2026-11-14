# Spec Delta

## MODIFIED Requirements

### Requirement: Resume on return
When the learner has saved progress, the Start screen SHALL show the ResumeCard instead of the Start button. The card SHALL name the current module by its ID and its lesson title (from its lesson file, D92). Its Resume button SHALL open that module. (FR-ONB-03; wireframe 1b note 2; ID 7.1)

#### Scenario: Return visit
- **GIVEN** storage holds a valid state with current module `C4` and completed modules `C1` to `C3`
- **WHEN** the app starts
- **THEN** the ResumeCard is shown and contains "C4" and "Search (the algorithm)", the Start button is absent, and the reset link is present

#### Scenario: Resume
- **GIVEN** the return visit above
- **WHEN** a save fails because storage is full and the Start screen is shown again
- **THEN** the pill shows the not-saved text and the not-being-saved message is shown

### Requirement: Copy comes from content
Every piece of text on the Start screen, ResumeCard, confirmation dialog, status messages, pill and module placeholder SHALL come from `src/content/`. The module titles SHALL be the lesson titles from `src/live_content/lessons/` (D92 supersedes D1's titles). (CLAUDE.md content rules; ID 7.1)

#### Scenario: No literal copy in components
- **WHEN** the Start page, ResumeCard, ConfirmDialog, StorageNotice and module placeholder sources are read
- **THEN** their visible strings are imported from `src/content/`, not written as literals

#### Scenario: D1 titles
- **WHEN** the module titles are read from content
- **THEN** there is one title for each of `C1` to `C9`, each equal to the `title` of its lesson file
