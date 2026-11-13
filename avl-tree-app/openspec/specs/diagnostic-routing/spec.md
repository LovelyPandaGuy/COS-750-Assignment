# diagnostic-routing Specification

## Purpose
How the five diagnostic answers route the student, the short re-check after the refresher, when C1 completes, and the route events.

## Requirements

### Requirement: Routing is a pure function of the five results
The route SHALL depend only on how many of the five answers were correct: 4 or 5 routes to C2, fewer than 4 routes to the BST refresher first. The function SHALL be pure and SHALL return the same route for any ordering of the same count. (FR-DIA-03, D6)

#### Scenario: Every combination
- **WHEN** all 32 combinations of five correct or incorrect answers are routed
- **THEN** exactly those with at least four correct give C2, and all others give the refresher

#### Scenario: Order does not matter
- **WHEN** two combinations have the same number correct
- **THEN** they give the same route

### Requirement: The short re-check
After the refresher the student SHALL be offered a short re-check of the sub-skills that needed review, each as a new variant of its items, at `/module/C1/check`. Whatever its result, the next step SHALL be C2, with the updated per-skill list shown. A student who is routed to C2 directly SHALL see no re-check. (FR-DIA-03)

#### Scenario: Only the weak skills
- **GIVEN** a diagnostic where only the search-path item was wrong
- **WHEN** the re-check opens
- **THEN** it asks only the `bst-search` item, as a variant different from the first

#### Scenario: Then C2 either way
- **WHEN** the re-check is finished, with any answers
- **THEN** the result shows the updated statuses and offers C2

#### Scenario: No re-check when secure
- **WHEN** four or five were correct
- **THEN** no re-check is offered, and the result offers C2 as the suggested route

### Requirement: C1 completes through the diagnostic
C1 SHALL be added to the completed modules when the student finishes the diagnostic with four or five correct, or finishes the re-check. Skipping SHALL NOT complete it. (FR-LRN-05, D20)

#### Scenario: Secure route
- **WHEN** the fifth question is answered with four of five correct
- **THEN** C1 is in the completed modules and the current module is C2

#### Scenario: Refresher route
- **WHEN** only three are correct
- **THEN** C1 is not completed until the re-check is finished

#### Scenario: Skip
- **WHEN** the diagnostic is skipped
- **THEN** C1 is not completed

### Requirement: Recommended and chosen route
The result SHALL recommend C2, or the refresher for fewer than four correct, and SHALL let the student choose either. Showing the recommendation SHALL emit `route_recommended` and choosing SHALL emit `route_chosen`, to the event sink, whose recommended and chosen values are C2 or C1 for the refresher. Nothing is stored. (FR-DIA-03, D20, D28)

#### Scenario: Events
- **WHEN** a result recommending the refresher is shown and the student chooses C2
- **THEN** one `route_recommended` with recommended C1 and one `route_chosen` with chosen C2 are emitted

#### Scenario: Never locked
- **WHEN** the result recommends the refresher
- **THEN** a link to C2 is still present
