# screen-skeletons Delta

## MODIFIED Requirements

### Requirement: Skeleton screens exist
These screens SHALL exist as skeletons, each with the heading shown: the Check activity of C9 with that activity's name as heading (`/module/C9/check`), and the readiness summary "Ready for the lecture?" (1o). Each SHALL show one line saying the screen is coming and no questions, trees, controls or learning content. (SE §6.6, wireframes 1a to 1o; the sandbox, 1n, is its own screen; every module from C2 to C8 has content, and the C1 warm-up check, its result and the refresher are built)

#### Scenario: Headings
- **WHEN** each of `/module/C9/check` and `/readiness` is opened
- **THEN** each has the heading named above, and its text outside the heading, the breadcrumb and the back link is the one "coming" line

#### Scenario: No content
- **WHEN** each skeleton screen is rendered
- **THEN** it contains no `TreeView`, no radio input, no text input and no question text

#### Scenario: Activity of the right module
- **WHEN** `/module/C9/check` is shown
- **THEN** the breadcrumb names "C9 Am I ready" and "Check"

### Requirement: A way back from every skeleton
Every skeleton screen SHALL have a "Back to path" link to the hub; the warm-up result, now built, SHALL also link to the BST refresher. Following a link SHALL leave the learner state unchanged. (wireframe 1d; FR-LRN-04, FR-DIA-04)

#### Scenario: Back links
- **WHEN** each skeleton screen is rendered
- **THEN** it contains a link whose text includes "Back to path" and whose target is `/path`

#### Scenario: Refresher stays reachable
- **WHEN** the warm-up result is shown
- **THEN** it links to `/module/C1/refresher`, whatever the learner state, because skipping never hides the refresher

#### Scenario: Navigation does not write
- **WHEN** the learner visits every screen and returns
- **THEN** the stored learner state is byte for byte the same as before

### Requirement: Low-anxiety wording
The skeleton wording SHALL use no mark, grade, pass, fail, test or score words on any check screen. (FR-DIA-05, design principle 1)

#### Scenario: Wording scan
- **WHEN** the strings for the check skeletons in `src/content/screens.ts` are read
- **THEN** none of "mark", "grade", "pass", "fail", "test" or "score" appears
