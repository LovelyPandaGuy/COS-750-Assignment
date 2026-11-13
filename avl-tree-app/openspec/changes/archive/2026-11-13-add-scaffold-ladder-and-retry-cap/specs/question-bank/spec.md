# question-bank Delta

## ADDED Requirements

### Requirement: Every misconception has a scaffold
The content validator SHALL fail when any misconception in the catalogue has no hint, or when any sub-skill used by an item has no fallback hint. Every hint SHALL be marked `beyond ID` for review. Lecture questions use the one template of the scaffold-ladder capability, so no per-misconception template is required. (FR-SCA-02, FR-ASM-02, D19)

#### Scenario: Complete
- **WHEN** the validator runs over the bank
- **THEN** it reports no missing hint

#### Scenario: A missing hint is caught
- **GIVEN** a misconception with no hint
- **WHEN** the validator runs
- **THEN** it reports a scaffold problem naming that misconception

#### Scenario: Flagged for review
- **WHEN** the scaffold content is read
- **THEN** every entry is marked `beyond ID`
