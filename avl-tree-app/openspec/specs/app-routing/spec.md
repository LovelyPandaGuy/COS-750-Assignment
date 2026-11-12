# app-routing Specification

## Purpose
One route table for every screen in the MVP, with the navigation behaviour all screens share: shell, breadcrumb, links, browser title and focus.

## Requirements

### Requirement: Route table
The app SHALL route these paths, using a hash router so any path works on a static host and can be opened directly: `/` Start, `/path` the hub, `/module/:moduleId` a module screen, `/module/:moduleId/:activity` an activity screen, `/module/C1/check/result` the warm-up result, `/sandbox` and `/readiness`. Module IDs are `C1` to `C9` and activities are `explore`, `example`, `check` and `refresher`. (SE §2.3 "one route per screen; deep-linkable modules", SE §6.6, wireframe 1a)

#### Scenario: Each path opens its screen
- **WHEN** each of `/`, `/path`, `/module/C4`, `/module/C4/explore`, `/module/C1/check`, `/module/C1/check/result`, `/module/C1/refresher`, `/sandbox` and `/readiness` is opened directly
- **THEN** each shows one level-1 heading, and the headings differ from one another

#### Scenario: Back and forward
- **GIVEN** the learner moved from `/` to `/path` to `/module/C4`
- **WHEN** the browser goes back twice and forward once
- **THEN** the screens shown are `/`, then `/path`

#### Scenario: No network
- **WHEN** every route is rendered
- **THEN** no network request is made (NFR-05)

### Requirement: Paths come from one module
Path strings SHALL be built and parsed in one module, which SHALL also hold the module IDs, the activities each module has and their default order. No other file in `src/` SHALL write a route path by hand. (CLAUDE.md "one module" principle, as for conventions)

#### Scenario: Builders
- **WHEN** the path builders are called for the hub, module `C4`, `C4`'s Explore activity, the warm-up result, the sandbox and the readiness summary
- **THEN** they return `/path`, `/module/C4`, `/module/C4/explore`, `/module/C1/check/result`, `/sandbox` and `/readiness`

#### Scenario: Activities per module
- **WHEN** the activities of each module are listed
- **THEN** `C1` has check then refresher, `C2` to `C8` have explore, example, check in that order, and `C9` has check

#### Scenario: No hand-written paths
- **WHEN** every file under `src/` except the routes module is scanned
- **THEN** none contains a string literal starting `/module/`, `/path`, `/sandbox` or `/readiness`

### Requirement: Unknown paths go somewhere safe
An unknown path, an unknown module ID, or a module ID with no such screen SHALL go to Start. An activity the module does not have SHALL go to that module's screen. The redirect SHALL replace the history entry. (FR-LRN-04)

#### Scenario: Unknown path
- **WHEN** `/nowhere` is opened
- **THEN** the Start screen is shown

#### Scenario: Unknown module
- **WHEN** `/module/C10` and `/module/C10/explore` are opened
- **THEN** the Start screen is shown

#### Scenario: Activity the module lacks
- **WHEN** `/module/C9/explore` and `/module/C1/example` are opened
- **THEN** the module screen for `C9` and for `C1` is shown

#### Scenario: Redirect replaces
- **WHEN** `/nowhere` redirects to Start and the browser goes back
- **THEN** it does not return to `/nowhere`

### Requirement: Every route is in the shell
Every screen SHALL render inside the app shell, with the saved-on-this-device pill (or the not-saved pill when storage is off) and exactly one level-1 heading in `main`. (NFR-06, NFR-02, design principle 3)

#### Scenario: Shell and pill
- **WHEN** each route is rendered with working storage, then with storage that throws
- **THEN** each has one banner, one main and one level-1 heading, and the pill reads "Saved on this device", then "Not being saved"

#### Scenario: No accessibility violations
- **WHEN** each route is rendered
- **THEN** axe reports no violations

### Requirement: Breadcrumb per screen
Each screen SHALL pass a breadcrumb to the TopBar that names where the learner is: the hub "Your path"; a module screen its module; an activity screen its module then the activity and its place in the module ("Explore (1 of 3)"); the warm-up check and its result the module `C1` then "Warm-up check" or "Result"; the sandbox "Sandbox"; the readiness summary "Your readiness". Start has none. (FR-LRN-03 acceptance, wireframes 1c to 1o)

#### Scenario: Activity
- **WHEN** `/module/C5/explore` is shown
- **THEN** the TopBar breadcrumb contains "C5 Rotations" and "Explore (1 of 3)"

#### Scenario: Warm-up check
- **WHEN** `/module/C1/check` is shown
- **THEN** the breadcrumb contains "C1 Getting started and readiness check" and "Warm-up check"

#### Scenario: Start has none
- **WHEN** `/` is shown
- **THEN** the TopBar has no breadcrumb

### Requirement: TopBar actions per screen
The TopBar actions SHALL follow the wireframes: the hub, module screens, Explore and Worked example screens show "Sandbox" and "Lecture questions"; Check screens (other than the warm-up check) show "Lecture questions"; the warm-up check, its result, the refresher and Start show none; the sandbox shows "Lecture questions"; the readiness summary shows "Sandbox". "Sandbox" SHALL open `/sandbox` and "Lecture questions" SHALL open `/readiness`, as links, without a count. (wireframes 1b to 1o, FR-VIS-08)

#### Scenario: Explore
- **WHEN** `/module/C5/explore` is shown
- **THEN** the TopBar has links "Sandbox" and "Lecture questions", and following "Sandbox" shows `/sandbox`

#### Scenario: Warm-up check has none
- **WHEN** `/module/C1/check` and `/module/C1/check/result` are shown
- **THEN** the TopBar has no actions

#### Scenario: Readiness
- **WHEN** `/readiness` is shown
- **THEN** the TopBar has "Sandbox" and no "Lecture questions"

#### Scenario: Links, not buttons
- **WHEN** the TopBar actions on the hub are read
- **THEN** each is an `<a>` with an `href`, and each target is at least 44 px (D3)

### Requirement: Browser title per screen
Each screen SHALL set the browser title to its heading followed by "· AVL Primer", so history and tabs tell screens apart. (WCAG 2.4.2, NFR-02)

#### Scenario: Titles
- **WHEN** `/path` and `/module/C4` are shown
- **THEN** `document.title` is "Your path · AVL Primer" and "C4 Search · AVL Primer"

### Requirement: Focus follows in-app navigation
After the learner moves to another screen inside the app, focus SHALL go to that screen's level-1 heading. On the first load of any path it SHALL NOT, so the skip link stays first in the tab order. (WCAG 2.4.3, existing Start and module behaviour)

#### Scenario: In-app move
- **WHEN** the learner follows a link from the hub to a module screen
- **THEN** that screen's level-1 heading has focus

#### Scenario: First load
- **WHEN** `/module/C4` is opened directly
- **THEN** focus is not on the heading, and the skip link is the first tab stop

#### Scenario: Start and Resume
- **WHEN** Start or Resume is activated
- **THEN** the module screen's heading has focus, as before
