# Spec Delta

## MODIFIED Requirements

### Requirement: Content errors are shown on one screen
When validation reports any content error, the app SHALL show a "Content problem" screen instead of a lesson. It SHALL list every error with its file, item id, field and a plain sentence, in a level-1 heading and a list readable by assistive technology. The rest of the shell (top bar, theme, sidebar, and the link back to the current lesson) SHALL keep working. (User request 13 Nov, NFR-02, D159)

#### Scenario: Error screen
- **GIVEN** content with two errors
- **WHEN** a lesson is opened
- **THEN** a "Content problem" heading and a list of two items are shown, each naming its file and item id, and no lesson screen is shown

#### Scenario: Error screen is accessible
- **WHEN** the error screen is rendered
- **THEN** axe reports no violations
