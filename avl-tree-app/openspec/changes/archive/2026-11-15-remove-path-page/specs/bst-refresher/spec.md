# Spec Delta

## MODIFIED Requirements

### Requirement: Reachable, skippable, calm
The refresher SHALL be reachable from the result and the C1 module screen, whatever the learner state; its explanation screens SHALL offer "Skip ahead" as lesson screens do; and its UI wording SHALL use no mark, grade, pass, fail, test or score wording. (FR-DIA-04, D20, FR-DIA-05, ID 8.2, D159)

#### Scenario: Reachable
- **WHEN** the C1 module screen is shown for any learner state
- **THEN** it links to the refresher

#### Scenario: Skip on content steps
- **WHEN** an explanation screen of the refresher is shown
- **THEN** "Skip ahead" is offered
