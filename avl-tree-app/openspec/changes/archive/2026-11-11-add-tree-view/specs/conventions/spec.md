# Spec Delta

## ADDED Requirements

### Requirement: Out-of-balance test
The conventions module SHALL export `isOutOfBalance(balanceFactor)`, true when the balance factor is below -1 or above +1. UI code SHALL use it instead of comparing balance factors itself. (D2, FR-ENG-10)

#### Scenario: Range
- **WHEN** `isOutOfBalance` is called with -2, -1, 0, 1 and 2
- **THEN** it returns true, false, false, false and true

#### Scenario: Agrees with the engine check
- **GIVEN** any tree whose stored heights are correct
- **WHEN** each node's balance factor is passed to `isOutOfBalance`
- **THEN** the nodes it flags are exactly the nodes in `analyseTree(tree).balanceViolations`
