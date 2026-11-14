# pseudocode-panel Specification

## Purpose
Shows the pseudocode for the operation being replayed and lights up the line the engine says the current step is on, so the student links each change in the tree to a line of the algorithm.

## Requirements

### Requirement: Listings match the engine's line numbers
The panel SHALL hold the ID's two search listings, taken from `conventions.json` (`pseudocode.search-loop` and `pseudocode.search-recursive`, nine lines each). Line k of each listing SHALL be the line the engine means by `pseudocodeLine` k for that form. There SHALL be no insert listing, because the ID has none (ID 7.4, ID 8.1). (FR-VIS-04, D5; supersedes D12's generic text and D30)

#### Scenario: Every engine line exists
- **WHEN** every value of `lineForStep.search-loop` and `lineForStep.search-recursive` is looked up in its listing
- **THEN** each value is a line number from 1 to 9

#### Scenario: Line purposes
- **WHEN** the two listings are read
- **THEN** in the loop listing line 4 tests "if element in node p equals el", line 7 is "p = p.left", line 8 is "else p = p.right" and line 9 returns null
- **AND** in the recursive listing line 2 tests "if root is null" and line 4 tests "else if element in root equals el"

#### Scenario: No insert listing
- **WHEN** an insert is replayed in a lesson or the sandbox
- **THEN** no pseudocode panel is shown

### Requirement: Current line is highlighted
At position p ≥ 1 the panel SHALL highlight exactly one line, the `pseudocodeLine` of trace step p − 1. At position 0 no line SHALL be highlighted. The highlighted line SHALL differ by the `--code-highlight` background, a bold weight, a "▶" marker and `aria-current="step"`, so colour is not the only signal, and its text contrast SHALL be at least 4.5:1. (FR-VIS-04, FR-VIS-02, NFR-02, wireframe 1f note 3)

#### Scenario: Insert example
- **GIVEN** the 9-step insert of 10 into 30 with left child 20
- **THEN** positions 1 to 5 highlight line 1, positions 6 and 7 highlight line 2, position 8 highlights line 3 and position 9 highlights line 5
- **AND** position 0 highlights no line

#### Scenario: Automated check over all engine traces
- **GIVEN** any insert trace and any loop or recursive search trace from the property generator
- **THEN** at every position p ≥ 1 exactly one line carries `aria-current="step"`, it is line `trace[p − 1].pseudocodeLine`, and it is the only line with the ▶ marker

#### Scenario: Greyscale
- **WHEN** the highlighted line's styles are read
- **THEN** it has the ▶ marker text and a bold weight, and `--text-primary` on `--code-highlight` has a contrast ratio of at least 4.5:1 in both the light and dark themes

### Requirement: Loop or recursive search
For a search the panel SHALL offer a choice between the loop and recursive forms as two native radio inputs, with loop selected first. Choosing a form SHALL show that listing and SHALL replay the engine's trace for that form from position 0. (FR-VIS-04, D5)

#### Scenario: Switch form
- **GIVEN** a search replay of 30 in the tree 20 with children 10 and 30, at position 3 in loop form
- **WHEN** the student chooses Recursive
- **THEN** the recursive listing is shown, the position is 0, and stepping to position 1 highlights recursive line 3

#### Scenario: Insert has no form choice
- **WHEN** the panel shows an insert
- **THEN** no form choice is shown

### Requirement: Panel is readable by assistive technology
The listing SHALL be an ordered list in a region named by the operation (for example "Pseudocode: AVL insert"), with each line's number readable as text, the `--type-mono` token [flagged: 15 px, below the 16 px running-text rule; the design system sets it for code], and lines that wrap at 360 px instead of scrolling the page. The panel SHALL NOT be a tab stop of its own beyond the form choice. (NFR-02, FR-VIS-10)

#### Scenario: Structure
- **WHEN** the panel is rendered for an insert
- **THEN** there is a region with an accessible name that names the operation, containing an ordered list of 5 items, and the panel has no axe violations
