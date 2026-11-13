# question-bank Delta

## MODIFIED Requirements

### Requirement: A check for each module from C2 to C8
Modules C2, C3, C4, C5, C6, C7 and C8 SHALL each have 2 or 3 check items, and together they SHALL cover each module's outcomes: C2 LO1, C3 LO2 and LO3, C4 LO4, C5 LO6, C6 LO7, C7 LO8, C8 LO9. C7's items SHALL be tagged optional, and no other module's items SHALL be. C1 SHALL have the five diagnostic items, tagged `PRE` and not optional, and C9 none in this bank. (FR-ASM-01, FR-DIA-01, D4, D15)

#### Scenario: Item counts
- **WHEN** the bank is grouped by module
- **THEN** each of C2 to C8 has 2 or 3 items, C1 has five, and C9 has none in this bank

#### Scenario: Outcomes covered
- **WHEN** the outcomes of each module's items are collected
- **THEN** each of C2 to C8 covers the outcomes listed above, and every C1 item is `PRE`

#### Scenario: C7 is optional
- **WHEN** the bank is read
- **THEN** every C7 item is optional and every other item is not
