# readiness-check Specification

## Purpose

The closing readiness check of module C9: one item per learning outcome plus two combined items, with every answer computed by the engine, and a session in which each missed item comes back once as a new problem.

## Requirements

### Requirement: One item per outcome and two combined items
The readiness bank SHALL hold exactly one non-combined item for each of LO1 to LO9, and exactly two combined items: one that builds an AVL tree from keys (LO7) and one that searches that tree (LO4). Every item SHALL belong to module C9. Only the LO8 item SHALL be optional. (FR-ASM-06, D4, ID C9)

#### Scenario: Coverage
- **WHEN** the readiness bank is read
- **THEN** each of LO1 to LO9 has exactly one non-combined item, there are exactly two combined items with outcomes LO7 and LO4, and every item's module is C9

#### Scenario: Only LO8 is optional
- **WHEN** the readiness bank is read
- **THEN** the LO8 item is optional and no other item is

#### Scenario: Module checks are unchanged
- **WHEN** the module-check bank is grouped by module
- **THEN** C9 still has no items in it, and the module-check validator still reports nothing

### Requirement: The readiness bank is validated like the checks
The readiness bank SHALL pass the same item checks as the module checks over seeds 0 to 99: tags, explanations, engine-built answers, options, numbers, D19 wording and calm wording. A validator SHALL also report a missing or extra item for any outcome and a wrong number of combined items. (FR-ASM-02, FR-ASM-03, D19, D27)

#### Scenario: The readiness bank is clean
- **WHEN** the readiness validator runs over the readiness bank
- **THEN** it reports no problems

#### Scenario: A missing outcome is caught
- **GIVEN** the readiness bank without its LO5 item
- **WHEN** the readiness validator runs
- **THEN** it reports a problem naming LO5

#### Scenario: Every answer comes from the engine
- **GIVEN** any readiness item and any seed from 0 to 99
- **WHEN** it is instantiated
- **THEN** its correct answer equals the answer computed by calling the engine directly on the instance's problem

### Requirement: Worst-case search item
The LO5 item SHALL ask how many nodes a worst-case search visits in a plain BST and in an AVL tree that hold the same number of keys. The correct option SHALL pair the plain BST's worst case (every key) with the AVL tree's worst case (its maximum height plus one, from the engine). The wrong options SHALL be "both as few as the AVL tree" (expects every BST search to be short) and "both every key" (expects a search to look at every node). (LO5, D13)

#### Scenario: Engine worst cases
- **GIVEN** any seed from 0 to 99
- **WHEN** the LO5 item is instantiated
- **THEN** the correct option's numbers are the key count and the engine's AVL worst case for that count, and the AVL worst case is smaller than the key count

#### Scenario: Wrong options are tagged
- **WHEN** the LO5 item is instantiated for seeds 0 to 99
- **THEN** its two wrong options carry the expects-every-search-short and the expects-to-visit-every-node misconceptions

### Requirement: Build, then search the same tree
The build item SHALL give keys, from a sequence whose AVL build needs at least one rotation, and its answer SHALL be the AVL tree the engine builds from them, marked by structure. Building the plain BST of the keys SHALL be recognised as forgetting to rebalance. The search item SHALL, for the same seed, show the tree the build item's answer gives, and ask how many nodes a search for one of its keys visits. (ID C9, FR-ASM-04, LO4, LO7)

#### Scenario: The build needs a rotation
- **GIVEN** any seed from 0 to 99
- **WHEN** the build item is instantiated
- **THEN** inserting its keys into an empty AVL tree performs at least one rotation, and its answer equals that tree

#### Scenario: Plain BST build is recognised
- **GIVEN** any seed from 0 to 99
- **WHEN** the build instance is marked with the plain BST of its keys
- **THEN** the mark is not correct and carries the forgot-to-rebalance misconception

#### Scenario: The search uses the built tree
- **GIVEN** any seed from 0 to 99
- **WHEN** the build and search items are instantiated with that seed
- **THEN** the search instance's tree has the same keys and shape as the build instance's answer, and its answer equals the engine's search visit count for its key

### Requirement: The C9 session runs every item, then the returns
A C9 session started with a seed SHALL present every readiness item once, in bank order, with the two combined items sharing one seed. A readable answer SHALL be marked and SHALL produce an attempt record with no hints used. An unreadable answer SHALL change nothing. (FR-ASM-06)

#### Scenario: Every item once, in order
- **WHEN** a session is answered correctly item after item
- **THEN** it presents each readiness item once in bank order and then ends with no returns

#### Scenario: Combined items share a seed
- **WHEN** a session is started with any seed from 0 to 99
- **THEN** the build and search items' instances come from the same seed

#### Scenario: Unreadable input counts for nothing
- **GIVEN** a session on a number item
- **WHEN** it is answered with `two`
- **THEN** the session is unchanged and no attempt record is produced

### Requirement: A missed item returns once as a new problem
After the first pass, every item answered wrongly SHALL be presented again once, in the order it was missed, as the question model's next attempt for that item. A missed return SHALL NOT come back again. The number of returns SHALL be read from the config. (FR-ASM-06, FR-ASM-07, D9, D14)

#### Scenario: Missed items come back at the end
- **GIVEN** a session where the LO2 and LO6 items are answered wrongly and the rest correctly
- **WHEN** the first pass ends
- **THEN** the LO2 item and then the LO6 item are presented, each as attempt 1, whose problem differs from attempt 0

#### Scenario: Each returns only once
- **WHEN** any sequence of answers (property test) is applied until the session ends
- **THEN** no item is presented more than `READINESS_RETURNS` + 1 times, and the session always ends

#### Scenario: One place
- **WHEN** the source is scanned
- **THEN** the number of returns is defined only in the config module

### Requirement: Only the optional item may be skipped
The session SHALL let the student skip the LO8 item, recording no attempt, and SHALL NOT let any other item be skipped. A skipped item SHALL NOT return. (D4, D20)

#### Scenario: Skip LO8
- **GIVEN** a session presenting the LO8 item
- **WHEN** the student skips it
- **THEN** the next item is presented, no attempt record is produced, and LO8 does not return

#### Scenario: No skip elsewhere
- **GIVEN** a session presenting any non-optional item
- **WHEN** a skip is requested
- **THEN** the session is unchanged
