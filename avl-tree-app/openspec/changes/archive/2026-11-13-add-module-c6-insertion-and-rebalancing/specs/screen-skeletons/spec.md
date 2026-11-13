# Spec Delta

## MODIFIED Requirements

### Requirement: Skeleton screens exist
These screens SHALL exist as skeletons, each with the heading shown: the warm-up check "Warm-up check" (`/module/C1/check`, wireframe 1c), its result "Here's where you're starting from" (`/module/C1/check/result`, 1d), the BST refresher "BST refresher" (`/module/C1/refresher`), the Check activity of C9 with that activity's name as heading (`/module/C9/check`), and the readiness summary "Ready for the lecture?" (1o). Each SHALL show one line saying the screen is coming and no questions, trees, controls or learning content. (SE §6.6, wireframes 1a to 1o; the sandbox, 1n, is its own screen; every module from C2 to C8 has content)

#### Scenario: Headings
- **WHEN** each of `/module/C1/check`, `/module/C1/check/result`, `/module/C1/refresher`, `/module/C9/check` and `/readiness` is opened
- **THEN** each has the heading named above, and its text outside the heading, the breadcrumb and the back link is the one "coming" line

#### Scenario: No content
- **WHEN** each skeleton screen is rendered
- **THEN** it contains no `TreeView`, no radio input, no text input and no question text

#### Scenario: Activity of the right module
- **WHEN** `/module/C9/check` is shown
- **THEN** the breadcrumb names "C9 Am I ready" and "Check"
