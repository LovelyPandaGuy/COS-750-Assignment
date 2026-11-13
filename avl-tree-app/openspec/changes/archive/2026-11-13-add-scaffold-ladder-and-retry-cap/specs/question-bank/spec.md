# question-bank Delta

## ADDED Requirements

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
