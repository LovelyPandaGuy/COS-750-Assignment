# Spec Delta

## MODIFIED Requirements

### Requirement: Route table
The app SHALL route these paths, using a hash router so any path works on a static host and can be opened directly: `/` Start, `/module/:moduleId` the lesson of C1 to C9, `/module/C1/refresher` the BST refresher, `/sandbox` and `/readiness`. Module IDs are `C1` to `C9`. `/path`, the former path page, SHALL redirect to the student's current lesson. Any other activity path of a module (`/module/C1/check`, `/module/C1/check/result`, `/module/C9/check`, and the old C2 to C8 paths) SHALL redirect to that module's lesson. (SE §2.3, SE §6.6, ID 7.1, D159)

#### Scenario: Each path opens its screen
- **WHEN** each of `/`, `/module/C1`, `/module/C4`, `/module/C9`, `/module/C1/refresher`, `/sandbox` and `/readiness` is opened directly
- **THEN** each shows one level-1 heading, and the headings differ from one another

#### Scenario: Old activity paths
- **WHEN** `/module/C1/check`, `/module/C1/check/result`, `/module/C9/check` and `/module/C4/explore` are opened
- **THEN** each shows its module's lesson at its first screen

#### Scenario: Back and forward
- **GIVEN** the learner moved from `/` to `/sandbox` to `/module/C4`
- **WHEN** the browser goes back twice and forward once
- **THEN** the screens shown are `/`, then `/sandbox`

#### Scenario: No network
- **WHEN** every route is rendered
- **THEN** no network request is made (NFR-05)

#### Scenario: The path page redirects
- **GIVEN** a learner whose current lesson is C3
- **WHEN** `/path` is opened
- **THEN** the C3 lesson is shown

### Requirement: Paths come from one module
Path strings SHALL be built and parsed in one module, which SHALL also hold the module IDs, the activities each module has, their default order, and the lesson that follows each lesson. No other file in `src/` SHALL write a route path by hand. (CLAUDE.md "one module" principle, as for conventions; D159)

#### Scenario: Builders
- **WHEN** the path builders are called for module `C4`, `C4`'s Explore activity, the warm-up result, the sandbox and the readiness summary
- **THEN** they return `/module/C4`, `/module/C4/explore`, `/module/C1/check/result`, `/sandbox` and `/readiness`

#### Scenario: Activities per module
- **WHEN** the activities of each module are listed
- **THEN** `C1` has check then refresher, `C2` to `C8` have explore, example, check in that order, and `C9` has check

#### Scenario: No hand-written paths
- **WHEN** every file under `src/` except the routes module is scanned
- **THEN** none contains a string literal starting `/module/`, `/path`, `/sandbox` or `/readiness`

#### Scenario: After each lesson
- **WHEN** the destination after each lesson is asked for
- **THEN** C1 to C8 give the next lesson's path, and C9 gives `/readiness`

### Requirement: Breadcrumb per screen
Each screen SHALL pass a breadcrumb to the TopBar that names where the learner is: a lesson its module; the BST refresher the module `C1` then "BST refresher"; the sandbox "Sandbox"; the readiness report "Your readiness". Start has none. (FR-LRN-03 acceptance)

#### Scenario: Activity
- **WHEN** `/module/C1/refresher` is shown
- **THEN** the TopBar breadcrumb contains "C1 Getting started and readiness check" and "BST refresher"

#### Scenario: Warm-up check
- **WHEN** `/module/C1` is shown
- **THEN** the breadcrumb contains "C1 Getting started and readiness check"

#### Scenario: Start has none
- **WHEN** `/` is shown
- **THEN** the TopBar has no breadcrumb

### Requirement: TopBar actions per screen
The TopBar actions SHALL follow the wireframes: the lessons C2 to C9 show "Sandbox" and "Lecture questions"; C1, the refresher and Start show none; the sandbox shows "Lecture questions"; the readiness report shows "Sandbox". "Sandbox" SHALL open `/sandbox` and "Lecture questions" SHALL open `/readiness`, as links, without a count. (FR-VIS-08, D11)

#### Scenario: Explore
- **WHEN** `/module/C5` is shown
- **THEN** the TopBar has links "Sandbox" and "Lecture questions", and following "Sandbox" shows `/sandbox`

#### Scenario: Warm-up check has none
- **WHEN** `/module/C1` and `/module/C1/refresher` are shown
- **THEN** the TopBar has no actions

#### Scenario: Readiness
- **WHEN** `/readiness` is shown
- **THEN** the TopBar has "Sandbox" and no "Lecture questions"

#### Scenario: Links, not buttons
- **WHEN** the TopBar actions on `/module/C5` are read
- **THEN** each is an `<a>` with an `href`, and each target is at least 44 px (D3)

### Requirement: Browser title per screen
Each screen SHALL set the browser title to its heading followed by "· AVL Primer", so history and tabs tell screens apart. (WCAG 2.4.2, NFR-02)

#### Scenario: Titles
- **WHEN** `/sandbox` and `/module/C4` are shown
- **THEN** `document.title` is "Sandbox · AVL Primer" and "Search (the algorithm) · AVL Primer"

### Requirement: Focus follows in-app navigation
After the learner moves to another screen inside the app, focus SHALL go to that screen's level-1 heading. On the first load of any path it SHALL NOT, so the skip link stays first in the tab order. (WCAG 2.4.3, existing Start and module behaviour)

#### Scenario: In-app move
- **WHEN** the learner follows a lesson link in the Lessons sidebar to a module screen
- **THEN** that screen's level-1 heading has focus

#### Scenario: First load
- **WHEN** `/module/C4` is opened directly
- **THEN** focus is not on the heading, and the skip link is the first tab stop

#### Scenario: Start and Resume
- **WHEN** Start or Resume is activated
- **THEN** the module screen's heading has focus, as before
