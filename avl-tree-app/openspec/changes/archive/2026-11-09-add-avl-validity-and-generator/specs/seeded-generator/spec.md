# Spec Delta

## Purpose

Produces repeatable pseudo-random insert sequences and trees from a seed, so a retry can be a new variant and the same variant can be replayed, with every answer still computed by the engine.

## ADDED Requirements

### Requirement: Deterministic random source
The generator SHALL draw all randomness from a seeded source: the same seed gives the same values on every run, and different seeds give different values. (FR-ASM-07, D9)

#### Scenario: Same seed, same values
- **WHEN** two sources are created with seed 42 and each is read 10 times
- **THEN** the two lists of values are identical

#### Scenario: Different seeds differ
- **WHEN** sources are created with seeds 1 and 2 and each is read 5 times
- **THEN** the two lists differ

#### Scenario: Values stay in range
- **WHEN** a source is read 1000 times
- **THEN** every value is at least 0 and below 1

#### Scenario: Pinned outputs
- **WHEN** a source is created with seed 12345
- **THEN** its first three values equal the values recorded in the test, so a change to the algorithm is caught

### Requirement: Seeded insert sequences
The generator SHALL return a sequence of distinct integer keys of the requested length within the requested inclusive range, in a seeded random order. It SHALL reject a request for more keys than the range holds. (FR-ASM-07)

#### Scenario: Length, range and distinctness
- **WHEN** a sequence of 7 keys in the range 1 to 99 is generated for seeds 1 to 50
- **THEN** each sequence has 7 distinct integers, all within 1 to 99

#### Scenario: Repeatable
- **WHEN** the same seed and options are used twice
- **THEN** the sequences are identical

#### Scenario: Range too small
- **WHEN** 10 keys are requested from the range 1 to 5
- **THEN** the request is rejected

### Requirement: Seeded trees
The generator SHALL build a tree from a seeded insert sequence, either by plain BST insert or by AVL insert, and return the keys and the tree. (FR-ASM-07, NFR-08)

#### Scenario: AVL trees are valid
- **WHEN** AVL trees are generated for seeds 1 to 50
- **THEN** each is a valid AVL tree and a BST whose in-order sequence is its sorted keys

#### Scenario: Plain trees are BSTs
- **WHEN** plain trees are generated for seeds 1 to 50
- **THEN** each is a BST whose in-order sequence is its sorted keys

#### Scenario: Repeatable
- **WHEN** the same seed and options are used twice
- **THEN** the trees are identical

### Requirement: Case-targeted sequences
The generator SHALL return an insert sequence of distinct keys whose last AVL insert triggers a chosen rebalancing case (LL, RR, LR or RL). It SHALL reject a request that cannot be met, such as a sequence too short to cause any rebalance. (FR-ASM-07)

#### Scenario: Each case is produced
- **WHEN** a sequence is generated for each of the four cases for seeds 1 to 50
- **THEN** the last AVL insert reports the requested case, and the sequence has distinct keys within the range

#### Scenario: Repeatable
- **WHEN** the same seed, case and options are used twice
- **THEN** the sequences are identical

#### Scenario: Impossible request
- **WHEN** a case is requested with a sequence length of 2
- **THEN** the request is rejected

### Requirement: Retry variants
The generator SHALL derive a seed for each retry attempt from a base seed, so the attempts give different variants and the same base seed always gives the same attempts. (D9, FR-ASM-07)

#### Scenario: Attempts differ
- **WHEN** seeds for attempts 0 to 3 are derived from base seeds 1 to 20
- **THEN** the four seeds for each base seed are distinct and the sequences generated from them are distinct

#### Scenario: Repeatable
- **WHEN** the same base seed and attempt number are used twice
- **THEN** the derived seeds are equal
