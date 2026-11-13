# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place; please read them before `/opsx:apply`.

1. **Note: plan row 16, built on archived and in-flight changes.** It needs the tree view (change 3, archived) and the replay (change 9/10, archived). The engine's `avl-engine` capability is in flight in `add-avl-insert-trace`, so this change uses `insert`, `remove`, `avlInsert`, `avlDelete` and `avlInsertTrace` as they are and adds no engine code.
2. **Assumed, not blocking: what the replay covers (FR-VIS-08 "the operation trace is viewable").** The engine has a step trace for an AVL insert only. So "Replay last insert" is offered after an insert with rebalancing on, using the existing replay. Every operation (insert or delete, on or off) gets an event-log entry built from the engine's result: where the key went, and each rebalance with its node and case. The log is the viewable trace for the rest.
3. **Assumed, not blocking: what the switch does (wireframe 1n note 1).** Turning rebalancing on or off rebuilds the tree from the keys now in it, in the order they were inserted, as an AVL tree or a plain BST, so the two shapes can be compared. A key deleted earlier is left out. The switch always says ON or OFF in words.
4. **Assumed, not blocking: controls (wireframe 1n).** A key field (1 to 99) with Insert and Delete, "Insert 1 to 7 in order" (clears, then inserts 1 to 7 so a chain appears with rebalancing off), "Random key" (a key not yet in the tree) and Clear (no confirmation: the sandbox is not saved). Selecting a node in the tree puts its key in the field, so a key can be deleted by tapping it (D3).
5. **Assumed, not blocking: statistics (wireframe 1n, design INDEX item 2).** Nodes "n / 15"; height; the shortest possible height for n keys (the wireframe's "balanced would be"); unbalanced nodes; and how many nodes a search for the deepest key visits. All computed by the engine. Statistics are descriptive, never points (FR-MOT-04).
6. **Assumed, not blocking: cap and messages (FR-VIS-08, wireframe 1n note 2).** At 15 nodes Insert is disabled with "The tree is full (15 keys). Delete a key or clear the tree to keep exploring." Out-of-range keys, duplicates and deleting a key that is not there are explained inline in calm words. `SANDBOX_MAX_NODES = 15` and the key range live in one config.
7. **Assumed, not blocking: nothing is saved.** The sandbox lives in page state. Leaving and returning starts empty. Nothing is written to the learner state (the event log in change 26 may record sandbox events later).
8. **Assumed, not blocking: "suggested after C2" (FR-VIS-08, D11).** The hub's Sandbox card adds "Suggested now that you have finished C2" once C2 is in the completed modules. Until checks complete modules (D42) it does not show; the sandbox stays reachable from the hub and the top bar at any time.
9. **Flagged for the user to read: wording beyond the ID.** Control labels, messages, the event-log sentences and statistic labels are new, in `src/content/sandbox.ts`. Case names come from the conventions wording (D19).
10. **Note: stale skeleton scenario.** `screen-skeletons` still lists C5 activities as skeletons, but C5 has content and the tests already use C6. The delta here removes the sandbox and corrects C5 to C6 in the same requirement.

## Why

LO1 is about seeing that insertion order shapes a BST and that height is search cost. The sandbox lets students try that themselves: sorted keys with rebalancing off build a chain, and switching rebalancing on rebuilds the same keys as a short AVL tree. FR-VIS-08 asks for it and D11 makes it reachable at any time. Today `/sandbox` is a skeleton.

## What Changes

- **Sandbox screen (wireframe 1n).** Insert and delete keys 1 to 99, up to 15 nodes, with rebalancing ON or OFF. The tree shows height and balance factor on every node and flags unbalanced nodes as it already does (FR-VIS-09).
- **Rebalancing switch.** Rebuilds the current keys as an AVL tree or a plain BST.
- **Statistics.** Node count against the cap, height, shortest possible height, unbalanced nodes and the deepest search, all from the engine.
- **Event log.** A polite live region listing each operation, newest first, from the engine's result, with case names from the conventions wording.
- **Replay last insert.** With rebalancing on, the last insert can be replayed step by step with its pseudocode.
- **Hub suggestion.** The Sandbox card suggests the sandbox once C2 is completed.
- Serves LO1; FR-VIS-08, FR-VIS-09, FR-VIS-03 (through the replay), FR-VIS-10; decisions D3, D4, D11, D19.

## Out of scope

- A step trace for plain BST inserts or for deletes (engine work; `avl-engine` is in flight).
- Search as a sandbox operation (C4 covers it; the deepest search is shown as a statistic).
- Saving the sandbox between visits; logging sandbox events (change 26).
- Undo.

## Capabilities

### New Capabilities
- `sandbox`: the sandbox screen, its operations, switch, cap, statistics, event log and replay.

### Modified Capabilities
- `screen-skeletons`: the sandbox is no longer a skeleton (and the C5 example is corrected to C6).
- `module-hub`: the Sandbox card suggests the sandbox after C2.

## Impact

- New: `src/sandbox/sandbox.ts` (pure state, reducer and statistics), `src/sandbox/config.ts`, `src/content/sandbox.ts` (content-author), `src/ui/sandbox/` (`InsertControl`, `RebalanceSwitch`, `TreeStats`, `EventLog`, `sandbox.css`).
- Changed: `src/pages/Sandbox.tsx` (the screen), `src/pages/Hub.tsx` and `src/content/screens.ts` (the suggestion line).
- Uses as they are: engine insert, delete and AVL insert trace, `TreeView`, `ReplayPlayer`, `conventionsWording`.
- No new dependencies, no storage schema change, no network calls.
