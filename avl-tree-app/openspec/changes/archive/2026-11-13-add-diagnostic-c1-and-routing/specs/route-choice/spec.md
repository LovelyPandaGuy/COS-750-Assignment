# route-choice Delta

## ADDED Requirements

### Requirement: The diagnostic result is a recommended route
The C1 result SHALL be logged and presented as a route recommendation in the same way as a module check: it recommends C2, or the BST refresher (as C1) for fewer than four correct, shows both choices with the word "Suggested" on the recommended one, and emits `route_recommended` once when shown and `route_chosen` on a choice. (D20, D28, FR-DIA-03)

#### Scenario: Suggested word
- **WHEN** the result recommends the refresher
- **THEN** "Suggested" is on the refresher link and not on the C2 link

#### Scenario: One recommendation event
- **WHEN** the result is shown once
- **THEN** exactly one `route_recommended` is emitted
