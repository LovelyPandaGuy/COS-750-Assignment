# screen-skeletons Specification

## Purpose
Gives every remaining MVP screen a route, a heading and a way back, with no content, so each later change fills in one screen.

## Requirements

### Requirement: Skeleton screens exist
These screens SHALL exist as skeletons, each with the heading shown: the warm-up check "Warm-up check" (`/module/C1/check`, wireframe 1c), its result "Here's where you're starting from" (`/module/C1/check/result`, 1d), the BST refresher "BST refresher" (`/module/C1/refresher`), an Explore, Worked example or Check activity for modules C2 to C9 with that activity's name as heading (`/module/:moduleId/explore`, `example`, `check`; 1f, 1i), the sandbox "Sandbox" (1n) and the readiness summary "Ready for the lecture?" (1o). Each SHALL show one line saying the screen is coming and no questions, trees, controls or learning content. (SE §6.6, wireframes 1a to 1o)

#### Scenario: Headings
- **WHEN** each of `/module/C1/check`, `/module/C1/check/result`, `/module/C1/refresher`, `/module/C5/explore`, `/module/C5/example`, `/module/C5/check`, `/module/C9/check`, `/sandbox` and `/readiness` is opened
- **THEN** each has the heading named above, and its text outside the heading, the breadcrumb and the back link is the one "coming" line

#### Scenario: No content
- **WHEN** each skeleton screen is rendered
- **THEN** it contains no `TreeView`, no radio input, no text input and no question text

#### Scenario: Activity of the right module
- **WHEN** `/module/C6/check` is shown
- **THEN** the breadcrumb names "C6 Insertion with rebalancing" and "Check"

### Requirement: A way back from every skeleton
Every skeleton screen SHALL have a "Back to path" link to the hub, except the sandbox, which SHALL have "← Back to path" as in wireframe 1n; the warm-up result SHALL also link to the warm-up check. Following a link SHALL leave the learner state unchanged. (wireframes 1d, 1n; FR-LRN-04, FR-DIA-04)

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
The skeleton wording SHALL use no mark, grade, pass, fail, test or score words on the warm-up check, its result or any check screen. (FR-DIA-05, design principle 1)

#### Scenario: Wording scan
- **WHEN** the strings for the warm-up check, its result and the check skeletons in `src/content/screens.ts` are read
- **THEN** none of "mark", "grade", "pass", "fail", "test" or "score" appears

### Requirement: Skeletons are accessible
Skeleton screens SHALL have no axe violations, SHALL keep one level-1 heading in `main`, and SHALL work by keyboard alone. (NFR-02)

#### Scenario: Axe and keyboard
- **WHEN** each skeleton is rendered
- **THEN** axe reports no violations and the back link is reachable by Tab and activated by Enter
