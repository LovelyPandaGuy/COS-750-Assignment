# Spec Delta

## MODIFIED Requirements

### Requirement: TopBar content comes from its props
`TopBar` SHALL show the app title, an optional breadcrumb, an optional status pill and an optional list of actions, then the Aa menu last. An action SHALL be a button that calls its handler, or, when it has an `href`, a link to that address. It SHALL render only the text it is given. The title SHALL NOT be a heading. (Wireframes 1b to 1o; NFR-02)

#### Scenario: Slots render in order
- **WHEN** `TopBar` renders with a title, a breadcrumb, a pill and two actions
- **THEN** the text appears in the order title, breadcrumb, pill, actions, and the Aa button is last

#### Scenario: Optional parts are absent
- **WHEN** `TopBar` renders with only a title
- **THEN** no empty breadcrumb, pill or action container is in the document, and the Aa button is still present

#### Scenario: Title is not a heading
- **WHEN** `App` renders
- **THEN** the only heading is the one in `main`

#### Scenario: Action targets
- **WHEN** an action button or link is rendered and its stylesheet rule is read
- **THEN** its `min-height` and `min-width` are `var(--target-min)` (D3)

#### Scenario: Link action
- **WHEN** an action with an `href` is rendered
- **THEN** it is an `<a>` with that `href` and the action's label, not a button, and an action without an `href` is still a button that calls its handler on click
