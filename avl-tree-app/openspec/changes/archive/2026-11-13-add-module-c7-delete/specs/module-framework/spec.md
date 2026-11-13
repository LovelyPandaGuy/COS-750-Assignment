# Spec Delta

## MODIFIED Requirements

### Requirement: Facts come from the engine
A step SHALL name its trees by source (keys inserted into a plain BST, keys inserted into an AVL tree, either of those followed by deletes with or without rebalancing, or a seeded generator) and any search key or tree size. The framework SHALL build each tree and compute its facts with the engine: height, node count, keys, search step count for the named key, best and worst case search step counts for a size, the most nodes a search can visit in an AVL tree of that size, AVL validity, and for each delete the key, its number of children, its in-order successor when it had two, and every rebalance with its node. Step text SHALL receive these facts and SHALL NOT contain them typed. (Guardrail, FR-ENG-03, FR-ENG-06, D13)

#### Scenario: Chain facts
- **GIVEN** a step whose tree is keys 10, 20, 30, 40, 50 into a plain BST, with search key 50
- **WHEN** its facts are computed
- **THEN** the height is 4, the node count is 5 and the search step count is 5

#### Scenario: AVL facts
- **GIVEN** a step whose tree is keys 10, 20, 30, 40, 50 into an AVL tree
- **WHEN** its facts are computed
- **THEN** the root is 20 and the height is 2, and the tree is a valid AVL tree

#### Scenario: Bounds for a size
- **WHEN** the search bounds for 5 keys and for 1,000,000 keys are computed
- **THEN** the worst case is 5 and 1,000,000 steps, and the best case is 3 and 20 steps (the height of the shortest tree plus one)

#### Scenario: AVL worst case for a size
- **WHEN** the AVL worst-case search bound for 1,000,000 keys is computed
- **THEN** it is 28 steps, because the tallest AVL tree of 1,000,000 keys has height 27

#### Scenario: AVL worst case matches the minimum node counts
- **WHEN** the AVL worst-case bound is computed for every n from 1 to 2,000
- **THEN** for each n it is h + 1, where h is the largest height whose minimum AVL node count (1 for height 0, 2 for height 1, then the two before plus one) is at most n

#### Scenario: Delete facts, two children
- **GIVEN** a step whose tree is keys 50, 30, 70, 20, 40, 60, 80 into a plain BST, then 50 deleted without rebalancing
- **WHEN** its facts are computed
- **THEN** the delete of 50 had 2 children and its successor is 60, the root is 60 and 50 is not in the tree

#### Scenario: Delete facts, rebalances
- **GIVEN** a step whose tree is keys 8, 5, 11, 3, 7, 10, 12, 2, 4, 6, 9, 1 into an AVL tree, then 12 deleted with rebalancing
- **WHEN** its facts are computed
- **THEN** the delete records the engine's rebalances, at 11 and then at 8, and the tree is a valid AVL tree

#### Scenario: Delete without rebalancing
- **GIVEN** a step whose tree is keys 20, 10, 30, 40 into an AVL tree, then 10 deleted without rebalancing
- **WHEN** its facts are computed
- **THEN** no rebalance is recorded and node 20 is out of balance

## ADDED Requirements

### Requirement: Delete claims are checked
A step MAY claim that a delete in one of its figures needs more than one rebalance. The validator SHALL compute the claim with the engine and report it when it is false. (ID C7)

#### Scenario: True claim
- **GIVEN** the two-rebalance delete of 12 above, claimed to need more than one rebalance
- **WHEN** the validator checks it
- **THEN** it reports no claim problem

#### Scenario: False claim
- **GIVEN** keys 20, 10, 30, 40 into an AVL tree, then 10 deleted with rebalancing, claimed to need more than one rebalance
- **WHEN** the validator checks it
- **THEN** it reports a claim problem naming the step
