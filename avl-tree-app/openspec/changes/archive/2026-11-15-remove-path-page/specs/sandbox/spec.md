# Spec Delta

## MODIFIED Requirements

### Requirement: Nothing saved, accessible
The sandbox SHALL write nothing to the learner state. Every control SHALL be at least 44 px, usable by keyboard and touch, and the screen SHALL end with a link back to the student's current lesson ("← Back to C3 The AVL property"). The screen SHALL have no axe violations at every width and in every state. (NFR-02, D3, wireframe 1n, D159)

#### Scenario: Nothing stored
- **WHEN** the learner inserts, deletes, toggles and clears, then leaves
- **THEN** the stored learner state is byte for byte the same as before

#### Scenario: Back to path
- **GIVEN** a learner whose current lesson is C3
- **WHEN** the sandbox is shown
- **THEN** it has a link "← Back to C3 The AVL property" to `/module/C3`, and no link to `/path`

#### Scenario: Axe
- **WHEN** the sandbox is rendered empty, with a chain, full, with the replay open, and with keyboard help open
- **THEN** axe reports no violations
