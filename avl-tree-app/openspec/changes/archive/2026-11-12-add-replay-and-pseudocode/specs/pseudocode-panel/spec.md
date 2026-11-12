# Spec Delta

## Purpose

Shows the pseudocode for the operation being replayed and lights up the line the engine says the current step is on, so the student links each change in the tree to a line of the algorithm.

## ADDED Requirements

### Requirement: Listings match the engine's line numbers
The panel SHALL hold one listing per operation: the insert outline (5 lines), the search loop form (7 lines) and the search recursive form (5 lines). Line k of each listing SHALL be the line the engine means by `pseudocodeLine` k for that operation. Listing text is generic pseudocode (D12) and is flagged for the user. [Assumed: insert uses the ID's five-step C6 outline, proposal question 2.] (FR-VIS-04, D5, D12)

#### Scenario: Every engine line exists
- **WHEN** every value of the engine's insert line map, loop line map and recursive line map is looked up in its listing
- **THEN** each value is a line number from 1 to that listing's length

#### Scenario: Line purposes
- **WHEN** the three listings are read
- **THEN** in the loop listing line 4 tests `k == v.key`, line 5 goes left, line 6 goes right and line 7 returns null
- **AND** in the recursive listing line 2 handles the empty subtree and line 3 tests `k == v.key`
- **AND** in the insert outline line 1 is the BST insert, line 2 updates heights going up, line 3 finds the lowest unbalanced node, line 4 works out the case and line 5 rotates

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

### Requirement: Case named beside the line
On an imbalance or rotation step the panel SHALL show the step's case (LL, RR, LR or RL) as text beside the highlighted line. On other steps no case SHALL be shown. (FR-VIS-04, FR-ENG-04)

#### Scenario: Case shown
- **GIVEN** the 9-step insert of 10 into 30 with left child 20
- **WHEN** the replay is at position 8 or 9
- **THEN** the panel shows "LL" beside the highlighted line
- **AND WHEN** it is at position 7 **THEN** no case is shown

#### Scenario: Case equals the engine's case
- **GIVEN** any insert trace from the property generator
- **THEN** at every imbalance and rotation step the case shown equals that step's `rebalanceCase`

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
