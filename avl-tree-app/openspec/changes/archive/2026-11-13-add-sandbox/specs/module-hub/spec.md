# Spec Delta

## ADDED Requirements

### Requirement: Sandbox suggested after C2
When C2 is among the completed modules, the hub's Sandbox card SHALL add a line suggesting the sandbox now that C2 is finished. Otherwise it SHALL show no suggestion. The "Open sandbox" link SHALL be present either way. Wording SHALL come from the content files. (FR-VIS-08, D11)

#### Scenario: After C2
- **GIVEN** a learner whose completed modules include C2
- **WHEN** the hub is shown
- **THEN** the Sandbox card contains the suggestion line and the "Open sandbox" link

#### Scenario: Before C2
- **GIVEN** a fresh learner
- **WHEN** the hub is shown
- **THEN** the Sandbox card has no suggestion line and still links to `/sandbox`
