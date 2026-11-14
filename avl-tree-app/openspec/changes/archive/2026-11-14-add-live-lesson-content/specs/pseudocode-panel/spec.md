# Spec Delta

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Case named beside the line
**Reason**: The case was shown beside the insert outline's lines, and the ID has no insert pseudocode (ID 7.4), so the panel no longer shows inserts. Search steps have no case.
**Migration**: The case of an insert imbalance is named in the step caption from `conventions.json` ("… Case 1 (LL).", see `step-replay` "A sentence for each step").
