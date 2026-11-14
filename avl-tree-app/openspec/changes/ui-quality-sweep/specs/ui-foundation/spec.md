# ui-foundation (delta)

## ADDED Requirements

### Requirement: State matrix
The project SHALL keep a state matrix: one manifest listing every route and, for each lesson screen type, its first screen in each of its states (seeded through storage), plus every gallery component state. A visual spec SHALL render each entry at 390, 768 and 1366 px in light and dark and compare it with a committed baseline. Adding a screen or state SHALL be one manifest entry. (Quality bar 4, D118, D150)

#### Scenario: Every route and screen type is listed
- **WHEN** the manifest is compared with `patterns` in `src/routes.ts` and the screen types found in the lesson JSON
- **THEN** every route and every screen type has at least one entry

#### Scenario: Baselines for every entry
- **WHEN** the matrix spec runs
- **THEN** every entry has a baseline for each width and theme, and the run fails when any differs by more than the project tolerance

### Requirement: Quality bar 1, each screen is checked against its frame
Each matrix entry that has a screen spec SHALL name its frame (1a to 1p), and the frame's listed states SHALL each have an entry. Gaps between the screen and its spec SHALL be recorded as `[OPEN]` in the change's review, not guessed. (Quality bar 1)

#### Scenario: Frames covered
- **WHEN** the frames named in the manifest are compared with `.claude/docs/design/screens/`
- **THEN** every frame is named by at least one entry, and every state its spec lists under "States" has an entry, or an `[OPEN]` note naming why not

### Requirement: Quality bar 2, tokens only across every stylesheet
Every stylesheet under `src/` SHALL use only tokens from `src/ui/tokens.css` for colour, font, size and radius, and only the D118 media queries, with no exception per file. (Quality bar 2, D118)

#### Scenario: Lint across the tree
- **WHEN** `npm run lint` runs
- **THEN** stylelint reports no colour, font, size or radius outside tokens, and no other media query, in any stylesheet under `src/`

### Requirement: Quality bar 3, every state exists
Each interactive component in the matrix SHALL have an entry for each state it supports: default, hover, focus, selected, disabled, and "not quite yet" where it can show an answer result. (Quality bar 3)

#### Scenario: States per component
- **WHEN** the manifest's component entries are grouped by component
- **THEN** each component that the contracts list as interactive has entries for focus and disabled, plus hover, selected and not-quite-yet where its contract has those props

### Requirement: Quality bar 4, every width, every text size, no sideways scroll
Every matrix entry SHALL fit without horizontal page scroll at 390, 768 and 1366 px. It SHALL also fit at a landscape phone (844 by 390 CSS px) and with the Aa larger text on at a 200% zoom of the phone width, without lost content or overlapping text. (Quality bar 4, NFR-04, WCAG 1.4.4 and 1.4.10)

#### Scenario: Three widths
- **WHEN** each entry is rendered at 390, 768 and 1366 px
- **THEN** `scrollWidth` is at most the viewport width

#### Scenario: Larger text and zoom
- **GIVEN** the Aa larger text on and a 195 CSS px viewport (390 at 200%)
- **WHEN** each page entry is rendered
- **THEN** there is no sideways page scroll outside the tree's own scroll region, and no two text boxes overlap

#### Scenario: Landscape phone
- **WHEN** each page entry is rendered at 844 by 390
- **THEN** there is no sideways scroll, and the screen heading and the main control (Next, Check answer or the tree) can be reached by scrolling

### Requirement: Quality bar 5, accessible on every state
axe SHALL report no violations on any matrix entry. Every route SHALL set a page title naming the screen and have one `main` landmark, a `banner` and a skip link that moves focus to `main`. A live region SHALL announce a given message once per change; it SHALL NOT repeat the same message or announce on every render. (Quality bar 5, NFR-02)

#### Scenario: axe on every entry
- **WHEN** axe runs on every matrix entry in both themes
- **THEN** it reports no violations

#### Scenario: Titles and landmarks
- **WHEN** each route is opened
- **THEN** `document.title` names the screen, there is exactly one `main`, one `banner`, and the skip link's target is `main`

#### Scenario: No live-region noise
- **GIVEN** a recorder of live-region text changes
- **WHEN** a lesson step, a check answer and a route change are made
- **THEN** each live region announces each new message once, and no region announces during an unchanged re-render

### Requirement: Quality bar 6, keyboard only, with focus kept and returned
Every action on every page entry SHALL be reachable by keyboard, with visible focus in a logical order. Dialogs, sheets and menus SHALL keep focus inside while open, close with Escape and return focus to the control that opened them. After a route change focus SHALL move to the new screen's heading. After a lesson step it SHALL move to the new step's heading, and the scroll position SHALL show that heading. (Quality bar 6, NFR-02, D3)

#### Scenario: Keyboard walk
- **WHEN** Tab is pressed through each page entry
- **THEN** every link, button and field is reached in document order, each shows a focus ring of the focus token's width, and focus never lands on a hidden element

#### Scenario: Traps and return
- **WHEN** the Aa menu, the reset dialog and the lesson menu are opened, tabbed through and closed with Escape
- **THEN** focus stays inside each while open and returns to its opener after closing

#### Scenario: Focus and scroll after a change
- **WHEN** Next is activated on a lesson screen scrolled to its bottom, and separately a route is changed from the top bar
- **THEN** focus is on the new screen's heading and the heading is inside the viewport

### Requirement: Quality bar 7, colour is never the only signal, in any mode
Every state that differs by colour SHALL also differ by word, symbol, shape or border. This SHALL still hold in greyscale, in the protanopia, deuteranopia and tritanopia simulations, and in forced-colours mode, where every control SHALL keep a visible boundary and focus indicator. (Quality bar 7, NFR-02, D25)

#### Scenario: Simulations
- **WHEN** each component state pair that differs by colour is rendered in greyscale and the three simulations
- **THEN** the pair still differs by text content or computed border, outline or shape

#### Scenario: Forced colours
- **WHEN** each page entry is rendered with forced colours active
- **THEN** every button, link, field and switch has a visible border or text, the focused element shows an outline, and status words are still present

### Requirement: Quality bar 8, targets and text size
Every link, button, field, switch and tree node in every matrix entry SHALL have a target at least 44 by 44 px, and running text SHALL be at least 16 px, on touch as well as pointer. No affordance SHALL appear only on hover. (Quality bar 8, FR-VIS-10)

#### Scenario: Targets and text
- **WHEN** each entry's targets and running-text elements are measured
- **THEN** every target is at least 44 by 44 px and every running-text element is at least 16 px

#### Scenario: No hover-only affordances
- **WHEN** the stylesheets are scanned
- **THEN** no `:hover` rule changes `display`, `visibility` or `opacity` from hidden to shown, unless the same rule also covers `:focus-visible` and the element is reachable without hover

### Requirement: Quality bar 9, reduced motion
With reduced motion on, every computed transition and animation duration on every matrix entry SHALL be zero (steps snap). With it off, the motion the design specifies SHALL still run. (Quality bar 9, NFR-02)

#### Scenario: Reduced motion on
- **GIVEN** `prefers-reduced-motion: reduce`
- **WHEN** each entry is rendered and its step or state change is triggered
- **THEN** every element's computed `transition-duration` and `animation-duration` are `0s`

#### Scenario: Reduced motion off
- **GIVEN** no motion preference
- **WHEN** a tree step is played in the gallery
- **THEN** the tree's nodes have a non-zero transition duration

### Requirement: Quality bar 10, calm and consistent wording
No visible text in any matrix entry SHALL contain "wrong", "fail" or "incorrect". No answer state SHALL use the error or red colour tokens. Each term in the term list SHALL be the only word for its concept across screens. (Quality bar 10, D27, ID 10.1)

#### Scenario: No harsh words or red
- **WHEN** the visible text and computed colours of every matrix entry are read
- **THEN** no text matches `wrong`, `fail` or `incorrect`, and no answer-state element uses a red or error token

#### Scenario: One term per concept
- **GIVEN** the term list in `tests/ui/quality/terms.ts`, each concept with its one allowed word and its synonyms
- **WHEN** the content files and visible text are scanned
- **THEN** no synonym appears where the allowed word is meant
