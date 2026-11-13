# bst-refresher Specification

## Purpose
A short refresher on the binary search tree ideas the course assumes, shown after a low diagnostic result or on request.

## ADDED Requirements

### Requirement: A short sequence
The refresher at `/module/C1/refresher` SHALL be a sequence of 5 to 7 steps on the step player, headed "BST refresher", covering tree terms (root, leaf, child, subtree), the ordering property, search, insert and height (leaf 0, empty −1). It SHALL end by offering the re-check when the diagnostic routed here, and C2 otherwise. (ID C1, FR-DIA-03, D2)

#### Scenario: Topics
- **WHEN** the refresher's steps are read
- **THEN** its headings cover terms, ordering, search, insert and height, in that order

#### Scenario: Heading
- **WHEN** the refresher is opened
- **THEN** its level-1 heading is "BST refresher"

#### Scenario: Ending
- **WHEN** the last step is shown after a refresher route
- **THEN** a link to the re-check is offered; after any other route a link to C2 is

### Requirement: Facts and wording from the engine
Every number, tree and answer in the refresher SHALL come from the engine through the content validator: no typed numbers, no sign, lean or case wording outside the conventions module, and no unverified claim about a figure. The sequence SHALL be validated for the events it has: a hook and a goals step each once and at least one recall, with no check or summary required. (D7, D19, FR-DIA-05)

#### Scenario: Validator clean
- **WHEN** the refresher is validated
- **THEN** it reports no problem

#### Scenario: Missing hook caught
- **GIVEN** a refresher with no hook step
- **WHEN** it is validated
- **THEN** an order problem is reported

### Requirement: Reachable, skippable, calm
The refresher SHALL be reachable from the result, the C1 module screen and the hub, whatever the learner state; its explanation steps SHALL offer "I know this, skip" as module steps do; and its text SHALL use no mark, grade, pass, fail, test or score wording. (FR-DIA-04, D20, FR-DIA-05)

#### Scenario: Reachable
- **WHEN** the C1 module screen is shown for any learner state
- **THEN** it links to the refresher

#### Scenario: Skip on content steps
- **WHEN** a content step of the refresher is shown
- **THEN** "I know this, skip" is offered
