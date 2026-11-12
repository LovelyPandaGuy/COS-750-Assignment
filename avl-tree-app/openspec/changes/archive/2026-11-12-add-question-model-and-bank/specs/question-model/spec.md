# Spec Delta

## Purpose

One model for every assessment item: its tags, how a seeded problem and its answer are built by the engine, how an answer is marked and explained, the attempt policy for checks and practice, and the validator that keeps a bank complete.

## ADDED Requirements

### Requirement: Every item is tagged
Every item SHALL carry an ID, the module it belongs to, its learning outcome (LO1 to LO9), one known sub-skill, a Bloom level (remember, understand, apply or analyse), an answer type (choice, number or tree), and whether it is optional. The item's sub-skill SHALL belong to the item's outcome. (FR-ASM-02, D7)

#### Scenario: Complete tags pass
- **GIVEN** an item with all tags, a sub-skill of its outcome and a known level
- **WHEN** the bank validator runs
- **THEN** it reports no tag problem for that item

#### Scenario: A missing or unknown tag fails
- **GIVEN** an item with no sub-skill, an unknown level, an outcome outside LO1 to LO9, or a sub-skill that belongs to a different outcome
- **WHEN** the bank validator runs
- **THEN** it reports a tag problem naming the item and the tag

### Requirement: The engine builds every problem and answer
An item SHALL NOT contain its answer. Instantiating an item with a seed SHALL produce the problem (keys, tree, marked node or scenario), the correct answer, and for choice items every option, all computed by the engine or by the comparison record. The same item, seed and attempt SHALL give the same instance. (CLAUDE.md guardrail, FR-ASM-07)

#### Scenario: Deterministic
- **WHEN** an item is instantiated twice with the same seed and attempt
- **THEN** the two instances are equal

#### Scenario: Answer matches the engine
- **GIVEN** any bank item and any seed from 0 to 99
- **WHEN** it is instantiated
- **THEN** its correct answer equals the answer computed by calling the engine directly on the instance's problem

### Requirement: Retries are new problems
Attempt `n + 1` of an item SHALL use a variant seed derived from the base seed and SHALL differ from attempt `n` in its problem. For choice items, it SHALL also present the options in an order derived from the new seed. Every variant SHALL pass the same checks as attempt 0. (FR-ASM-07, D9)

#### Scenario: A new problem on retry
- **GIVEN** any bank item and any seed from 0 to 99
- **WHEN** attempts 0, 1 and 2 are instantiated
- **THEN** each attempt's problem differs from the attempt before it

#### Scenario: Options reshuffle
- **GIVEN** a choice item
- **WHEN** attempt 0 and attempt 1 are instantiated for seeds 0 to 99
- **THEN** the option order differs between the two attempts for most seeds, and each instance still has exactly one correct option

### Requirement: Choice options
A choice instance SHALL have at least two options with distinct texts and exactly one correct option. Every wrong option SHALL carry one misconception tag from the catalogue and its own explanation, and the correct option SHALL carry an explanation too. An option's ID SHALL depend on the option's value, not its position, so marking does not depend on the shuffle. (FR-ASM-02, FR-ASM-03, D27)

#### Scenario: Wrong options are tagged and explained
- **GIVEN** any choice item and any seed from 0 to 99
- **WHEN** it is instantiated
- **THEN** each wrong option has a catalogue misconception and a non-empty explanation, and no two options share a text

#### Scenario: Marking a choice
- **WHEN** a choice instance is marked with an option's ID
- **THEN** the mark is correct only for the correct option, and it carries that option's explanation and, when wrong, its misconception

### Requirement: Number answers
A number instance SHALL accept a whole number typed as `2`, `+2`, `-2` or `−2`. A wrong number that equals a value produced by a known misconception SHALL be marked with that misconception and its explanation. Any other wrong number SHALL get the item's general explanation and no tag. A response that is not a whole number SHALL be reported as unreadable, not as wrong. (FR-ASM-03)

#### Scenario: Sign slip is recognised
- **GIVEN** a balance-factor instance whose answer is not 0
- **WHEN** it is marked with the negated answer
- **THEN** the mark is not correct, and it carries the subtraction-order misconception and its explanation

#### Scenario: Unreadable input
- **WHEN** a number instance is marked with `two` or an empty string
- **THEN** the mark says the input is unreadable and records no attempt outcome

### Requirement: Tree answers mark by structure
A tree instance SHALL be marked correct exactly when the student's tree has the same keys in the same shape as the engine's result; stored heights SHALL NOT matter. A wrong tree SHALL name the first step of the engine's trace the student's tree does not reach. When the student's tree equals a tree a known misconception produces, the mark SHALL carry that misconception. (FR-ASM-04)

#### Scenario: Structurally equal tree accepted
- **GIVEN** a trace-an-insert instance
- **WHEN** it is marked with a tree built separately with the same keys and shape as the engine's result
- **THEN** the mark is correct

#### Scenario: Stopped before rebalancing
- **GIVEN** an instance whose insert needs a rotation
- **WHEN** it is marked with the plain BST insert result
- **THEN** the mark is not correct, it names the first rotation step, and it carries the forgot-to-rebalance misconception

#### Scenario: One rotation for a bent shape
- **GIVEN** an instance whose insert needs two rotations
- **WHEN** it is marked with the tree after only the second single rotation applied at the unbalanced node
- **THEN** the mark carries the one-rotation-for-a-bent-shape misconception

#### Scenario: Keys lost or added
- **WHEN** a tree instance is marked with a tree whose keys differ from the engine's result
- **THEN** the mark names the insert step

### Requirement: Attempt policy
Checks and practice SHALL follow different attempt policies, both read from one config. A check SHALL allow at most `RETRY_CAP` (3) attempts per question, with the scaffold ladder as its hints. Practice SHALL allow unlimited retries and `PRACTICE_HINTS` (2) hints, and then offer review. (D9, D21, FR-SCA-03)

#### Scenario: Check policy
- **WHEN** the policy for a check is requested
- **THEN** its retry cap is 3 and its hints are the ladder

#### Scenario: Practice policy
- **WHEN** the policy for practice is requested
- **THEN** it has no retry cap, allows 2 hints, and offers review after them

#### Scenario: One place
- **WHEN** the source is scanned
- **THEN** the numbers 3 and 2 for these policies appear only in the config module

### Requirement: Attempt record
Marking a response SHALL produce an attempt record in the learner-storage `Attempt` shape: the item ID, the time, the response, whether it was correct, the confidence if given, the misconception if any, and the hints used. (FR-ASM-05 groundwork, D21, SE 6.3)

#### Scenario: Hints and misconception are recorded
- **GIVEN** a choice instance marked with a wrong option after 1 hint, with confidence "sure"
- **WHEN** the attempt record is built
- **THEN** it has `correct: false`, that option's misconception, `hintsUsed: 1` and `confidence: "sure"`, and it passes the learner-state validator

### Requirement: Bank validator
A validator SHALL check the whole bank over seeds 0 to 99 and report every problem without throwing: tags, duplicate IDs, instances that cannot be built, untagged or unexplained wrong options, numbers that are not instance facts, and sign, lean or case wording not read from the conventions module. A test SHALL fail on any problem. (FR-ASM-02, FR-ASM-03, D19)

#### Scenario: The bank is clean
- **WHEN** the validator runs over the bank
- **THEN** it reports no problems

#### Scenario: Typed case name is caught
- **GIVEN** an item whose explanation contains a case name written as text rather than through the conventions module
- **WHEN** the validator runs
- **THEN** it reports a wording problem for that item

#### Scenario: Invented number is caught
- **GIVEN** an item whose stem contains a number that is not a key, value or count of the instance
- **WHEN** the validator runs
- **THEN** it reports a number problem for that item
