# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Node roles by shape, text and colour`
- TO: `### Requirement: Node states by colour, shape and text`

- FROM: `### Requirement: Height and balance factor on every node`
- TO: `### Requirement: Node values follow the screen's show list`

## MODIFIED Requirements

### Requirement: Node states by colour, shape and text
`TreeView` SHALL draw each node in one of the ID's states: balanced (fill `#0072B2`, white text), unbalanced (fill `#E69F00`, near-black text, a "!" marker and a thick dashed outline), being rotated (fill `#F0E442`, near-black text, a bold outline) or newly inserted (fill `#56B4E9`, near-black text, a "NEW" tag beside the node). Balanced and unbalanced come from the node's balance factor and `isOutOfBalance`; being rotated and newly inserted come from the `roles` prop, and a role wins over the balance state. The first unbalanced node of a step SHALL carry the tag "n" (`conventions.unbalancedNode`). Every state SHALL carry text naming it for assistive technology. The fills SHALL be tokens. No state SHALL use red or colour alone. (ID 11.1, FR-VIS-02, NFR-02; supersedes D25 for tree nodes)

#### Scenario: Each role is distinguishable without colour
- **WHEN** one node of each state is rendered
- **THEN** balanced shows its balance factor, unbalanced shows "!" and a dashed outline, being rotated has a bold outline, newly inserted has a "NEW" tag, and each node's accessible name names its state

#### Scenario: Tag text contrast
- **WHEN** each state's text colour is compared with its fill, and the "NEW" and "n" tag colours with `--bg-surface` in both themes
- **THEN** each ratio is at least 4.5:1

#### Scenario: Roles are data
- **WHEN** the same tree is rendered with different `roles`
- **THEN** the shapes and positions are identical and only fills, outlines and tags change

#### Scenario: State from the balance factor
- **WHEN** the plain BST from 10, 20, 30 is rendered with no roles
- **THEN** node 10 is drawn unbalanced with "!" and nodes 20 and 30 are drawn balanced

### Requirement: Node values follow the screen's show list
`TreeView` SHALL show on each node the values its `show` prop names: `height` (as "h2"), `balanceFactor` (as "bf +1", a true minus sign for negative, "0" for zero), or `balanceFactor:root` (the root's balance factor only). With no `show` prop it SHALL show the balance factor on every node (ID 8.3 "Every node shows its balance factor"). The numbers SHALL be the node's stored height and the balance factor from its children's stored heights, using the conventions module. (FR-VIS-09, ID 7.3, ID 8.3)

#### Scenario: Values match the engine
- **GIVEN** random AVL trees and random BSTs of up to 15 nodes with correct heights
- **WHEN** they are rendered with `show` of height and balance factor
- **THEN** for every node the shown height equals the node's height and the shown balance factor equals `balanceFactorOf` of its subtree

#### Scenario: Convention
- **WHEN** a single node and the three-node chain from 10, 20, 30 are rendered
- **THEN** the single node shows "bf 0" and the chain's root shows "bf +2"

#### Scenario: Show list
- **WHEN** the tree of `c3-s01` is rendered with `show` of `balanceFactor:root`
- **THEN** only the root shows a balance factor, "bf 0", and no other node shows a number

#### Scenario: Default
- **WHEN** a tree is rendered with no `show` prop
- **THEN** every node shows its balance factor and no node shows its height

#### Scenario: Flag is text
- **GIVEN** a tree with an out-of-balance node and a balanced tree
- **WHEN** both are rendered
- **THEN** "!" and the accessible text "Unbalanced" appear once on each out-of-balance node and nowhere in the balanced tree, and both are present with all styles removed (so they survive greyscale)

#### Scenario: Stale heights are shown as stored
- **GIVEN** a tree whose stored height on one node differs from its real height
- **WHEN** it is rendered with `show` of height
- **THEN** the shown values follow the stored heights
