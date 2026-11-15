# Spec Delta

## MODIFIED Requirements

### Requirement: Every route is in the shell
Every screen SHALL render inside the app shell, with the "Lessons" sidebar (`lesson-sidebar`), no status pill, and exactly one level-1 heading in `main`. (NFR-02, design principle 3, D155, D157)

#### Scenario: Shell and pill
- **WHEN** each route is rendered with working storage, then with storage that throws
- **THEN** each has one banner, one "Lessons" navigation, one main and one level-1 heading, and no "Saved on this device" or "Not being saved" pill

#### Scenario: No accessibility violations
- **WHEN** each route is rendered
- **THEN** axe reports no violations
