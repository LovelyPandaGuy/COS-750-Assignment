# Spec Delta

## Purpose

Module C2 "When BSTs go lopsided": shows that search cost follows tree height and that insertion order can make a BST into a chain, so students meet the problem before the AVL rule (LO1).

## ADDED Requirements

### Requirement: C2 opens with the chain problem
The C2 hook SHALL show keys 10, 20, 30, 40, 50 inserted in that order into a plain BST, state the engine's search step count for 50, and ask what happens with a million sorted keys. The goals step SHALL state LO1 as written in the ID. (ID C2, LO1)

#### Scenario: Hook facts
- **WHEN** the C2 hook step is rendered
- **THEN** it shows a chain of 5 nodes rooted at 10, and its text names 50 and the step count 5 computed by the engine

#### Scenario: Goals
- **WHEN** the C2 goals step is rendered
- **THEN** its text contains the LO1 objective from the ID

### Requirement: C2 explains that search cost follows height
C2 SHALL have content steps that state that search time depends on height, and give the best case (about log2 n) and worst case (n) search step counts for the chain's size and for a million keys, all computed by the engine. (ID C2, LO1)

#### Scenario: Bounds shown
- **WHEN** the C2 bounds step is rendered
- **THEN** its text contains the engine's best and worst case step counts for 5 keys (3 and 5) and for 1,000,000 keys (20 and 1,000,000)

### Requirement: C2 shows that insertion order decides the shape
C2 SHALL have a worked-example step that inserts the same five keys in a different order into a plain BST and compares its height with the chain's, both computed by the engine. (ID C2, LO1)

#### Scenario: Two orders, two heights
- **GIVEN** the order 30, 20, 40, 10, 50 and the order 10, 20, 30, 40, 50
- **WHEN** the step is rendered
- **THEN** both trees are drawn, and the text gives heights 2 and 4 from the engine

### Requirement: C2 previews the AVL shape
C2 SHALL have a worked-example step that inserts 10, 20, 30, 40, 50 into an AVL tree and states its height, computed by the engine, beside the chain. It SHALL NOT explain rotations. (ID C2 "Preview")

#### Scenario: Preview height
- **WHEN** the preview step is rendered
- **THEN** it shows the AVL tree rooted at 20 and the chain, and its text gives height 2 for the AVL tree and 4 for the chain

### Requirement: C2 closes with a summary
The C2 Check activity SHALL hold the check placeholder and then a summary that restates the three ideas of C2: height decides search cost, insertion order decides shape, and a balanced tree keeps height near log2 n. (ID C2, D10)

#### Scenario: Summary present
- **WHEN** the C2 Check activity is walked to its end
- **THEN** the last step is the C2 summary and Next from it goes to the path
