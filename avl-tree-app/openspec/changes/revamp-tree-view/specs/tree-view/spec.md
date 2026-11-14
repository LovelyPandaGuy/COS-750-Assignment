# Spec Delta

## MODIFIED Requirements

### Requirement: Layout without overlap
`layoutTree(tree)` SHALL return a position for every node. x SHALL increase with the in-order position of the key, y SHALL increase with depth, each parent SHALL lie strictly between its left and right children in x, and no two nodes SHALL overlap. The result SHALL depend only on the tree (and on the slot keys when given). Given a set of slot keys that contains the tree's keys, x SHALL follow each key's in-order position among the slot keys, so a key keeps its x when other slot keys are absent. (FR-VIS-01, D17)

#### Scenario: Keys left to right
- **GIVEN** any tree of up to 15 nodes
- **WHEN** it is laid out
- **THEN** sorting the nodes by x gives the keys in ascending order, with distinct x values

#### Scenario: Parents above children
- **GIVEN** any tree of up to 15 nodes
- **WHEN** it is laid out
- **THEN** each child is lower than its parent, a left child is left of its parent and a right child is right of it

#### Scenario: Parent between its children
- **GIVEN** any tree of up to 15 nodes (property test)
- **WHEN** it is laid out
- **THEN** every node with two children has an x strictly greater than its left child's and strictly less than its right child's, and the root has the smallest y

#### Scenario: No overlap
- **GIVEN** perfect trees, chains (all left, all right, zig-zag) and random AVL and BST trees of up to 15 nodes
- **WHEN** they are laid out
- **THEN** every pair of nodes is at least one node diameter apart

#### Scenario: Pure and empty
- **WHEN** the same tree is laid out twice, and when the empty tree is laid out
- **THEN** the results are equal, and the empty tree has no nodes and a size of zero

#### Scenario: A rotation moves nodes only vertically
- **GIVEN** any tree of up to 15 nodes and any single left or right rotation the engine can perform on it (property test)
- **WHEN** the tree before and the tree after the rotation are laid out
- **THEN** every key has the same x in both layouts

#### Scenario: Stable slots across an insert or delete
- **GIVEN** a tree of up to 14 nodes and the tree after the engine inserts (or deletes) one key, both laid out with the union of their keys as slot keys (property test)
- **WHEN** the two layouts are compared
- **THEN** every key present in both trees has the same x in both, and the no-overlap and in-order rules still hold in each

### Requirement: Node states by colour, shape and text
`TreeView` SHALL draw each node in one of the ID's states: balanced (fill `#0072B2`, white text), unbalanced (fill `#E69F00`, near-black text, a "!" marker and a thick dashed outline), being rotated (fill `#F0E442`, near-black text, a bold outline) or newly inserted (fill `#56B4E9`, near-black text, a "NEW" tag beside the node). Balanced and unbalanced come from the node's balance factor and `isOutOfBalance`; being rotated and newly inserted come from the `roles` prop, and a role wins over the balance state. The first unbalanced node of a step SHALL carry the tag "n" (`conventions.unbalancedNode`). The "NEW" and "n" tags SHALL be drawn as filled pills in the role colour (`--tree-new` for NEW, `--tree-z` for n) with text in the surface colour (`--bg-page` in the dark theme), design system section 01 D. Every state SHALL carry text naming it for assistive technology. The fills SHALL be tokens. No state SHALL use red or colour alone. (ID 11.1, FR-VIS-02, NFR-02, D97; supersedes D25 for tree nodes)

#### Scenario: Each role is distinguishable without colour
- **WHEN** one node of each state is rendered
- **THEN** balanced shows its balance factor, unbalanced shows "!" and a dashed outline, being rotated has a bold outline, newly inserted has a "NEW" tag, and each node's accessible name names its state

#### Scenario: Greyscale keeps every state apart
- **GIVEN** the plain BST from 40, 30, 20, 10, 50 with roles n on 30, rotating on 20 and new on 10
- **WHEN** it is rendered and every colour value is ignored
- **THEN** 50 is balanced, 10 new, 20 rotating, and 30 and 40 unbalanced, and the five nodes differ pairwise in ring style or tag text

#### Scenario: Pill tags
- **WHEN** a node tagged "NEW" or "n" is rendered
- **THEN** its tag is a rounded rectangle filled with that role's `--tree-*` colour, behind tag text filled with `--bg-surface`; a rotating node and a node without a role have no pill

#### Scenario: Tag text contrast
- **WHEN** each state's text colour is compared with its fill, and the "NEW" and "n" tag colours with `--bg-surface` in both themes (and `--tree-z` with `--bg-page` in the dark theme)
- **THEN** each ratio is at least 4.5:1

#### Scenario: Roles are data
- **WHEN** the same tree is rendered with different `roles`
- **THEN** the shapes and positions are identical and only fills, outlines and tags change

#### Scenario: State from the balance factor
- **WHEN** the plain BST from 10, 20, 30 is rendered with no roles
- **THEN** node 10 is drawn unbalanced with "!" and nodes 20 and 30 are drawn balanced

### Requirement: Node values follow the screen's show list
`TreeView` SHALL show on each node the values its `show` prop names: `height` (as "h2"), `balanceFactor` (as "bf +1", a true minus sign for negative, "0" for zero), or `balanceFactor:root` (the root's balance factor only). With no `show` prop it SHALL show the balance factor on every node (ID 8.3 "Every node shows its balance factor"). The numbers SHALL be the node's stored height and the balance factor from its children's stored heights, using the conventions module. On an out-of-balance node the values line SHALL take the `--tree-z` colour and bold weight (design system "Node anatomy"). (FR-VIS-09, ID 7.3, ID 8.3, D98)

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

#### Scenario: Unbalanced annotation is marked
- **GIVEN** the plain BST from 30, 20, 10
- **WHEN** it is rendered
- **THEN** node 30's values line is marked as out of balance (styled with `--tree-z` and bold in the stylesheet) and the lines of 20 and 10 are not

#### Scenario: Stale heights are shown as stored
- **GIVEN** a tree whose stored height on one node differs from its real height
- **WHEN** it is rendered with `show` of height
- **THEN** the shown values follow the stored heights

### Requirement: Keyboard navigation and selection
An interactive `TreeView` SHALL have one tab stop (roving tabindex): the selected node, otherwise the root. Up SHALL move focus to the parent, Left to the left child and Right to the right child. A move with no target SHALL do nothing. Enter SHALL select the focused node, show it with a rounded-square frame filled with `--action-primary-tint` and outlined in `--action-primary`, call `onSelect(key)` and announce "Node 30 selected" in a polite live region. Click and tap SHALL select a node too. Hovering a node SHALL fill it with `--action-primary-tint` and ring it in `--action-primary`. Every node SHALL have a target of at least 44 px. Focus SHALL use the single focus style from `tokens.css`. (FR-VIS-10, NFR-02, design "Node anatomy")

#### Scenario: One tab stop
- **WHEN** an interactive tree is rendered and has no selection
- **THEN** exactly one treeitem has tabindex 0 and it is the root; the others have -1

#### Scenario: Arrow keys
- **GIVEN** a tree with root 40, left child 20 and right child 60, focus on 40
- **WHEN** Left, Up, Right, Right, Up are pressed in turn
- **THEN** focus is on 20, 40, 60, 60 (no right child, no change), 40

#### Scenario: Every node is reachable by keyboard
- **GIVEN** any tree of up to 15 nodes rendered as interactive (property test)
- **WHEN** the arrow keys are used from the root (depth-first: Left or Right down, Up back)
- **THEN** every node receives focus at least once

#### Scenario: Missing target is silent
- **WHEN** Up is pressed on the root, or Left on a leaf
- **THEN** focus does not move and the live region text does not change

#### Scenario: Enter selects and announces
- **WHEN** focus is on node 30 and Enter is pressed
- **THEN** `onSelect` is called once with 30, node 30 has `aria-selected="true"` and the selected frame, and the live region reads "Node 30 selected"

#### Scenario: Selection is not colour alone
- **WHEN** one node is selected
- **THEN** its frame element is a rounded rectangle and the other nodes have none

#### Scenario: Selected and hover look from tokens
- **WHEN** the tree view stylesheet is read
- **THEN** the selected frame's fill is `var(--action-primary-tint)` and its stroke `var(--action-primary)`, and an interactive node under `:hover` sets its fill to `var(--action-primary-tint)` and its ring to `var(--action-primary)`

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
`TreeView` SHALL draw nodes at their natural size and put the drawing in a horizontally scrollable region, instead of shrinking it, so node text stays readable and targets stay at least 44 px. The region SHALL be keyboard-scrollable and labelled. It SHALL scroll the focused node into view, and when the tree changes, the node tagged "n" (the first unbalanced node, D97) if there is one. The page SHALL NOT scroll horizontally at 390, 768 or 1366 px wide with a 15-node tree. (FR-VIS-10, NFR-02, NFR-04, D17)

#### Scenario: No shrinking
- **WHEN** a 15-node chain is rendered
- **THEN** the SVG has an explicit width in user units equal to the layout width and is not set to `width: 100%` with a smaller viewBox

#### Scenario: Scroll region
- **WHEN** the tree view stylesheet is read
- **THEN** the container has `overflow-x: auto`, and in the DOM it has `tabindex="0"`, a role of region and an accessible name

#### Scenario: Focus and the n node kept in view
- **GIVEN** an interactive 15-node chain in a region narrower than the drawing
- **WHEN** focus moves to the last node, and separately when the tree changes so that a node has role n
- **THEN** the region is asked to scroll that node into view (its `scrollIntoView` is called with `block: 'nearest'` and `inline: 'nearest'`)

#### Scenario: Three widths (visual, D118)
- **GIVEN** the Sandbox with keys 1 to 15 inserted in order with rebalancing off (the widest 15-node tree)
- **WHEN** it is shown at 390, 768 and 1366 px wide
- **THEN** the page's scroll width is no greater than the viewport width at every width, the tree region scrolls sideways where the drawing is wider than it, and every node's hit area measures at least 44 by 44 CSS px

## ADDED Requirements

### Requirement: Transitions between tree states
When the `tree` prop changes, `TreeView` SHALL move each node in both trees from its drawn position to its new one over the transition time, edges following their nodes. When the screen passes slot keys, every tree SHALL be laid out over them. A node only in the new tree SHALL appear at its final position; one only in the old tree SHALL be removed at once. Names, levels, description and focus SHALL follow the new tree at once. (NFR-03, FR-VIS-01, D32)

#### Scenario: Nodes slide
- **GIVEN** a tree and the tree after one rotation, transition time T greater than 0, and reduced motion off
- **WHEN** the prop changes from the first to the second and time is advanced
- **THEN** at time 0 each node is at its old position, at T/2 each moved node is strictly between its old and new position, and at T and after each node is at its new position

#### Scenario: Edges follow nodes
- **WHEN** a transition is sampled at any time between 0 and T
- **THEN** every edge's end points equal the drawn centres of its parent and child at that time

#### Scenario: Inserted and removed nodes with slot keys
- **GIVEN** a tree, the tree after the engine inserts one key, and slot keys equal to the larger tree's keys
- **WHEN** the prop changes
- **THEN** the new node is drawn at its final position from time 0, no other node changes x at any time, and after a delete with the same slot keys the removed node is gone from time 0 and no other node changes x

#### Scenario: Insert without slot keys
- **GIVEN** a tree and the tree after the engine inserts one key, with no slot keys
- **WHEN** the prop changes and time is advanced
- **THEN** each larger key moves smoothly (strictly between its old and new x at T/2) and no node is drawn at any position other than its old one at time 0 or the interpolated one after

#### Scenario: Accessibility follows the new tree at once
- **WHEN** the prop changes and the transition has not finished
- **THEN** every treeitem's name and `aria-level`, and the text description, already match the new tree

#### Scenario: Focus survives a rotation
- **GIVEN** an interactive tree with focus on node 20
- **WHEN** the prop changes to the tree after a rotation that moves 20
- **THEN** node 20 still has focus and is still the tab stop

#### Scenario: A new change during a transition
- **WHEN** the prop changes again before T
- **THEN** the next transition starts from the positions drawn at that moment, and no node jumps

### Requirement: Reduced motion snaps
`TreeView` SHALL draw every node at its final position immediately, with no intermediate positions, when the user prefers reduced motion or when the transition time is 0. The transition time SHALL default to one constant in the tree view and SHALL be settable per screen. (NFR-03, D32, design "Node anatomy": nodes snap between steps)

#### Scenario: Prefers reduced motion
- **GIVEN** `matchMedia('(prefers-reduced-motion: reduce)')` matches
- **WHEN** the tree prop changes to the tree after a rotation
- **THEN** in the first render after the change every node is at its new position and no animation frame is requested

#### Scenario: Transition time 0
- **WHEN** a screen passes a transition time of 0 and the tree changes
- **THEN** every node is at its new position in the first render after the change

#### Scenario: Preference changes while open
- **WHEN** the reduced-motion preference turns on after the tree view is shown
- **THEN** the next tree change snaps

### Requirement: Text description matches the drawing after every update
After every change of `tree`, `roles` or hidden-balance mode, the text description and every treeitem's accessible name SHALL equal `describeTree` and the node names for the current props, and SHALL list exactly the keys drawn. (FR-VIS-07, NFR-02)

#### Scenario: A sequence of updates
- **GIVEN** a sequence of up to 10 engine operations (inserts, deletes, rotations) starting from the empty tree (property test)
- **WHEN** the tree view is re-rendered after each one
- **THEN** after each re-render the description equals `describeTree` of that tree and the drawn keys are exactly the tree's keys

### Requirement: Screen-supplied announcements
`TreeView` SHALL accept an optional announcement and SHALL place it in its polite live region when it changes. Without one it SHALL announce only selection, as before. It SHALL NOT invent its own sentence for a tree change. (NFR-02, FR-VIS-07)

#### Scenario: Announcement passed
- **WHEN** a screen renders the tree view with the announcement "Inserted 5" and then "Rotated right at 20"
- **THEN** the live region reads each in turn

#### Scenario: No announcement
- **WHEN** the tree changes and no announcement is passed
- **THEN** the live region text does not change

### Requirement: Overlay extension point
`TreeView` SHALL accept an optional overlay that receives the current drawn layout (every node's key and centre, and the empty child slots of every node) and SHALL draw what it returns inside the drawing, above the nodes. Without one nothing extra SHALL be drawn. The tree view SHALL NOT add editing behaviour itself. (FR-VIS-06 for later editing, change A3)

#### Scenario: Overlay receives the layout
- **WHEN** a tree of 3 nodes is rendered with an overlay
- **THEN** the overlay is called with 3 node positions equal to the drawn centres and with the empty slots (4 for a perfect 3-node tree), and its output is inside the SVG after the nodes

#### Scenario: No overlay
- **WHEN** the tree view is rendered without an overlay
- **THEN** the drawing is exactly as before

### Requirement: Labels follow the conventions module
Every height and balance factor the tree view shows or speaks SHALL come from the engine's stored heights and the conventions module, with no height base, sign or range written in `src/ui/tree/`. (D2, D93, FR-ENG-10)

#### Scenario: Sign follows the module
- **GIVEN** the conventions module is replaced in the test with one whose balance factor is left minus right (the opposite of D93)
- **WHEN** the plain BST from 30, 20, 10 is rendered
- **THEN** node 30 shows "bf +2" in the drawing, the name and the description, where the real convention gives −2

#### Scenario: Nothing hard-coded
- **WHEN** the files in `src/ui/tree/` are scanned
- **THEN** none compares a height or balance factor with a numeric literal or computes left minus right itself
