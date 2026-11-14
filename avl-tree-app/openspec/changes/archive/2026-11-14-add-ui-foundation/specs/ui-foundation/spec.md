## Purpose

The shared base every screen is built from: self-hosted fonts, the three layout widths, the base components (Button, OutcomeChip, MasteryBadge) with every design-system state, typed contracts for the wireframe components so two lanes can build against them, and the test harness that holds UI work to the quality bar.

## ADDED Requirements

### Requirement: Fonts are self-hosted
The app SHALL ship Atkinson Hyperlegible Next (400, 700) and Mono (400) from its own origin, declared by `@font-face` rules matching `--font-sans` and `--font-mono`, loaded right after `tokens.css`, with the licence beside the files. No stylesheet SHALL reference a resource on another origin. (Design index "Design-system gaps"; NFR-05)

#### Scenario: Faces are declared for every weight the tokens use
- **WHEN** the font stylesheet is read
- **THEN** it declares `@font-face` for "Atkinson Hyperlegible Next" at 400 and 700 and "Atkinson Hyperlegible Mono" at 400, each with a relative `url(` to a `.woff2` file that exists in the repo and `font-display: swap`

#### Scenario: Loaded in order
- **WHEN** `src/main.tsx` is read
- **THEN** its first stylesheet import is `tokens.css` and its second is the font stylesheet

#### Scenario: Nothing from another origin
- **WHEN** every `.css` file under `src/` and `index.html` are scanned
- **THEN** none contains `http://`, `https://` or `//` inside a `url(` or an `@import`, and no `<link>` in `index.html` points to another origin

#### Scenario: Licence is present
- **WHEN** the fonts folder is listed
- **THEN** it holds the SIL Open Font License text

#### Scenario: Fonts are used in the browser
- **WHEN** the gallery page is loaded in the visual test browser
- **THEN** `document.fonts.check('16px "Atkinson Hyperlegible Next"')` and `document.fonts.check('15px "Atkinson Hyperlegible Mono"')` are both true, and no request leaves the page's origin

### Requirement: Three layout widths
The app SHALL lay out at three widths: phone (from 390 px), tablet (from 768 px) and desktop (from 1366 px), mobile first. The widths SHALL be defined in one exported constant, and `tokens.css` SHALL document them. Every `@media` width query in a UI stylesheet SHALL be `min-width` at 768 px or 1366 px. [OPEN] The design states no breakpoints; these come from the quality bar and are an assumed default (D18). (D3, NFR-04, FR-VIS-10, quality bar line 4)

#### Scenario: One constant
- **WHEN** the breakpoints module is imported
- **THEN** it exports phone 390, tablet 768 and desktop 1366, and no other module under `src/` declares those numbers as widths

#### Scenario: Only the allowed queries
- **WHEN** every `.css` file under `src/` is scanned for `@media` rules with a width feature
- **THEN** each one is `(min-width: 768px)` or `(min-width: 1366px)`

#### Scenario: Documented in the tokens
- **WHEN** `tokens.css` is read
- **THEN** a comment names the three widths and points to the breakpoints module

#### Scenario: No horizontal scroll
- **WHEN** the gallery page is rendered at 390, 768 and 1366 px wide
- **THEN** `document.documentElement.scrollWidth` is not greater than the viewport width at any of them

### Requirement: Button
The base `Button` SHALL be a native button in three variants (primary, secondary, quiet), each with the design-system states default, hover, focus, pressed and disabled, using tokens only and a target of at least `--target-min`. Quiet hover SHALL add an underline. [OPEN] Only primary has a pressed token; secondary and quiet pressed values are assumed (D18). (Design system section 04; NFR-02; D3)

#### Scenario: Variants render as native buttons
- **WHEN** a primary, a secondary and a quiet `Button` render with the label "Continue"
- **THEN** each is a `<button type="button">` named "Continue" and carries its variant's class

#### Scenario: Default state per variant
- **WHEN** the stylesheet rule for each variant is read
- **THEN** primary takes its background from `--action-primary` and its text from `--bg-surface`, secondary takes its border from `--border-control` and its text from `--action-primary`, and quiet has no border or background and takes its text from `--action-primary`

#### Scenario: Hover state per variant
- **WHEN** the `:hover` rule for each variant is read
- **THEN** primary uses `--action-primary-hover`, secondary uses `--action-primary-tint` for its background, and quiet sets `text-decoration: underline`

#### Scenario: Pressed state per variant
- **WHEN** the `:active` rule for each variant is read
- **THEN** primary uses `--action-primary-pressed`, secondary uses `--action-primary-tint`, and quiet uses `--action-primary-pressed` and stays underlined

#### Scenario: Focus state is the shared ring
- **WHEN** the base stylesheet is read
- **THEN** it sets no `outline`, `outline-offset` or `:focus-visible` rule, so the single rule in `tokens.css` applies

#### Scenario: Disabled state
- **WHEN** a `Button` renders with `disabled`
- **THEN** the button is disabled and is not activated by click, Enter or Space; its rule takes its text from `--disabled-text` and its background from `--disabled-bg`; and it has no hover or pressed change

#### Scenario: Disabled with a reason
- **WHEN** a disabled `Button` is given a reason
- **THEN** the reason is shown as text next to the button and is linked to it by `aria-describedby`

#### Scenario: Activation
- **WHEN** an enabled `Button` is activated by click, by Enter and by Space
- **THEN** its handler is called once each time

#### Scenario: Targets
- **WHEN** the base rule shared by all variants is read
- **THEN** `min-height` and `min-width` are `var(--target-min)`

#### Scenario: Accessible in every state
- **WHEN** each variant renders in its default and disabled states
- **THEN** axe reports no violations

### Requirement: OutcomeChip
`OutcomeChip` SHALL show an outcome's Bloom level as a word plus a shape glyph (circle, diamond, triangle) in that level's Bloom tokens, then the outcome text. It SHALL be a static tag unless given a target, when it SHALL be a link or button. [OPEN] The hover underline is an assumed default (D18). [OPEN] The ID also uses analyse (LO7, LO9), which the design system does not style; the chip takes only the three designed levels until it does. (Design system section 04; NFR-02; D25)

#### Scenario: Word, glyph and text
- **WHEN** an `OutcomeChip` renders for level apply with text "Fix an LR imbalance with two rotations"
- **THEN** it shows the Apply word from content, a triangle glyph with `aria-hidden="true"`, and the text, and its rule takes colour from `--bloom-apply` and background from `--bloom-apply-tint`

#### Scenario: Each level has its own glyph
- **WHEN** chips render for remember, understand and apply
- **THEN** their glyphs are a circle, a diamond and a triangle respectively, so the level reads in greyscale

#### Scenario: Only the designed levels
- **WHEN** the chip's accepted levels are read
- **THEN** they are remember, understand and apply, and analyse is not accepted until the design styles it

#### Scenario: Static by default
- **WHEN** an `OutcomeChip` renders with no target
- **THEN** it contains no link or button and is not focusable

#### Scenario: Interactive with a target
- **WHEN** an `OutcomeChip` renders with an `href`, or separately with an `onSelect` handler
- **THEN** it is a link to that address, or a button that calls the handler on click, Enter and Space, with a target of at least `--target-min` and the shared focus ring

#### Scenario: Hover on an interactive chip
- **WHEN** the hover rule for an interactive chip is read
- **THEN** it sets `text-decoration: underline`

#### Scenario: Accessible
- **WHEN** a static chip and an interactive chip of each level render
- **THEN** axe reports no violations

### Requirement: MasteryBadge
`MasteryBadge` SHALL show a mastery state as a word plus an icon whose fill (full, half, empty) is the shape cue, in that state's mastery tokens, never icon alone. Given an earlier state, it SHALL show the change against the student's own last try, never a class average. Its words SHALL come from `src/content/`. (Design system section 04, principle 4; NFR-02; D25)

#### Scenario: Word and fill per state
- **WHEN** badges render for secure, developing and not yet
- **THEN** each shows its word, and its icon is full, half or empty respectively, with `aria-hidden="true"`

#### Scenario: Never icon only
- **WHEN** a badge renders in its compact form
- **THEN** the word is still visible text, not only an accessible name

#### Scenario: Change since the last try
- **WHEN** a badge renders for developing with earlier state not yet
- **THEN** its text reads the not-yet word, an arrow, the developing word and the "since your last try" phrase from content, and the arrow is hidden from assistive technology with the change still announced in words

#### Scenario: No change when the state is the same
- **WHEN** a badge renders with an earlier state equal to the current one
- **THEN** no change line is shown

#### Scenario: Wording is calm and from content
- **WHEN** the badge's content strings are read
- **THEN** they are in `src/content/`, are flagged beyond ID, and contain no "fail", "wrong", "score", "rank" or "average"

#### Scenario: Accessible
- **WHEN** a badge of each state, with and without a change, renders
- **THEN** axe reports no violations

### Requirement: Base components use tokens only
The base components' stylesheet SHALL take every colour, font, size, radius and space from `tokens.css` variables. It SHALL NOT override the shared focus style. It SHALL respect reduced motion. (Quality bar checks 2, 6 and 9; NFR-02)

#### Scenario: No literals
- **WHEN** the base stylesheet is read without comments
- **THEN** every `color`, `background`, `border-color`, `font`, `font-size`, `border-radius`, `padding`, `margin` and `gap` value uses `var(--…)`, `0`, `inherit`, `currentColor` or `none`

#### Scenario: No transitions that ignore reduced motion
- **WHEN** the base stylesheet is read
- **THEN** it declares no `animation`, and any `transition` lies inside `@media (prefers-reduced-motion: no-preference)`

### Requirement: Component contracts
The app SHALL export one TypeScript props type for every component named in wireframe frames 1b to 1o. A built component's contract SHALL be its own props, unchanged; an unbuilt component SHALL have a stub that takes its contract and renders a named placeholder with no student-facing content, replaceable without changing callers. (Wireframe index; D18)

#### Scenario: Every named component has a contract
- **WHEN** the contracts module is read
- **THEN** it exports a props type for each of the 45 component names listed in the design index's Screens table, frames 1b to 1o

#### Scenario: Built components keep their props
- **WHEN** the contract for a built component such as TreeView, StepControls or FeedbackPanel is compared with that component's parameter type
- **THEN** the type check proves they are the same type in both directions

#### Scenario: Stubs render against their contract
- **WHEN** each stub renders with a minimal valid props object
- **THEN** it renders one element with `data-stub` set to its component name and an accessible name containing that name, and axe reports no violations

#### Scenario: Stubs hold no content
- **WHEN** every stub's source is read
- **THEN** it imports nothing from `src/content/` and renders no text other than its component name

#### Scenario: Unbuilt components are stubs
- **WHEN** the contracts module's list of stubbed names is compared with the components exported under `src/`
- **THEN** every stubbed name has no real component yet, and every real component listed is not stubbed

### Requirement: Style lint
`npm run lint` SHALL run a style linter over every `.css` file under `src/` except `tokens.css`. It SHALL fail on:
- a hex colour or a named colour
- `rgb(`, `rgba(`, `hsl(` or `hsla(`
- a `font-size`, `font`, `border-radius` or `line-height` value not taken from a variable
- a `@media` width other than the two allowed `min-width` values

A print stylesheet MAY use point sizes. (Quality bar check 2; NFR-02)

#### Scenario: The rule is wired in
- **WHEN** `package.json` is read
- **THEN** the `lint` script runs the code linter and the style linter, and the style linter's config ignores `tokens.css`

#### Scenario: A hard-coded colour fails
- **WHEN** the style linter is run on a fixture stylesheet containing `color: #333`
- **THEN** it reports an error

#### Scenario: A hard-coded radius and font size fail
- **WHEN** the style linter is run on a fixture with `border-radius: 8px` and one with `font-size: 0.9em`
- **THEN** it reports an error for each

#### Scenario: A disallowed width fails
- **WHEN** the style linter is run on a fixture with `@media (max-width: 600px)`
- **THEN** it reports an error

#### Scenario: The current stylesheets pass
- **WHEN** `npm run lint` runs on the repository
- **THEN** it exits with code 0

### Requirement: Visual baselines
The repository SHALL hold committed screenshot baselines of a development-only gallery page at 390, 768 and 1366 px in light and dark, run by its own script, failing when a shot differs beyond tolerance. The gallery SHALL show every base component state and SHALL NOT be built for production. [OPEN] Baselines are made on macOS; the team to confirm each developer's OS. (Quality bar 4 and 7; D25; NFR-04)

#### Scenario: Script and config
- **WHEN** `package.json` and the browser-test config are read
- **THEN** a `test:visual` script exists, the config's projects are 390, 768 and 1366 px wide, and its web server serves the app without any network beyond localhost

#### Scenario: Baselines are committed
- **WHEN** the visual test folder is listed
- **THEN** a baseline image exists for each of the six width-and-theme pairs

#### Scenario: The gallery shows every state
- **WHEN** the gallery page renders
- **THEN** it holds each Button variant in default, hover, focus, pressed and disabled, each OutcomeChip level static and interactive, and each MasteryBadge state with and without a change

#### Scenario: The gallery is not shipped
- **WHEN** `npm run build` finishes
- **THEN** the output contains no gallery page and no gallery module

#### Scenario: Greyscale still reads
- **WHEN** the gallery is screenshotted with a greyscale filter at 1366 px
- **THEN** a baseline exists for it, and each chip and badge in it still carries its word and glyph
