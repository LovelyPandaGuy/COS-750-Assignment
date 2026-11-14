# Spec Delta

## MODIFIED Requirements

### Requirement: Route table
The app SHALL route these paths, using a hash router so any path works on a static host and can be opened directly: `/` Start, `/path` the hub, `/module/:moduleId` a module screen (for C2 to C8, the lesson), `/module/:moduleId/:activity` an activity screen for C1 (`check`, `refresher`) and C9 (`check`) only, `/module/C1/check/result` the warm-up result, `/sandbox` and `/readiness`. Module IDs are `C1` to `C9`. An old activity path of C2 to C8 (`explore`, `example`, `check`) SHALL redirect to that module's lesson. (SE §2.3 "one route per screen; deep-linkable modules", SE §6.6, wireframe 1a, ID 7.1)

#### Scenario: Each path opens its screen
- **WHEN** each of `/`, `/path`, `/module/C4`, `/module/C1/check`, `/module/C1/check/result`, `/module/C1/refresher`, `/module/C9/check`, `/sandbox` and `/readiness` is opened directly
- **THEN** each shows one level-1 heading, and the headings differ from one another

#### Scenario: Old activity paths
- **WHEN** `/module/C4/explore`, `/module/C4/example` and `/module/C4/check` are opened
- **THEN** each shows the C4 lesson at its first screen, at `/module/C4`

#### Scenario: Back and forward
- **GIVEN** the learner moved from `/` to `/path` to `/module/C4`
- **WHEN** the browser goes back twice and forward once
- **THEN** the screens shown are `/`, then `/path`

#### Scenario: No network
- **WHEN** every route is rendered
- **THEN** no network request is made (NFR-05)

### Requirement: Breadcrumb per screen
Each screen SHALL pass a breadcrumb to the TopBar that names where the learner is: the hub "Your path"; a module screen (including a C2 to C8 lesson) its module; an activity screen its module then the activity, with its place in the module for C9 ("Check (1 of 1)") and without it for C1's flow ("BST refresher"); the warm-up check and its result the module `C1` then "Warm-up check" or "Result"; the sandbox "Sandbox"; the readiness summary "Your readiness". Start has none. (FR-LRN-03 acceptance, wireframes 1c to 1o)

#### Scenario: Activity
- **WHEN** `/module/C1/refresher` is shown
- **THEN** the TopBar breadcrumb contains "C1 Getting started and readiness check" and "BST refresher"

#### Scenario: Warm-up check
- **WHEN** `/module/C1/check` is shown
- **THEN** the breadcrumb contains "C1 Getting started and readiness check" and "Warm-up check"

#### Scenario: Start has none
- **WHEN** `/` is shown
- **THEN** the TopBar has no breadcrumb

### Requirement: Browser title per screen
Each screen SHALL set the browser title to its heading followed by "· AVL Primer", so history and tabs tell screens apart. (WCAG 2.4.2, NFR-02)

#### Scenario: Titles
- **WHEN** `/path` and `/module/C4` are shown
- **THEN** `document.title` is "Your path · AVL Primer" and "Search (the algorithm) · AVL Primer"

### Requirement: TopBar actions per screen
The TopBar actions SHALL follow the wireframes: the hub and module screens (including C2 to C8 lessons) show "Sandbox" and "Lecture questions"; the C9 check shows "Lecture questions"; the warm-up check, its result, the refresher and Start show none; the sandbox shows "Lecture questions"; the readiness summary shows "Sandbox". "Sandbox" SHALL open `/sandbox` and "Lecture questions" SHALL open `/readiness`, as links, without a count. (wireframes 1b to 1o, FR-VIS-08)

#### Scenario: Explore
- **WHEN** `/module/C5` is shown
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
