## MODIFIED Requirements

### Requirement: TopBar content comes from its props
`TopBar` SHALL show the app title, an optional breadcrumb, an optional progress area, an optional status pill and an optional list of actions, then the Aa menu last. An action SHALL be a button that calls its handler, or, when it has an `href`, a link to that address. It SHALL render only the text it is given. The title SHALL NOT be a heading. [OPEN] The design does not show what the progress area holds ("revealed structure"). The slot takes whatever a screen passes, and this change passes nothing. (Wireframes 1b to 1o; NFR-02; D20, D23)

#### Scenario: Slots render in order
- **WHEN** `TopBar` renders with a title, a breadcrumb, a progress area, a pill and two actions
- **THEN** the content appears in the order title, breadcrumb, progress area, pill, actions, and the Aa button is last

#### Scenario: Optional parts are absent
- **WHEN** `TopBar` renders with only a title
- **THEN** no empty breadcrumb, progress area, pill or action container is in the document, and the Aa button is still present

#### Scenario: Progress area is a labelled region
- **WHEN** `TopBar` renders with a progress area and a label for it
- **THEN** the progress content is inside a `nav` element whose accessible name is that label, and the TopBar adds no text of its own to it

#### Scenario: Progress area fits a phone
- **WHEN** the TopBar stylesheet is read
- **THEN** below 768 px the progress area wraps onto its own row under the title rather than widening the bar, and from 768 px it sits in line

#### Scenario: Title is not a heading
- **WHEN** `App` renders
- **THEN** the only heading is the one in `main`

#### Scenario: Action targets
- **WHEN** an action button or link is rendered and its stylesheet rule is read
- **THEN** its `min-height` and `min-width` are `var(--target-min)` (D3)

#### Scenario: Link action
- **WHEN** an action with an `href` is rendered
- **THEN** it is an `<a>` with that `href` and the action's label, not a button, and an action without an `href` is still a button that calls its handler on click
