# Spec Delta

## ADDED Requirements

### Requirement: Attempts store their attempt number
Each stored attempt SHALL carry its attempt number for its question: 1 for a first answer, 2 for a check re-attempt, and the running count for practice. A stored attempt without it SHALL load as attempt 1, so earlier saves stay valid. (ID 9.1, ID 12.2)

#### Scenario: Re-attempt stored
- **WHEN** a check question is answered twice
- **THEN** the two stored attempts carry attempt 1 and attempt 2

#### Scenario: Older saves still load
- **GIVEN** a stored attempt with no attempt number
- **WHEN** the state is loaded
- **THEN** it loads, with attempt 1
