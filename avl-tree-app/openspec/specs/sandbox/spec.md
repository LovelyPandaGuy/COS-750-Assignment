# sandbox Specification

## Purpose

A free-play screen where students insert and delete keys with rebalancing on or off and see, from the engine, how insertion order shapes the tree and its search cost (LO1, FR-VIS-08).

## Requirements

### Requirement: Insert and delete keys
The sandbox SHALL let the learner insert whole-number keys from 1 to 99, and delete a leaf, through a labelled key field with Insert and Delete buttons. Each operation SHALL use the engine's traces, as the lessons do: the AVL insert trace with rebalancing on and the plain insert trace with it off; the leaf-deletion trace with rebalancing on and the plain leaf-deletion trace with it off. Selecting a node in the tree SHALL put its key in the field. (FR-VIS-08, D3, D4, ID 7.2 C7, D162)

#### Scenario: Insert with rebalancing on
- **GIVEN** an empty sandbox with rebalancing on
- **WHEN** the learner inserts 10, 20 and 30
- **THEN** the tree drawn is the engine's AVL tree for those keys: root 20 with children 10 and 30

#### Scenario: Insert with rebalancing off
- **GIVEN** an empty sandbox with rebalancing off
- **WHEN** the learner inserts 1 to 7 in increasing order
- **THEN** the tree drawn is a chain of height 6, each key the right child of the one before

#### Scenario: Delete
- **GIVEN** a sandbox holding 20, 10, 40, 30 and 50 with rebalancing on
- **WHEN** the learner deletes the leaf 10
- **THEN** the tree drawn is the engine's leaf-deletion result `40(20(·, 30), 50)` and 10 is not in it

#### Scenario: Tap to delete
- **GIVEN** a sandbox holding keys
- **WHEN** the learner selects node 30 in the tree, then presses Delete
- **THEN** 30 is deleted

#### Scenario: Delete with rebalancing off
- **GIVEN** the same five keys with rebalancing off
- **WHEN** the learner deletes the leaf 10
- **THEN** the tree drawn is `20(·, 40(30, 50))`, with no rotation

### Requirement: Calm messages for keys that cannot be used
A key outside 1 to 99 or not a whole number, a key already in the tree, deleting a key not in the tree, and deleting a node that is not a leaf SHALL each leave the tree unchanged and show an inline message saying why, with no "wrong", "fail", "error" or red-only signal. (FR-VIS-08, D27, D162)

#### Scenario: Out of range
- **WHEN** the learner tries to insert 0, 100 or 2.5
- **THEN** the tree is unchanged and the message names the range 1 to 99

#### Scenario: Duplicate
- **GIVEN** a sandbox holding 20
- **WHEN** the learner inserts 20
- **THEN** the tree is unchanged and the message says 20 is already in the tree

#### Scenario: Missing key
- **WHEN** the learner deletes a key not in the tree
- **THEN** the tree is unchanged and the message says the key is not in the tree

#### Scenario: Not a leaf
- **GIVEN** a sandbox holding 10, 20 and 30 with root 20
- **WHEN** the learner deletes 20
- **THEN** the tree is unchanged and the message says 20 is not a leaf and that, as in C7, only a leaf can be deleted here

### Requirement: Fifteen-node cap
The tree SHALL hold at most 15 nodes. At 15, Insert, "Insert 1 to 7 in order" and Random key SHALL be unavailable (`aria-disabled`, still focusable, activating them does nothing) and a message SHALL say the tree is full and how to make room. Delete SHALL stay available. (FR-VIS-08, wireframe 1n note 2, D137)

#### Scenario: Full tree
- **GIVEN** a sandbox holding 15 keys
- **WHEN** the screen is shown
- **THEN** Insert, "Insert 1 to 7 in order" and Random key have `aria-disabled="true"`, the full message is shown, and Delete still works

#### Scenario: Unavailable does nothing
- **GIVEN** a sandbox holding 15 keys
- **WHEN** Insert is activated with 50 in the key field
- **THEN** the tree still holds 15 keys

### Requirement: Rebalancing switch
A switch SHALL turn rebalancing on or off, saying ON or OFF in words. Turning it SHALL rebuild the tree from the keys now in it, in the order they were inserted, as an AVL tree (on) or a plain BST (off). Rebalancing SHALL start on. (FR-VIS-08, D11, wireframe 1n note 1)

#### Scenario: Chain becomes AVL
- **GIVEN** rebalancing off and keys 1 to 7 inserted in order
- **WHEN** the learner turns rebalancing on
- **THEN** the switch says ON and the tree is the engine's AVL tree for 1 to 7 inserted in order, of height 2

#### Scenario: Switch state in words
- **WHEN** the switch is rendered on and off
- **THEN** its accessible name or visible text contains "ON" or "OFF" to match, and it is a native switch control reachable by keyboard

### Requirement: Shortcut controls
"Insert 1 to 7 in order" SHALL clear the tree and insert 1 to 7 in increasing order. "Random key" SHALL insert a key from 1 to 99 that is not in the tree. Clear SHALL empty the tree. (wireframe 1n)

#### Scenario: Sorted shortcut
- **GIVEN** a sandbox holding other keys
- **WHEN** the learner presses "Insert 1 to 7 in order"
- **THEN** the tree holds exactly 1 to 7

#### Scenario: Random key
- **WHEN** the learner presses Random key 20 times from empty
- **THEN** the tree holds 15 distinct keys from 1 to 99, and Random key is then disabled

### Requirement: Statistics from the engine
The sandbox SHALL show the node count against the cap ("n / 15"), the height, the shortest possible height for that many keys, the number of nodes outside the allowed balance range, and how many nodes a search for the deepest key visits. Every value SHALL come from the engine. No score or points SHALL be shown. (LO1, FR-VIS-08, FR-MOT-04)

#### Scenario: Chain statistics
- **GIVEN** rebalancing off and keys 1 to 7 inserted in order
- **WHEN** the statistics are shown
- **THEN** they read 7 / 15 nodes, height 6, shortest possible height 2, and a search for 7 visits 7 nodes

#### Scenario: Statistics match the engine
- **WHEN** random sequences of inserts and deletes are applied with rebalancing on or off (property test)
- **THEN** every statistic equals the engine's value for the resulting tree

### Requirement: Event log
Each operation SHALL add an entry to a polite live region, newest first, with a short heading ("Inserted 30", "Deleted 10") and every step of the operation as the lessons caption it: the captions from `conventions.json`, filled in by the engine's caption builder from the operation's trace (each comparison on the way down, where the key goes or which leaf is removed, each node's balance factor update, the first unbalanced node n and its case, each rotation, and, when true, that every node is in balance). With rebalancing off, the entry SHALL end by saying no rotation is made. No step sentence SHALL be typed in the sandbox's own wording. Messages for unusable keys SHALL also be announced. (FR-VIS-08, FR-VIS-07, D19, ID 12.1, D161)

#### Scenario: Insert entry
- **GIVEN** rebalancing off and 6 in the tree
- **WHEN** the learner inserts 7
- **THEN** the newest entry is headed "Inserted 7", its steps are "7 > 6: go right.", "7 goes in the empty right branch of 6.", "Node 6: bf = 0 − (−1) = +1." and "Every node has a balance factor of −1, 0 or +1.", and it ends by saying no rotation is made

#### Scenario: Rebalance entry
- **GIVEN** rebalancing on and 10, 20 in the tree
- **WHEN** the learner inserts 30
- **THEN** the newest entry's steps are exactly the engine's captions for that insert: "30 > 10: go right.", "30 > 20: go right.", "30 goes in the empty right branch of 20.", "Node 20: bf = 0 − (−1) = +1.", "Node 10: bf = 1 − (−1) = +2.", "Node 10 has balance factor +2: it is the first unbalanced node, n. Case 4 (RR).", the left rotation about 10, and "Every node has a balance factor of −1, 0 or +1."

#### Scenario: No typed case names
- **WHEN** `src/content/sandbox.ts` is read
- **THEN** it contains none of LL, RR, LR, RL, left-left, right-right, left-right or right-left

#### Scenario: Delete entry
- **GIVEN** rebalancing on and the five keys 20, 10, 40, 30, 50
- **WHEN** the learner deletes 10
- **THEN** the newest entry is headed "Deleted 10" and its steps are "10 is a leaf: remove it.", "Node 20: bf = 1 − (−1) = +2.", "Node 20 has balance factor +2: it is unbalanced.", "Rotate 40 around 20: left rotation about 20." and "Every node has a balance factor of −1, 0 or +1."

#### Scenario: Captions come from the conventions file
- **WHEN** random sequences of inserts and leaf deletions are applied with rebalancing on or off (property test)
- **THEN** every step line of every entry equals the engine's caption for the same trace step

#### Scenario: Empty rebuild
- **WHEN** rebalancing is turned off on an empty tree
- **THEN** the entry says the tree is empty, not "the same 0 keys"

### Requirement: Replay the last change
After a single insert (Insert or Random key) or a leaf delete, with rebalancing on or off, the sandbox SHALL offer "Replay last insert" or "Replay last delete". It SHALL open the step replay of that operation on the tree as it was before: the same engine trace as the operation, with the step controls and captions; every caption it shows SHALL be one of the steps of that operation's "What happened" entry, in order. It SHALL NOT be offered after "Insert 1 to 7 in order", a rebuild or Clear, or before any operation; a line SHALL then say that replay is available after inserting or deleting one key. (FR-VIS-08, FR-VIS-03, FR-VIS-07, D163)

#### Scenario: Replay offered
- **GIVEN** rebalancing on and keys 10 and 20 in the tree
- **WHEN** the learner inserts 30 and presses "Replay last insert"
- **THEN** the replay controls are shown for inserting 30 into the tree of 10 and 20, and every caption the replay shows is one of the newest log entry's steps, in the same order (the closing "every node is balanced" line covers no trace step, so the replay ends on the last rotation)

#### Scenario: Not offered when off
- **GIVEN** rebalancing off
- **WHEN** the learner inserts 7 after 6 and presses "Replay last insert"
- **THEN** the replay plays the plain insert of 7, with no rotation, and its last caption equals the log entry's last step before the "no rotation" line

#### Scenario: Replay a delete
- **GIVEN** rebalancing on and the keys 20, 10, 40, 30, 50
- **WHEN** the learner deletes 10 and presses "Replay last delete"
- **THEN** the replay starts from the tree with 10, removes it, shows 20 at +2, the left rotation about 20, and ends at `40(20(·, 30), 50)`

#### Scenario: Not after a sequence, rebuild or clear
- **WHEN** "Insert 1 to 7 in order" is pressed, or rebalancing is toggled, or Clear is pressed
- **THEN** no replay button is shown and the availability line is

#### Scenario: Only the last change
- **WHEN** a key is inserted and then another is deleted
- **THEN** only "Replay last delete" is offered, for that delete

### Requirement: Nothing saved, accessible
The sandbox SHALL write nothing to the learner state. Every control SHALL be at least 44 px, usable by keyboard and touch, and the screen SHALL end with a link back to the student's current lesson ("← Back to C3 The AVL property"). The screen SHALL have no axe violations at every width and in every state. (NFR-02, D3, wireframe 1n, D159)

#### Scenario: Nothing stored
- **WHEN** the learner inserts, deletes, toggles and clears, then leaves
- **THEN** the stored learner state is byte for byte the same as before

#### Scenario: Back to path
- **GIVEN** a learner whose current lesson is C3
- **WHEN** the sandbox is shown
- **THEN** it has a link "← Back to C3 The AVL property" to `/module/C3`, and no link to `/path`

#### Scenario: Axe
- **WHEN** the sandbox is rendered empty, with a chain, full, with the replay open, and with keyboard help open
- **THEN** axe reports no violations

### Requirement: Two-column layout
The sandbox SHALL have a tree column (the tree, its description, "What happened" and "Replay last insert") and a control column, tree column first in the DOM. When the sandbox's own area is at least 45rem wide, the control column SHALL be shown on the left, beside the tree column, two parts to three with a wide gap; narrower, they SHALL stack, tree first. There SHALL be no horizontal page scroll at any width; a wide tree SHALL scroll in its own region. (Wireframe 1n, ID 8.2, D3, D140, D156, NFR-04)

#### Scenario: Tree first in the DOM
- **WHEN** the sandbox is rendered with keys
- **THEN** the tree column precedes the control column, and "Replay last insert" is inside the tree column

#### Scenario: Columns from 768 px
- **WHEN** the sandbox stylesheet is read
- **THEN** (now by the sandbox's own width, D156) the sandbox is a size container, an `@container (min-width: 45rem)` rule makes the layout a grid with the control column (two fifths, at least 18rem) in the first grid column and the tree column (three fifths) in the second, `--space-8` apart, and outside it the layout is a single column

#### Scenario: No page scroll on a phone
- **WHEN** 15 keys are inserted with rebalancing off, at 360, 768 and 1366 px
- **THEN** the tree sits in its scroll region and the layout sets no fixed width wider than 360 px

### Requirement: Named sections
The control column SHALL hold, in order, sections headed "Change the tree" (the key field, its message and the control bar), "Rebalancing" (the switch and its hint) and "Numbers" (the statistics), followed by keyboard help. "What happened" (the event log) SHALL sit in the tree column directly under the tree, before "Replay last insert", in its own scrolling box. Each section SHALL be a region named by its level-2 heading. (ID 8.1, UDL, D141)

#### Scenario: Control column headings in order
- **WHEN** the sandbox is rendered
- **THEN** the level-2 headings in the control column are "Change the tree", "Rebalancing" and "Numbers", in that order

#### Scenario: What happened under the tree
- **WHEN** keys are inserted
- **THEN** the "What happened" section is in the tree column, after the tree and before "Replay last insert"

#### Scenario: A long log scrolls in its box
- **WHEN** the sandbox stylesheet and log are read
- **THEN** the log has a maximum height with vertical scrolling, and it is focusable so it can be scrolled by keyboard

#### Scenario: Regions are named by their headings
- **WHEN** the sandbox is rendered
- **THEN** each of the four sections is a region whose accessible name is its heading

### Requirement: Sandbox controls are the shared control bar
Insert, Delete, "Insert 1 to 7 in order", Random key and Clear SHALL be one control bar (`tree-controls`) in that order, below the labelled key field, with icons and no primary button. Enter in the key field SHALL insert. Keyboard help SHALL list the sandbox's keys from the shortcut registry: the tree's arrows and Enter, the bar's arrows, and Enter in the key field. (D137, D138, D139, FR-VIS-10)

#### Scenario: Bar order
- **WHEN** the sandbox is rendered
- **THEN** the control bar's buttons are Insert, Delete, "Insert 1 to 7 in order", Random key and Clear, in that order, and none has `btn-primary`

#### Scenario: Enter inserts
- **WHEN** 42 is typed in the key field and Enter is pressed
- **THEN** 42 is in the tree

#### Scenario: Sandbox keys in the help
- **WHEN** keyboard help is opened on the sandbox
- **THEN** it lists moving between nodes, selecting a node, moving between buttons and inserting the key in the field, and no rotation or step key
