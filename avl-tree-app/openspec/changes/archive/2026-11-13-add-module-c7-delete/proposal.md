# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place; please read them before `/opsx:apply`.

1. **Note: plan row 18, built on archived changes.** It needs the AVL delete in the engine (change 6) and the module framework (change 12), both archived. `avl-engine` and `module-framework` have no change in flight, so this change adds a `module-framework` delta (delete figures and their facts) and no engine code.
2. **Assumed, not blocking: C7 teaches only the ID's four bullets (lecturer question 4).** A quick recap of BST delete (a leaf, a node with one child, a node with two children taking its in-order successor as the engine does, SE 6.4); rebalancing on the way back up; a delete can need more than one rotation; the check is optional. No deletion case names or case taxonomy are shown, because the lecture's deletion cases are unconfirmed. Adding them later is a content change.
3. **Assumed, not blocking: the two-rebalance example comes from the engine.** The AVL tree from 8, 5, 11, 3, 7, 10, 12, 2, 4, 6, 9, 1 needs two rebalances when 12 is deleted (at 11, then at 8). The step names the keys and the delete; the nodes and the count are facts, and a claim checks there is more than one rebalance.
4. **Assumed, not blocking: C7 practice is "find the unbalanced node after a delete" (user choice, 13 Nov).** The ID names no C7 activity; LO8 is Apply. A seeded AVL tree of 7 to 10 keys is shown, a key is deleted from it by plain BST delete (no rebalancing), and the student selects the lowest node now out of balance. Heights stay visible and balance factors are hidden until it is solved, as in C3. One practice step; unlimited retries, two hints, then review (D21, D27).
5. **Assumed, not blocking: practice generator.** The generator draws AVL trees from the seed and keeps the first key whose plain delete leaves at least one node out of balance, trying up to 200 draws, then falls back to the hand-checked tree 20, 10, 30, 40 with 10 deleted (node 20). A property test covers seeds 0 to 199.
6. **Assumed, not blocking: the check stays a placeholder and is optional (ID C7, D4, D42).** The Check activity shows the check placeholder, then the summary, then "Where next?". Nothing about C7 blocks any other module or Ready.
7. **Flagged for the user to read: wording beyond the ID.** The hook, goals, recall, captions, summary, hints and feedback are new, each marked `[beyond ID]` in the content file. Keys, heights, successors, rebalance nodes and counts are computed.

## Why

C7 covers deletion with rebalancing (LO8). It is optional (D4) but in scope: students meet deletion in the lecture, and a delete can need several rotations, unlike an insert. The C7 routes are still skeletons, and no module shows a tree after a delete.

## What Changes

- **Delete figures (framework).** A step can name a tree as keys inserted into a BST or AVL tree, then one or more deletes, done by the engine with or without rebalancing. The facts record, per delete, the key, how many children it had, its in-order successor when it had two, and every rebalance with its node.
- **C7 Deletion (LO8).** Explore: hook, goals, recall of rotations from C5, then BST delete for a leaf, one child and two children; rebalancing on the way up (one rotation); a delete that needs two. Worked example: the same delete before and after rebalancing. Practice: find the lowest unbalanced node after a delete. Check: optional placeholder and summary.
- Serves LO8; FR-LRN-01, FR-LRN-02, FR-ENG-06 (through the engine's delete); decisions D4, D19, D21, D27.

## Out of scope

- A step trace or replay for delete (engine work; the follow-up named in `add-avl-insert-trace`).
- Deletion case names or a case table (lecturer question 4).
- The C7 check items (changes 19 to 21).
- Rotating the tree yourself after a delete (would need Do it yourself to start from a delete; not chosen).

## Capabilities

### New Capabilities
- `module-c7-delete`: the steps, engine facts and "find the unbalanced node" practice of module C7 (LO8).

### Modified Capabilities
- `module-framework`: trees can be named as inserts followed by deletes, with delete facts.

## Impact

- New: `src/content/modules/c7.ts` (content-author), `src/modules/deletePractice.ts` (generator and marking), `src/ui/module/practice/FindAfterDelete.tsx`, C7 practice wording in `src/content/modules/practice.ts`.
- Changed: `src/modules/schema.ts` (`deleted` tree source, `'after-delete'` practice), `src/modules/facts.ts` (build and delete facts), `src/modules/validate.ts` (accepts delete facts; `multi-rebalance` claim), `src/modules/registry.ts` (C7), `src/ui/module/ModulePlayer.tsx` (renders the practice).
- Uses as they are: `insert`, `remove`, `avlInsert`, `avlDelete`, `analyseTree`, `TreeView` (hidden balance).
- No new dependencies, no storage schema change, no network calls.
