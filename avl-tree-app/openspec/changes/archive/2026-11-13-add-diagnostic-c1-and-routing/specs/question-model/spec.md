# question-model Delta

## MODIFIED Requirements

### Requirement: Every item is tagged
Every item SHALL carry an ID, the module it belongs to, its learning outcome (LO1 to LO9, or `PRE` for a C1 prerequisite item), one known sub-skill, a Bloom level (remember, understand, apply or analyse), an answer type (choice, number or tree), and whether it is optional. The item's sub-skill SHALL belong to the item's outcome. (FR-ASM-02, FR-DIA-01, D7)

#### Scenario: Complete tags pass
- **GIVEN** an item with all tags, a sub-skill of its outcome and a known level
- **WHEN** the bank validator runs
- **THEN** it reports no tag problem for that item

#### Scenario: A missing or unknown tag fails
- **GIVEN** an item with no sub-skill, an unknown level, an outcome outside LO1 to LO9 and `PRE`, or a sub-skill that belongs to a different outcome
- **WHEN** the bank validator runs
- **THEN** it reports a tag problem naming the item and the tag

#### Scenario: Prerequisite tag
- **GIVEN** a C1 item tagged `PRE` with the sub-skill `bst-search`
- **WHEN** the bank validator runs
- **THEN** it reports no tag problem, and the same item tagged `LO4` is reported
