# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Aa menu stub`
- TO: `### Requirement: Settings menu`

## MODIFIED Requirements

### Requirement: AppShell landmarks and reading column
`AppShell` SHALL render a `banner` landmark holding the TopBar, then the lessons sidebar (`lesson-sidebar`), then a `main` landmark holding its children. Running text inside `main` SHALL be limited to `--reading-column` and SHALL use `--type-body`. (Design principle 3; NFR-02; D155)

#### Scenario: Landmarks
- **WHEN** `AppShell` renders with a child paragraph
- **THEN** there is exactly one `banner` and one `main`, the banner comes before the "Lessons" navigation and that before `main` in document order, and the paragraph is inside `main`

#### Scenario: No accessibility violations
- **WHEN** the full `App` renders
- **THEN** axe reports no violations

#### Scenario: Narrow width (360 px, FR-VIS-10)
- **WHEN** the shell stylesheet is read
- **THEN** the TopBar wraps (it does not set a fixed width wider than the viewport) and `main` has a side gutter of at least `--space-4`

### Requirement: TopBar content comes from its props
`TopBar` SHALL show the app title, an optional breadcrumb, an optional progress area and an optional list of actions, then the Settings menu last. It SHALL show no status pill. An action SHALL be a button that calls its handler, or, when it has an `href`, a link to that address. It SHALL render only the text it is given. The title SHALL NOT be a heading. (Wireframes 1b to 1o; NFR-02; D20, D23, D157)

#### Scenario: Slots render in order
- **WHEN** `TopBar` renders with a title, a breadcrumb, a progress area and two actions
- **THEN** the content appears in the order title, breadcrumb, progress area, actions, and the Settings button is last

#### Scenario: Optional parts are absent
- **WHEN** `TopBar` renders with only a title
- **THEN** no empty breadcrumb, progress area or action container is in the document, and the Settings button is still present

#### Scenario: No status pill
- **WHEN** `App` renders with working storage, then with storage that throws
- **THEN** neither "Saved on this device" nor "Not being saved" is in the TopBar

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

### Requirement: Settings menu
The TopBar SHALL contain a Settings button that opens and closes a small panel of display settings. The panel SHALL hold the "Dark theme" switch (capability `display-theme`) and the display settings (capability `display-settings`), including the narration switch. It SHALL NOT show a placeholder line saying read-aloud comes later. The button SHALL show the word "Settings", have an accessible name that starts with "Settings", a 44 px target, and `aria-expanded` and `aria-controls`. (Wireframes 1b to 1o; NFR-02, FR-VIS-10, WCAG 2.5.3, D26, D157)

#### Scenario: Button name and state
- **WHEN** `App` renders
- **THEN** a button whose visible text is "Settings" and whose accessible name starts with "Settings" exists, no button shows "Aa", `aria-expanded` is `false`, and the panel is not in the accessibility tree

#### Scenario: Open by pointer or keyboard
- **WHEN** the button is activated by click, then separately by Enter and by Space
- **THEN** `aria-expanded` becomes `true` and the panel is visible with the "Dark theme" switch and the display settings, and no "later update" line

#### Scenario: Close with Escape
- **GIVEN** the panel is open and focus is inside it or on the button
- **WHEN** Escape is pressed
- **THEN** the panel closes and focus is on the Settings button

#### Scenario: Close by activating again or clicking outside
- **GIVEN** the panel is open
- **WHEN** the button is activated again, or a click lands outside the panel
- **THEN** the panel closes

#### Scenario: Nothing is stored or fetched
- **WHEN** the menu is opened and closed without using the switch
- **THEN** `localStorage` is unchanged and no network request is made (NFR-05, CLAUDE.md guardrails)

#### Scenario: Stub copy is content
- **WHEN** the component source is read
- **THEN** the button text, its name and the switch labels come from `src/content/`, not from the component

#### Scenario: Accessible when open
- **WHEN** the panel is open
- **THEN** axe reports no violations
