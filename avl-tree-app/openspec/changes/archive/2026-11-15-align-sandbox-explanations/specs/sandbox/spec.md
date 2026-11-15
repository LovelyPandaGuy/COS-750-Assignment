# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Replay the last insert`
- TO: `### Requirement: Replay the last change`

## MODIFIED Requirements

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
