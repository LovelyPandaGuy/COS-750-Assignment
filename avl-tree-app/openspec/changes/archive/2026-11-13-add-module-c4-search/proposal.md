# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place; please read them before `/opsx:apply`.

1. **Note: plan row 14, built on archived changes.** It needs `add-replay-and-pseudocode` (change 10) and `add-module-framework` (change 12), both archived. `module-framework` is no longer in flight, so this change adds a delta to it: steps can show a replay with its pseudocode, and listings side by side (D22, D33). `module-practice-steps` is in flight in `add-modules-c5-c6`, so the new practice lives in the C4 capability, not there.
2. **Settles D13 (verify → settled by computation).** The ID's "at most 28 steps" for a million keys is exact: the shortest AVL tree of height 28 needs 1,346,268 keys, so a million keys give height at most 27 and a search visits at most 28 nodes. The 1.44 log2 n bound (about 28.7) is looser. The engine computes the figure from the minimum node count of an AVL tree of each height; nothing types 28. D13 is updated when this change is archived.
3. **Assumed, not blocking: "steps" means nodes visited.** As in C2, a search's step count is the number of nodes it compares with. A search that ends at an empty spot counts the nodes visited, not the empty spot. "At most height + 1 steps" follows.
4. **Assumed, not blocking: "side by side" at phone width (D3).** The loop and recursive listings sit in two columns when there is room and stack, loop first, below that width. One stylesheet rule.
5. **Assumed, not blocking: "be the algorithm" mechanics (ID C4 activity, LO4).** The student sees a seeded AVL tree, the key to find and the pseudocode panel. They select the next node the search visits; when it is right, the trace moves on and the matching line lights up. A search for a missing key ends with a "Not in the tree" button for the empty spot. Two practice steps: one key that is in the tree and one that is not (LO4 names both). Trees have 7 keys between 1 and 99; one constant in `src/modules/config.ts`.
6. **Assumed, not blocking: practice support (D21, D27).** Unlimited retries; a wrong pick shows "Not quite yet" with the four-part message and does not move the trace. Two hints: a nudge ("compare k with the current node"), then the fuller hint naming the direction from the engine's comparison. Then review is offered. Nothing is stored.
7. **Assumed, not blocking: loop or recursive in practice.** The panel's loop/recursive choice stays available. Both forms visit the same nodes, so marking is the same; only the lit line differs.
8. **Assumed, not blocking: the C4 check waits for Phase 4 (D42).** The Check activity shows the check placeholder, the summary, and the "Where next?" panel from the framework.
9. **Flagged for the user to read: wording beyond the ID.** The hook, goals, recall, captions, summary, hints and feedback are new wording, each marked `[beyond ID]` in the content file. Keys, step counts, heights and the million-key figures are computed.

## Why

C4 is where students learn the search algorithm itself (LO4) and why an AVL tree keeps it fast (LO5). C2 showed that a lopsided BST can take a million steps; C4 shows the same algorithm on an AVL tree takes at most 28. The C4 routes are still skeletons, and the replay and pseudocode panel (change 10) are built but not placed in any module.

## What Changes

- **Replay in a step (framework).** A step can name one of its figures and a search key to play as a replay with its pseudocode panel, as its primary representation (D22, D33). A step can also show two listings side by side with no line lit.
- **AVL worst-case bound (framework).** For a size n, the facts include the most nodes a search can visit in an AVL tree of n keys, computed from the minimum node count per height.
- **C4 Search (LO4, LO5).** Explore: the hook from C2's million-key question, the goals, a recall of the BST ordering property, then content: search is the same as BST search and does not use balance factors (watched as a replay); the loop and recursive versions side by side; at most height + 1 steps, so a million keys take at most the computed figure in an AVL tree against up to a million in a lopsided BST. Worked example: a replay of a search for a key that is found and one that is not. Practice: "be the algorithm" twice. Check: placeholder and summary.
- **"Be the algorithm" practice.** Select the next node the search visits while the pseudocode line lights up, by touch, pointer or keyboard.
- Serves LO4, LO5; FR-LRN-01, FR-LRN-02, FR-VIS-03, FR-VIS-04 (through the replay); decisions D13, D21, D22, D27, D33.

## Out of scope

- The C4 check items and marking (changes 19 to 21).
- Searching in the sandbox (change 16).
- Changes to the replay or pseudocode panel themselves; they are used as they are.
- Big-O wording beyond the ID's "O(log2 n)" and "O(n)" (C8 returns to it).

## Capabilities

### New Capabilities
- `module-c4-search`: the steps and engine facts of module C4 and its "be the algorithm" practice (LO4, LO5).

### Modified Capabilities
- `module-framework`: steps can show a replay with pseudocode and side-by-side listings; the facts include the AVL worst-case search bound for a size.

## Impact

- New: `src/content/modules/c4.ts` (content-author), `src/ui/module/practice/BeTheAlgorithm.tsx`, `src/modules/searchPractice.ts` (seeded tree and key, marking against the trace), practice wording in `src/content/modules/practice.ts`.
- Changed: `src/modules/schema.ts` (`replay` and `listings` on a step, `'trace-search'` practice, `'pseudocode'` and `'animation'` representations), `src/modules/facts.ts` (`maxAvlHeight`, `avlWorst` in bounds), `src/modules/validate.ts` (accepts the new fact), `src/modules/registry.ts` (C4), `src/modules/config.ts` (tree size), `src/ui/module/ModulePlayer.tsx` (renders the replay, listings and practice), `src/ui/module/module.css`.
- Uses as they are: `ReplayPlayer`, `PseudocodePanel`, `searchTrace`, `TreeView`.
- No new dependencies, no storage schema change, no network calls.
