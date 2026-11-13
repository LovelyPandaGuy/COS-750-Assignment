# question-bank Specification

## Purpose
The formative check items for modules C2 to C8, and the records they are tagged with: learning outcomes and their Bloom levels, sub-skills, and the misconception catalogue. Every answer comes from the engine; the bank holds only wording.

## Requirements

### Requirement: A check for each module from C2 to C8
Modules C2, C3, C4, C5, C6, C7 and C8 SHALL each have 2 or 3 check items, and together they SHALL cover each module's outcomes: C2 LO1, C3 LO2 and LO3, C4 LO4, C5 LO6, C6 LO7, C7 LO8, C8 LO9. C7's items SHALL be tagged optional, and no other module's items SHALL be, except C9's LO8 item. C1 SHALL have the five diagnostic items, tagged `PRE` and not optional, and C9 the eleven readiness items. (FR-ASM-01, FR-ASM-06, FR-DIA-01, D4, D14, D15)

#### Scenario: Item counts
- **WHEN** the bank is grouped by module
- **THEN** each of C2 to C8 has 2 or 3 items, C1 has five, and C9 has eleven

#### Scenario: Outcomes covered
- **WHEN** the outcomes of each module's items are collected
- **THEN** each of C2 to C8 covers the outcomes listed above, every C1 item is `PRE`, and C9 covers LO1 to LO9

#### Scenario: C7 is optional
- **WHEN** the bank is read
- **THEN** every C7 item and C9's LO8 item are optional and every other item is not

### Requirement: Item kinds
The bank SHALL include at least one item of each kind the plan names:
- multiple choice
- compute a balance factor
- identify the rebalancing case
- trace an insert (build the final tree)
- scenario choice

Every item SHALL instantiate for seeds 0 to 99. (Plan change 19, FR-ASM-01)

#### Scenario: Kinds present
- **WHEN** the answer types and kinds of the bank are collected
- **THEN** the list includes a balance-factor number item, a case choice item, a trace-an-insert tree item, a scenario choice item and at least one other multiple-choice item

### Requirement: Outcomes and Bloom levels come from the ID
The outcome record SHALL list LO1 to LO9 with the Bloom level the ID content gives each one. An item's level SHALL be its outcome's level, or one of them where the ID gives two (LO7 Apply/Analyse). (FR-ASM-02, ID content "Learning objectives")

#### Scenario: Levels match the ID
- **WHEN** the outcome record is read
- **THEN** the levels are: LO1 understand, LO2 remember, LO3 apply, LO4 apply, LO5 understand, LO6 apply, LO7 apply or analyse, LO8 apply, LO9 analyse

#### Scenario: Item level fits its outcome
- **WHEN** every item's level is compared with its outcome's levels
- **THEN** each item's level is one of them

### Requirement: Sub-skills
Each sub-skill SHALL belong to exactly one outcome and SHALL be used by at least one item in this bank or marked as reserved for a later bank (readiness). (FR-SCA-01 groundwork, SE glossary "Sub-skill")

#### Scenario: Every sub-skill has an outcome
- **WHEN** the sub-skill record is read
- **THEN** every entry names one of LO1 to LO9 and no ID repeats

### Requirement: Misconception catalogue
Each misconception SHALL have an ID, a short label, and a source mark, which is `beyond ID` for every entry this change adds. Every misconception an item can produce SHALL be in the catalogue, and every catalogue entry SHALL be produced by at least one item. C8's scenario misconceptions SHALL map one-to-one onto the comparison record's needs. A misconception's label SHALL NOT state the balance-factor formula, which way a sign leans, or a case name. (FR-ASM-02, FR-ASM-03, D19, user choice 12 Nov)

#### Scenario: Catalogue and bank agree
- **WHEN** the misconceptions produced by every item over seeds 0 to 99 are collected
- **THEN** each is in the catalogue, and each catalogue entry appears at least once

#### Scenario: Flagged for review
- **WHEN** the catalogue is read
- **THEN** every entry this change adds is marked `beyond ID`

#### Scenario: One tag per need
- **WHEN** the scenario misconceptions are compared with the comparison record's needs
- **THEN** there is exactly one misconception per need

### Requirement: Explanations name the misconception and use engine values
Every explanation SHALL be built from the instance's facts and the conventions wording. It SHALL say why, in neutral words, and SHALL NOT use "wrong", "fail" or "incorrect". (FR-ASM-03, D19, D27)

#### Scenario: Neutral wording
- **WHEN** every explanation of every item is rendered for seeds 0 to 99
- **THEN** none contains "wrong", "fail" or "incorrect" (any case)

#### Scenario: Conventions change flows through
- **GIVEN** the conventions wording with the balance-factor order reversed
- **WHEN** a balance-factor item is rendered with it
- **THEN** the rendered explanation follows the reversed order, and the bank source has no copy of the formula

### Requirement: Every misconception has a scaffold and a lecture question
The content validator SHALL fail when any misconception in the catalogue has no hint or no lecture-question template, or when any sub-skill used by an item has no fallback hint or template. Every such text SHALL be marked `beyond ID` for review. (FR-SCA-02, FR-ASM-02, D19)

#### Scenario: Complete
- **WHEN** the validator runs over the bank
- **THEN** it reports no missing hint or template

#### Scenario: A missing hint is caught
- **GIVEN** a misconception with no hint
- **WHEN** the validator runs
- **THEN** it reports a scaffold problem naming that misconception

#### Scenario: Flagged for review
- **WHEN** the scaffold content is read
- **THEN** every entry is marked `beyond ID`
