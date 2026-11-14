# ui-progress (delta)

## ADDED Requirements

### Requirement: Progress states are in the state matrix and meet the quality bar
Each state of the start screen, the hub, the progress map, the lesson menu and the reset confirmation SHALL have a state-matrix entry, and each entry SHALL pass the ui-foundation quality-bar requirements: three widths in light and dark, axe, the keyboard walk, the colour simulations and forced colours, targets and text size, reduced motion, and calm wording. (Quality bar 1 to 10, ui-quality-sweep)

#### Scenario: States listed
- **WHEN** the state-matrix manifest is read
- **THEN** it has an entry for each of these states: first visit, returning with saved progress, storage unavailable (session-only), each lesson state (done, current, open, locked), the lesson menu open, the reset confirmation open

#### Scenario: Entries pass
- **WHEN** the matrix spec and the quality checks run on those entries
- **THEN** each has a matching baseline at 390, 768 and 1366 px in light and dark, and each quality-bar check passes or is recorded as a deferred finding in the change that deferred it
