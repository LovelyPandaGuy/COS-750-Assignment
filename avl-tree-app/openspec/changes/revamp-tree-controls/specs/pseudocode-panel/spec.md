## MODIFIED Requirements

### Requirement: Current line is highlighted
At position p ≥ 1 the panel SHALL highlight exactly one line: the `pseudocodeLine` of trace step p − 1. At position 0 no line SHALL be highlighted. The highlighted line SHALL be inverted: `--text-primary` background and `--bg-surface` text. It SHALL also have a bold weight, a "▶" marker and `aria-current="step"`, so colour is not the only signal. Its text contrast SHALL be at least 4.5:1 in both themes. (FR-VIS-04, FR-VIS-02, NFR-02, wireframe 1f "Current line = inverted + ▶ marker", D104)

#### Scenario: Insert example
- **GIVEN** the 9-step insert of 10 into 30 with left child 20
- **THEN** positions 1 to 5 highlight line 1, positions 6 and 7 highlight line 2, position 8 highlights line 3 and position 9 highlights line 5
- **AND** position 0 highlights no line

#### Scenario: Automated check over all engine traces
- **GIVEN** any insert trace and any loop or recursive search trace from the property generator
- **THEN** at every position p ≥ 1 exactly one line carries `aria-current="step"`, it is line `trace[p − 1].pseudocodeLine`, and it is the only line with the ▶ marker

#### Scenario: Inverted, and greyscale-safe
- **WHEN** the highlighted line's styles are read from `replay.css`
- **THEN** its background is `var(--text-primary)`, its colour is `var(--bg-surface)`, it has the ▶ marker text and a bold weight
- **AND** `--bg-surface` on `--text-primary` has a contrast ratio of at least 4.5:1 in both the light and dark themes

#### Scenario: Five-step outline (D30)
- **WHEN** the panel shows an insert
- **THEN** it lists exactly the five lines of `pseudocode.insert`, in order

### Requirement: Case named beside the line
On an imbalance or rotation step the panel SHALL show the step's case as text beside the highlighted line. The name SHALL be `conventionsWording().caseName(step.rebalanceCase)`. On other steps no case SHALL be shown. The listing itself SHALL never name a case. (FR-VIS-04, FR-ENG-04, D19, D31)

#### Scenario: Case shown
- **GIVEN** the 9-step insert of 10 into 30 with left child 20
- **WHEN** the replay is at position 8 or 9
- **THEN** the panel shows `caseName('LL')` beside the highlighted line
- **AND WHEN** it is at position 7 **THEN** no case is shown

#### Scenario: Case equals the engine's case
- **GIVEN** any insert trace from the property generator
- **THEN** at every imbalance and rotation step the case text shown equals `caseName` of that step's `rebalanceCase`, and on every other step no case text is shown
