# Spec Delta

## Purpose

Holds the height convention, balance-factor definition and rebalancing case names in one module, and computes height and balance factor from them, so no other file hard-codes a convention.

## ADDED Requirements

### Requirement: Single conventions module
The engine SHALL read the height of a leaf, the height of an empty tree, the balance-factor definition and the case names from one conventions module. No other source file SHALL hard-code them. (FR-ENG-10, D2)

#### Scenario: Default convention values
- **WHEN** the conventions module is read
- **THEN** a leaf has height 0, an empty tree has height -1, balance factor is height(left) minus height(right), and the case names are LL, RR, LR and RL

#### Scenario: Changing the constant changes the results
- **GIVEN** the empty-tree height constant is overridden in a test to 0 and the leaf height follows from it
- **WHEN** heights and balance factors are computed for the same trees
- **THEN** every height and balance-factor expectation derived from the module changes accordingly

#### Scenario: No other file hard-codes the convention
- **WHEN** a repository scan checks `src/` outside `src/engine/conventions.ts`
- **THEN** no file defines the leaf height, empty-tree height or balance-factor sign as a literal

### Requirement: Height of a tree
The engine SHALL compute the height of any tree in edges using the conventions module. (FR-ENG-03)

#### Scenario: Empty tree
- **WHEN** the height of the empty tree is computed
- **THEN** the result is the empty-tree height from the conventions module (-1 by default)

#### Scenario: Single node
- **WHEN** the height of a one-node tree is computed
- **THEN** the result is the leaf height from the conventions module (0 by default)

#### Scenario: Stored height agrees with computed height
- **WHEN** a tree is built by any engine operation
- **THEN** every node's stored height equals one more than the greater of its children's heights

### Requirement: Balance factor of a node
The engine SHALL compute the balance factor of a node as the height of its left subtree minus the height of its right subtree, with an empty subtree counted at the empty-tree height. (FR-ENG-03)

#### Scenario: Balanced single node
- **WHEN** the balance factor of a one-node tree is computed
- **THEN** the result is 0

#### Scenario: Left-heavy tree
- **GIVEN** keys 3, 2, 1 inserted into a BST in that order
- **WHEN** the balance factor of the root is computed
- **THEN** the result is +2

#### Scenario: Right-heavy tree
- **GIVEN** keys 1, 2, 3 inserted into a BST in that order
- **WHEN** the balance factor of the root is computed
- **THEN** the result is -2

#### Scenario: Empty tree
- **WHEN** the balance factor of the empty tree is requested
- **THEN** the result is 0
