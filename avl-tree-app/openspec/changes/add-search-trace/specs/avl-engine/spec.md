# Spec Delta

## ADDED Requirements

### Requirement: Search trace steps
Each step of a search trace SHALL carry its index in order from 0, a kind, the keys involved, the tree before and after, and a pseudocode line. For each node visited the trace SHALL hold a compare step, then either a found step or a descend step. A search that ends at an empty subtree SHALL end with a not-found step. (FR-ENG-06 in part, FR-ENG-09)

#### Scenario: Found key
- **GIVEN** the AVL tree built from 20, 10, 30, 5, 15
- **WHEN** key 15 is searched
- **THEN** the steps are, in order: compare 20, descend from 20 to 10, compare 10, descend from 10 to 15, compare 15, found 15
- **AND** their indexes are 0 to 5

#### Scenario: Missing key
- **GIVEN** the same tree
- **WHEN** key 12 is searched
- **THEN** the steps are compare 20, descend 20 to 10, compare 10, descend 10 to 15, compare 15, descend from 15 with no target, not-found at 15

#### Scenario: Root key
- **WHEN** key 20 is searched in the same tree
- **THEN** the steps are compare 20, found 20

#### Scenario: Empty tree
- **WHEN** any key is searched in the empty tree
- **THEN** the only step is not-found with no keys, and the step count is 0

#### Scenario: Before and after
- **WHEN** any search is traced
- **THEN** every step's before and after are the searched tree, unchanged, and no step has a rebalance case

### Requirement: Pseudocode line maps
The engine SHALL define, for the loop form and the recursive form of search, the pseudocode line each kind of step corresponds to, and each step's pseudocode line SHALL come from that map. The numbering follows the ID's pseudocode. (FR-ENG-09, FR-VIS-04) [OPEN] the line layout needs checking against the ID PDF (proposal, question 1).

#### Scenario: Loop form lines
- **WHEN** key 12 is searched in the loop form in the tree above
- **THEN** compare steps use the equality-test line, descend-left steps use the go-left line, descend-right steps use the go-right line, and the not-found step uses the final return line

#### Scenario: Recursive form lines
- **WHEN** the same search is made in the recursive form
- **THEN** the compare and found steps use the equality-test line, descend steps use the matching recursive-call line, and the not-found step uses the empty-subtree test line

#### Scenario: Forms differ only in lines
- **WHEN** the same key is searched in both forms in any tree
- **THEN** the steps have the same kinds, keys and indexes, and differ only in pseudocode lines

## MODIFIED Requirements

### Requirement: Search with a trace
The engine SHALL implement search in loop and recursive forms, record each node visited and each comparison, and report the number of steps for found and not-found keys. The number of steps SHALL be the number of nodes visited.

#### Scenario: Found and not found
- **WHEN** a present key and a missing key are searched
- **THEN** the trace matches the hand-worked examples
- **AND** the step count equals the number of nodes visited

#### Scenario: Step counts for the root, a leaf and a missing key
- **GIVEN** the AVL tree built from 20, 10, 30, 5, 15
- **WHEN** keys 20, 5 and 12 are searched
- **THEN** the step counts are 1, 3 and 3

#### Scenario: Step count against height
- **WHEN** keys 1 to 15 are inserted by AVL insert and every key from 0 to 16 is searched
- **THEN** each step count is at most the tree's height plus one under the conventions module
- **AND** searching key 15 in the plain chain built from 1 to 15 takes 15 steps

#### Scenario: Result agrees with plain search
- **WHEN** any key is searched in any tree in either form
- **THEN** the found result equals the result of the plain search
