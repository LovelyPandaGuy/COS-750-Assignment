# conventions Specification

## Purpose
One place defines how heights, balance factors and case names are counted, so code, labels, tests and feedback cannot disagree. Source: decision D2 and FR-ENG-03, FR-ENG-10.

## Requirements

### Requirement: Height is counted in edges
The system SHALL count the height of a node in edges, so a leaf has height 0 and an empty tree has height -1.

#### Scenario: Leaf and empty tree
- **WHEN** the height of a single node is requested
- **THEN** the result is 0
- **AND** the height of an empty tree is -1

### Requirement: Balance factor is left minus right
The system SHALL define the balance factor of a node as the height of its left subtree minus the height of its right subtree.

#### Scenario: Left-heavy node
- **WHEN** a node has a left subtree of height 1 and an empty right subtree
- **THEN** its balance factor is +2

### Requirement: One conventions module
The system SHALL read the height convention, the balance-factor definition and the case names from a single module, and no other file SHALL hard-code them.

#### Scenario: Changing the convention
- **WHEN** the convention constant in the conventions module is changed
- **THEN** every label and every test expectation that depends on it changes with it
