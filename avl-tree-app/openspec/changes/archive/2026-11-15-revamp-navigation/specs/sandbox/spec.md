# Spec Delta

## MODIFIED Requirements

### Requirement: Two-column layout
The sandbox SHALL have a tree column (the tree, its description, "What happened" and "Replay last insert") and a control column, tree column first in the DOM. When the sandbox's own area is at least 45rem wide, the control column SHALL be shown on the left, beside the tree column, two parts to three with a wide gap; narrower, they SHALL stack, tree first. There SHALL be no horizontal page scroll at any width; a wide tree SHALL scroll in its own region. (Wireframe 1n, ID 8.2, D3, D140, D156, NFR-04)

#### Scenario: Tree first in the DOM
- **WHEN** the sandbox is rendered with keys
- **THEN** the tree column precedes the control column, and "Replay last insert" is inside the tree column

#### Scenario: Columns from 768 px
- **WHEN** the sandbox stylesheet is read
- **THEN** (now by the sandbox's own width, D156) the sandbox is a size container, an `@container (min-width: 45rem)` rule makes the layout a grid with the control column (two fifths, at least 18rem) in the first grid column and the tree column (three fifths) in the second, `--space-8` apart, and outside it the layout is a single column

#### Scenario: No page scroll on a phone
- **WHEN** 15 keys are inserted with rebalancing off, at 360, 768 and 1366 px
- **THEN** the tree sits in its scroll region and the layout sets no fixed width wider than 360 px
