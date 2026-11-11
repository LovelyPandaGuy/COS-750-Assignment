# Spec Delta

## Purpose
The frame every screen sits in: tokens wired in, the light theme, one focus style, the AppShell and TopBar, and the Aa menu stub. Screens add content and never restyle the frame.

## ADDED Requirements

### Requirement: Tokens are the only source of style
The app SHALL load `src/ui/tokens.css` and every UI stylesheet and component SHALL take colours, sizes, spacing, radii and type from its variables. No UI stylesheet other than `tokens.css` SHALL contain a hex colour, and the Vite starter's own variables SHALL be gone. (Design system, CLAUDE.md "do not invent styles"; NFR-02)

#### Scenario: No hard-coded colours
- **WHEN** every `.css` file under `src/` other than `tokens.css` is scanned for hex colour values, `rgb(` and `hsl(`
- **THEN** none is found

#### Scenario: Starter styles removed
- **WHEN** `src/index.css` and `src/App.css` are read
- **THEN** neither defines `--accent`, `--text-h` or `--social-bg`

#### Scenario: Tokens are loaded
- **WHEN** `src/main.tsx` is read
- **THEN** it imports `./ui/tokens.css` before any other stylesheet

### Requirement: Light theme is pinned
Until the dark-theme gaps in the design are settled, the app SHALL render in the light theme regardless of the operating-system setting. (Design INDEX "Design-system gaps"; SE section 9, dark theme is cut first)

#### Scenario: Theme attribute
- **WHEN** `index.html` is read
- **THEN** the `<html>` element has `data-theme="light"`

#### Scenario: Contrast still holds
- **WHEN** the existing contrast tests run against `tokens.css`
- **THEN** every light pair still meets its ratio (NFR-02)

### Requirement: One focus style
Every focusable element SHALL show the same focus indicator: a 2 px ring in `--focus-ring-color` with a 2 px gap. No component stylesheet SHALL remove or replace it. (Design system; NFR-02 keyboard operation and non-text contrast)

#### Scenario: Focus rule is defined once
- **WHEN** `tokens.css` is read
- **THEN** a single `:focus-visible` rule gives `outline` the width and colour variables and `outline-offset` the gap variable

#### Scenario: No overrides
- **WHEN** the shell stylesheet and components are scanned for `outline: none`, `outline: 0` and `outline-offset` overrides
- **THEN** none is found

### Requirement: Skip link
`AppShell` SHALL render a skip link as the first focusable element on the page. Activating it SHALL move focus to `main`, so a keyboard user can bypass the TopBar. The link SHALL be hidden until it receives focus, then visible with the single focus style and a 44 px target. Its label SHALL come from `src/content/shell.ts`. (NFR-02, WCAG 2.2 bypass blocks)

#### Scenario: First in tab order
- **WHEN** `App` renders and Tab is pressed once from the top of the document
- **THEN** focus is on the skip link, before the Aa button and any TopBar action

#### Scenario: Moves focus to main
- **WHEN** the skip link is activated by click or by Enter
- **THEN** `main` has focus, the URL fragment is not required to change, and the next Tab lands on the first focusable element inside `main` (or the next element after it)

#### Scenario: Hidden until focused
- **WHEN** the shell stylesheet is read
- **THEN** the skip link is positioned off-screen (not `display: none` or `visibility: hidden`) until `:focus`, and then is placed on-screen with `min-height: var(--target-min)` and token colours only

#### Scenario: Target exists
- **WHEN** `AppShell` renders
- **THEN** the skip link's `href` points at an `id` that exists on `main`, and `main` has `tabindex="-1"`

#### Scenario: Label is content
- **WHEN** the component source is read
- **THEN** the link text comes from `src/content/shell.ts`

### Requirement: AppShell landmarks and reading column
`AppShell` SHALL render a `banner` landmark holding the TopBar, then a `main` landmark holding its children. Running text inside `main` SHALL be limited to `--reading-column` and SHALL use `--type-body`. (Design principle 3; NFR-02)

#### Scenario: Landmarks
- **WHEN** `AppShell` renders with a child paragraph
- **THEN** there is exactly one `banner` and one `main`, the banner comes before `main` in document order, and the paragraph is inside `main`

#### Scenario: No accessibility violations
- **WHEN** the full `App` renders
- **THEN** axe reports no violations

#### Scenario: Narrow width (360 px, FR-VIS-10)
- **WHEN** the shell stylesheet is read
- **THEN** the TopBar wraps (it does not set a fixed width wider than the viewport) and `main` has a side gutter of at least `--space-4`

### Requirement: TopBar content comes from its props
`TopBar` SHALL show the app title, an optional breadcrumb, an optional status pill and an optional list of action buttons, then the Aa menu last. It SHALL render only the text it is given. The title SHALL NOT be a heading. (Wireframes 1b to 1o; NFR-02)

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
- **WHEN** an action button is rendered and its stylesheet rule is read
- **THEN** its `min-height` and `min-width` are `var(--target-min)` (D3)

### Requirement: Aa menu stub
The TopBar SHALL contain an Aa button that opens and closes a small panel of display settings. In this change the panel holds one line of placeholder copy and no working controls. The button SHALL have a 44 px target, an accessible name that is more than "Aa", and `aria-expanded` and `aria-controls`. (Wireframes 1b to 1o; NFR-02, FR-VIS-10)

#### Scenario: Button name and state
- **WHEN** `App` renders
- **THEN** a button named "Display and read-aloud settings" exists, its visible text is "Aa", `aria-expanded` is `false`, and the panel is not in the accessibility tree

#### Scenario: Open by pointer or keyboard
- **WHEN** the button is activated by click, then separately by Enter and by Space
- **THEN** `aria-expanded` becomes `true` and the panel is visible with its copy

#### Scenario: Close with Escape
- **GIVEN** the panel is open and focus is inside it or on the button
- **WHEN** Escape is pressed
- **THEN** the panel closes and focus is on the Aa button

#### Scenario: Close by activating again or clicking outside
- **GIVEN** the panel is open
- **WHEN** the button is activated again, or a click lands outside the panel
- **THEN** the panel closes

#### Scenario: Nothing is stored or fetched
- **WHEN** the menu is opened and closed
- **THEN** `localStorage` is unchanged and no network request is made (NFR-05, CLAUDE.md guardrails)

#### Scenario: Stub copy is content
- **WHEN** the component source is read
- **THEN** the button name and panel line come from `src/content/shell.ts`, not from the component

#### Scenario: Accessible when open
- **WHEN** the panel is open
- **THEN** axe reports no violations
