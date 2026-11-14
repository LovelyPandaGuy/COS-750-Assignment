# Spec Delta

## MODIFIED Requirements

### Requirement: The control bar
A tree screen's controls SHALL be one `ControlBar` with `role="toolbar"` and an accessible name. In the DOM it SHALL follow the tree region, and below 768 px it SHALL be shown below the tree; from 768 px a screen MAY show it in a side column beside the tree (the sandbox, wireframe 1n). Its buttons SHALL appear in the order: main action, other actions, undo and reset. It SHALL wrap onto more lines rather than cause a horizontal page scroll. (ID 8.3, D136, D140, wireframes 1f, 1h, 1n)

#### Scenario: Below the tree
- **WHEN** a screen with a tree and a control bar is rendered
- **THEN** the control bar follows the tree region in the DOM

#### Scenario: Group order
- **WHEN** a control bar with a main action, one other action, Undo and Reset is rendered
- **THEN** its buttons appear in that order

#### Scenario: Wraps on a phone
- **WHEN** the controls stylesheet is read
- **THEN** the control bar uses `flex-wrap: wrap` and sets no fixed width
