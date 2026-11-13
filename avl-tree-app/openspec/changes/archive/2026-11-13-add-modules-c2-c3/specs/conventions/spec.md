# Spec Delta

## ADDED Requirements

### Requirement: Balance-factor order and range are exported
The conventions module SHALL export which subtree's height comes first in the balance factor (the minuend) and which second, and the allowed balance factors. These SHALL agree with `balanceFactor` and `isOutOfBalance`. Under D2 the order is left then right and the range is -1, 0, +1. (D2, D19)

#### Scenario: Order agrees with the function
- **WHEN** the exported order is read and `balanceFactor` is called with a first-side height of 1 and a second-side height of -1
- **THEN** the order is left then right and the result is +2

#### Scenario: Range agrees with the test
- **WHEN** every whole number from -3 to 3 is checked
- **THEN** it is in the exported range exactly when `isOutOfBalance` is false

### Requirement: Sign and lean wording comes from the conventions
The balance-factor formula, the phrase saying which way a positive or negative balance factor leans, and case names shown to a student SHALL be built from the conventions module's exports (order, `leanOf`, case names), in one content file. Changing the order in the conventions module SHALL change that wording with no other edit. (D19)

#### Scenario: Wording follows the order
- **WHEN** the conventions wording is built with the order left then right, and again with the order right then left
- **THEN** the formula text names left first in the first case and right first in the second

#### Scenario: Lean follows leanOf
- **WHEN** the lean phrase is built for +2 and for -2
- **THEN** each names the side `leanOf` returns for that balance factor
