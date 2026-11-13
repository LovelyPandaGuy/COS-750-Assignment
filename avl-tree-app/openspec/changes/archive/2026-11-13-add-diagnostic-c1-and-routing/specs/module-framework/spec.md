# module-framework Delta

## ADDED Requirements

### Requirement: A sequence under its own heading
The step player SHALL accept an optional heading that replaces the activity label as its level-1 heading, and SHALL accept a content sequence whose validator requires only the events it has: hook and goals once each and at least one recall, with no activity-completeness rule. Module content SHALL keep the existing rules in full. (add-diagnostic-c1-and-routing)

#### Scenario: Own heading
- **WHEN** the player is shown with the heading "BST refresher"
- **THEN** the level-1 heading is "BST refresher"

#### Scenario: Module rules unchanged
- **WHEN** a module with no check step is validated as a module
- **THEN** the validator still reports it
