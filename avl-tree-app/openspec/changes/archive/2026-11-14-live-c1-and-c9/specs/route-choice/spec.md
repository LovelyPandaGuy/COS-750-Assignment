# Spec Delta

## MODIFIED Requirements

### Requirement: The diagnostic result is a recommended route
The C1 result SHALL be logged and presented as a route recommendation (`c1.json` `route`): it recommends C2 with the `passMessage`, or the BST refresher with the `failMessage` for fewer than `minCorrect` right, shows both choices with the word "Suggested" on the recommended one (`studentCanChoose`), and emits `route_recommended` once when shown and `route_chosen` on a choice. (ID 7.2, ID 9.3, D28, FR-DIA-03)

#### Scenario: Suggested word
- **WHEN** the result recommends the refresher
- **THEN** "Suggested" is on the refresher link and not on the C2 link, and the fail message is shown

#### Scenario: One recommendation event
- **WHEN** the result is shown once
- **THEN** exactly one `route_recommended` is emitted
