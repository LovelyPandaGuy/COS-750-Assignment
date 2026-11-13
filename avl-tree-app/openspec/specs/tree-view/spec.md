# tree-view Specification

## Purpose
Draws a tree from engine state with its roles, heights and balance factors, describes it in text, and lets a keyboard, pointer or touch user move around it and select a node.

## Requirements


### Requirement: Layout without overlap
`layoutTree(tree)` SHALL return a position for every node. x SHALL increase with the in-order position of the key, y SHALL increase with depth, and no two nodes SHALL overlap. The result SHALL depend only on the tree. (FR-VIS-01)

#### Scenario: Keys left to right
- **GIVEN** any tree of up to 15 nodes
- **WHEN** it is laid out
- **THEN** sorting the nodes by x gives the keys in ascending order, with distinct x values

#### Scenario: Parents above children
- **GIVEN** any tree of up to 15 nodes
- **WHEN** it is laid out
- **THEN** each child is lower than its parent, a left child is left of its parent and a right child is right of it

#### Scenario: No overlap
- **GIVEN** perfect trees, chains (all left, all right, zig-zag) and random AVL and BST trees of up to 15 nodes
- **WHEN** they are laid out
- **THEN** every pair of nodes is at least one node diameter apart

#### Scenario: Pure and empty
- **WHEN** the same tree is laid out twice, and when the empty tree is laid out
- **THEN** the results are equal, and the empty tree has no nodes and a size of zero

### Requirement: Node roles by shape, text and colour
`TreeView` SHALL draw each node with a role from its `roles` prop (new, z, y, balanced) or neutral when it has none. Each role SHALL differ in ring style, in text and in colour: neutral a thin solid grey ring; new a dotted ring and the tag "new"; z a double ring and the tag "z"; y a dashed ring and the tag "y"; balanced a thick solid ring and a check badge with the text "balanced" for assistive technology. Role colours SHALL be the `--tree-*` tokens and tag text SHALL be at least 4.5:1 against `--bg-surface`. No role SHALL use red. (FR-VIS-02, NFR-02)

#### Scenario: Each role is distinguishable without colour
- **WHEN** one node of each role is rendered
- **THEN** the five roles (neutral, new, z, y, balanced) have five different ring style values (solid, dotted, double, dashed, thick), and every role other than neutral has text (visible or screen-reader only) naming it

#### Scenario: Tag text contrast
- **WHEN** the tag colours `--tree-new`, `--tree-z`, `--tree-y` and `--tree-balanced` are compared with `--bg-surface` in the light theme
- **THEN** each ratio is at least 4.5:1

#### Scenario: Roles are data
- **WHEN** the same tree is rendered with different `roles`
- **THEN** the shapes and positions are identical and only ring style, tags and colours change

### Requirement: Height and balance factor on every node
`TreeView` SHALL show on every node its height and its balance factor, in the form "h2 · bf +1" (a minus sign for negative, "0" for zero), and SHALL show the text "Unbalanced" on every node for which `isOutOfBalance` is true. The numbers SHALL be the node's stored height and the balance factor from its children's stored heights, using the conventions module. (FR-VIS-09, D2)

#### Scenario: Values match the engine
- **GIVEN** random AVL trees and random BSTs of up to 15 nodes with correct heights
- **WHEN** they are rendered
- **THEN** for every node the shown height equals the node's height and the shown balance factor equals `balanceFactorOf` of its subtree

#### Scenario: Convention
- **WHEN** a single node and a three-node chain are rendered
- **THEN** the single node shows "h0 · bf 0" and the chain's root shows "h2 · bf +2"

#### Scenario: Flag is text
- **GIVEN** a tree with an out-of-balance node and a balanced tree
- **WHEN** both are rendered
- **THEN** "Unbalanced" appears once on each out-of-balance node and nowhere in the balanced tree, and the text is present with all styles removed (so it survives greyscale)

#### Scenario: Stale heights are shown as stored
- **GIVEN** a tree whose stored height on one node differs from its real height
- **WHEN** it is rendered
- **THEN** the shown values follow the stored heights

### Requirement: Text description
`describeTree(tree, roles)` SHALL return a text description with one sentence per node in pre-order (root, then the left subtree, then the right subtree), giving the key, which side of which parent it is on, its height, its balance factor, "unbalanced" when out of balance, and its role when it has one. The empty tree SHALL be described as empty. `TreeView` SHALL show the description in a disclosure button of 44 px and link it to the drawing with `aria-describedby`. Wording comes from `src/content/treeView.ts`. (FR-VIS-07, FR-VIS-09)

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
- **THEN** `aria-expanded` is true and the description is visible, and activating it again hides it

#### Scenario: Wording is content
- **WHEN** `describe.ts` and `TreeView.tsx` are read
- **THEN** the sentence templates and the words "Unbalanced", "new", "z", "y" and "balanced" come from `src/content/treeView.ts`

### Requirement: Read-only and interactive modes
A read-only `TreeView` SHALL be `role="img"` with an accessible name and the description, and SHALL have no focusable nodes. An interactive `TreeView` SHALL be `role="tree"` with `role="treeitem"` nodes, each with an accessible name giving its key, height and balance factor, an `aria-level`, and `aria-selected`. (NFR-02)

#### Scenario: Read-only
- **WHEN** a read-only tree is rendered
- **THEN** it has role img, no element inside has a tabindex, and axe reports no violations

#### Scenario: Interactive
- **WHEN** an interactive tree of seven nodes is rendered
- **THEN** there are seven treeitems, the root has level 1 and its children level 2, and axe reports no violations

### Requirement: Keyboard navigation and selection
An interactive `TreeView` SHALL have one tab stop (roving tabindex): the selected node, otherwise the root. Up SHALL move focus to the parent, Left to the left child and Right to the right child. A move with no target SHALL do nothing. Enter SHALL select the focused node, show it with a rounded-square frame, call `onSelect(key)` and announce "Node 30 selected" in a polite live region. Click and tap SHALL select a node too. Every node SHALL have a target of at least 44 px. Focus SHALL use the single focus style from `tokens.css`. (FR-VIS-10, NFR-02, design "Node anatomy")

#### Scenario: One tab stop
- **WHEN** an interactive tree is rendered and has no selection
- **THEN** exactly one treeitem has tabindex 0 and it is the root; the others have -1

#### Scenario: Arrow keys
- **GIVEN** a tree with root 40, left child 20 and right child 60, focus on 40
- **WHEN** Left, Up, Right, Right, Up are pressed in turn
- **THEN** focus is on 20, 40, 60, 60 (no right child, no change), 40

#### Scenario: Missing target is silent
- **WHEN** Up is pressed on the root, or Left on a leaf
- **THEN** focus does not move and the live region text does not change

#### Scenario: Enter selects and announces
- **WHEN** focus is on node 30 and Enter is pressed
- **THEN** `onSelect` is called once with 30, node 30 has `aria-selected="true"` and the selected frame, and the live region reads "Node 30 selected"

#### Scenario: Selection is not colour alone
- **WHEN** one node is selected
- **THEN** its frame element is a rounded rectangle and the other nodes have none

#### Scenario: Pointer and touch
- **WHEN** a node is clicked
- **THEN** it is selected as with Enter, and its hit area is at least 44 units wide and high

#### Scenario: Roving tabindex follows focus
- **WHEN** focus moves to the left child by Left
- **THEN** that node has tabindex 0 and the former focus node has -1

#### Scenario: Read-only ignores keys
- **WHEN** keys are pressed on a read-only tree
- **THEN** nothing is selected and `onSelect` is not called

### Requirement: Wide trees keep their size
`TreeView` SHALL draw nodes at their natural size and put the drawing in a horizontally scrollable region, instead of shrinking it, so node text stays readable and targets stay at least 44 px. The region SHALL be keyboard-scrollable and labelled. (FR-VIS-10, NFR-02, NFR-04)

#### Scenario: No shrinking
- **WHEN** a 15-node chain is rendered
- **THEN** the SVG has an explicit width in user units equal to the layout width and is not set to `width: 100%` with a smaller viewBox

#### Scenario: Scroll region
- **WHEN** the tree view stylesheet is read
- **THEN** the container has `overflow-x: auto`, and in the DOM it has `tabindex="0"`, a role of region and an accessible name

### Requirement: Style comes from tokens
The tree view stylesheet SHALL use `tokens.css` variables for every colour, size and radius, and SHALL NOT override the focus style. (NFR-02)

#### Scenario: No hard-coded colours or outline overrides
- **WHEN** the existing style scan runs over `src/`
- **THEN** it passes with the new stylesheet included

### Requirement: Hidden balance factors for practice
`TreeView` SHALL accept a hidden-balance mode with an optional list of revealed keys. In that mode, every node not revealed SHALL show its height and "bf ?" instead of its balance factor, and SHALL NOT show the Unbalanced flag. Its text description sentence and its accessible name SHALL say the balance factor is hidden and SHALL NOT say "unbalanced". Revealed nodes SHALL be drawn and described as usual. Wording comes from `src/content/treeView.ts`. (C3 practice, FR-VIS-07)

#### Scenario: Nothing leaks
- **GIVEN** the plain BST from 30, 20, 10 in hidden-balance mode with no revealed keys
- **WHEN** it is rendered and described
- **THEN** no node shows a balance factor number or "Unbalanced", the description contains no balance factor number and not "unbalanced", and each node still shows its height

#### Scenario: Revealed node
- **GIVEN** the same tree with key 30 revealed
- **WHEN** it is rendered
- **THEN** node 30 shows "h2 · bf +2" and "Unbalanced", and nodes 20 and 10 show "bf ?"

#### Scenario: Default unchanged
- **WHEN** a tree is rendered without hidden-balance mode
- **THEN** it is drawn and described exactly as before

#### Scenario: Accessible in hidden mode
- **WHEN** an interactive tree is rendered in hidden-balance mode
- **THEN** axe reports no violations and each treeitem's name gives its key and height and says the balance factor is hidden
