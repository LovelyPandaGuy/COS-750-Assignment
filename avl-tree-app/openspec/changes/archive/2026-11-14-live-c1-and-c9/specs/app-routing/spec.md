# Spec Delta

## MODIFIED Requirements

### Requirement: Route table
The app SHALL route these paths, using a hash router so any path works on a static host and can be opened directly: `/` Start, `/path` the hub, `/module/:moduleId` the lesson of C1 to C9, `/module/C1/refresher` the BST refresher, `/sandbox` and `/readiness`. Module IDs are `C1` to `C9`. Any other activity path of a module (`/module/C1/check`, `/module/C1/check/result`, `/module/C9/check`, and the old C2 to C8 paths) SHALL redirect to that module's lesson. (SE §2.3, SE §6.6, ID 7.1)

#### Scenario: Each path opens its screen
- **WHEN** each of `/`, `/path`, `/module/C1`, `/module/C4`, `/module/C9`, `/module/C1/refresher`, `/sandbox` and `/readiness` is opened directly
- **THEN** each shows one level-1 heading, and the headings differ from one another

#### Scenario: Old activity paths
- **WHEN** `/module/C1/check`, `/module/C1/check/result`, `/module/C9/check` and `/module/C4/explore` are opened
- **THEN** each shows its module's lesson at its first screen

#### Scenario: Back and forward
- **GIVEN** the learner moved from `/` to `/path` to `/module/C4`
- **WHEN** the browser goes back twice and forward once
- **THEN** the screens shown are `/`, then `/path`

#### Scenario: No network
- **WHEN** every route is rendered
- **THEN** no network request is made (NFR-05)

### Requirement: Breadcrumb per screen
Each screen SHALL pass a breadcrumb to the TopBar that names where the learner is: the hub "Your path"; a lesson its module; the BST refresher the module `C1` then "BST refresher"; the sandbox "Sandbox"; the readiness report "Your readiness". Start has none. (FR-LRN-03 acceptance)

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
The TopBar actions SHALL follow the wireframes: the hub and the lessons C2 to C9 show "Sandbox" and "Lecture questions"; C1, the refresher and Start show none; the sandbox shows "Lecture questions"; the readiness report shows "Sandbox". "Sandbox" SHALL open `/sandbox` and "Lecture questions" SHALL open `/readiness`, as links, without a count. (FR-VIS-08)

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
- **WHEN** the TopBar actions on the hub are read
- **THEN** each is an `<a>` with an `href`, and each target is at least 44 px (D3)
