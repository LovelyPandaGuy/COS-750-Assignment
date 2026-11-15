# Spec Delta

## MODIFIED Requirements

### Requirement: Text description
`describeTree(tree, roles)` SHALL return a text description with one sentence per node in pre-order (root, then the left subtree, then the right subtree), giving the key, which side of which parent it is on, its height, its balance factor, "unbalanced" when out of balance, and its role when it has one. The empty tree SHALL be described as empty. `TreeView` SHALL show the description behind a small disclosure button, "ℹ Describe" (named "Describe tree"), at the right of a thin header strip across the top of the tree box, above the drawing, with a 44 px target; the description opens inside the box under the strip and is linked to the drawing with `aria-describedby`. Wording comes from `src/content/treeView.ts`. (FR-VIS-07, FR-VIS-09, D166)

#### Scenario: Whole tree in order
- **GIVEN** a tree of up to 15 nodes
- **WHEN** it is described
- **THEN** every key appears exactly once as a subject, in pre-order, and each non-root sentence names its parent and side

#### Scenario: Numbers match the drawing
- **WHEN** a tree is described and rendered
- **THEN** each node's height and balance factor in the description equal those drawn

#### Scenario: Roles and flag in the text
- **GIVEN** a node with role z whose balance factor is +2
- **WHEN** the tree is described
- **THEN** that node's sentence contains "unbalanced" and the role name

#### Scenario: Empty tree
- **WHEN** the empty tree is rendered
- **THEN** the drawing has no nodes and the description says the tree is empty

#### Scenario: Disclosure
- **WHEN** the disclosure button is activated
- **THEN** `aria-expanded` is true and the description is visible inside the tree box, and activating it again hides it

#### Scenario: In the header strip, never over a node
- **WHEN** a tree is rendered
- **THEN** the button is inside the tree box's header strip, before the drawing in the DOM, shows "ℹ Describe", is named "Describe tree", and the strip's stylesheet places it at the right with a `min-height` of `var(--target-min)`

#### Scenario: Wording is content
- **WHEN** `describe.ts` and `TreeView.tsx` are read
- **THEN** the sentence templates and the words "Unbalanced", "new", "z", "y" and "balanced" come from `src/content/treeView.ts`
