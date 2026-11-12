# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place; please read them before `/opsx:apply`.

1. **Note: this change covers C5 only (user choice, 12 Nov).** Plan row 15 puts C5 and C6 in one change. Together they need about 20 tasks, and C6's "done for you" worked example needs a step-by-step insert replay (FR-VIS-03, FR-VIS-04) that no change has built. Row 15 is split into three: this change (C5 and rotate-it-yourself practice, keeping the planned name), then `add-insert-replay` (the step player for insert traces), then `add-module-c6-insertion` (the C6 outline, worked examples that fade from done for you to on your own, seeded keys, LO7).
2. **Assumed, not blocking: no in-flight capability is touched (user choice, 12 Nov).** `add-modules-c2-c3` (owns `module-framework`, `tree-view`, `conventions`), `add-predict-and-do-it-yourself` (`predict-first`, `do-it-yourself`) and `add-avl-insert-trace` (`avl-engine`) are merged but not archived. The framework additions here form a new capability, `module-practice-steps`; Do it yourself is used through its existing props and not changed. The archives can then happen in any order.
3. **Assumed, not blocking: case names on screen (D19, lecturer question 2).** C5 names the four cases in its example. The case name comes from the engine (which case an insert triggers) and is shown through the conventions wording, never typed. The conventions wording gains a case-name entry that reads the conventions module's case names. This meets the existing `conventions` requirement "Sign and lean wording comes from the conventions" and adds no delta to it.
4. **Assumed, not blocking: rotation names (lecturer question 2).** "Rotate left at 10" and "rotate right at 30" follow the Do it yourself menu wording already in the app (wireframe 1h). If the lecturer names rotations differently, the wording lives in one content file.
5. **Assumed, not blocking: C5 practice comes from LO6, not from an ID activity.** The ID gives C5 an example but no activity. LO6 is "do single and double rotations" (Apply), so the Worked example activity ends with two practice steps that use the existing Do it yourself component: one needing a single rotation, one needing a double. Their trees are seeded, so New tree gives a new problem (D9, D21). This is a practice format, not new teaching content.
6. **Assumed, not blocking: the C5 check waits for Phase 4 (plan decision 15, changes 19 to 21).** As in C2 and C3, the Check activity shows the check placeholder, then the summary. The C5 check items arrive with the question model.
7. **Assumed, not blocking: practice tree size.** Rotation practice trees have 6 keys between 1 and 99 (5 already in an AVL tree, then the one that unbalances it). One constant in `src/modules/config.ts`.
8. **Assumed, not blocking: going back keeps the rotation practice (FR-LRN-04).** Do it yourself keeps its rotations, undo history and selection inside the component. To keep them when the student goes back and returns, the player keeps a visited rotation practice step mounted but hidden instead of rebuilding it. New tree is the only thing that discards them.
9. **Flagged for the user to read: wording beyond the ID.** The C5 hook, recall, captions, summary and the two practice hints are new wording. The content-author marks each string `[beyond ID]` in the content file. Keys, roots, case names and rotation counts are computed by the engine.
10. **Note: existing Do it yourself wording.** `src/content/practice.ts` (change 11) types "between −1 and +1" in some reveal messages. The D19 validator covers module content only, so this change leaves that file alone; it is listed for the change that adopts the conventions wording there.

## Why

C5 teaches the one move that fixes an AVL tree: the rotation (LO6). C6's insertion module depends on it. The C5 routes are still skeletons. The Do it yourself rotation tool exists (change 11), but no module uses it.

## What Changes

- **Rotated trees as figures.** A step can name a tree as "these keys into a plain BST, then rotate left (or right) at key k", one or more times. The engine performs each rotation, so every before-and-after picture is right by construction.
- **Rebalance and order facts.** For a figure built from keys, the framework records every rebalance the engine performs when those keys go into an AVL tree (the key inserted, the unbalanced node, the case, and how many single rotations it uses), plus the tree's in-order key sequence. Content shows a case name only through the conventions wording.
- **New claims.** "Is a BST" and "has the same in-order sequence as figure X", both checked by the engine.
- **Rotation practice step.** A practice step type that hosts Do it yourself on a seeded tree needing a single rotation, or one needing a double rotation. It adds two hints (D21), New tree (a new seeded problem), and Review the rule once the hints are used up. It stores nothing.
- **C5 Rotations (LO6).** Single left and right rotations. Double rotations as two singles. Rotations never break the BST order, shown with the in-order sequence before and after. The ID example: 10, 20, 30 in the four orders that unbalance the tree all end with 20 at the root, with each case named through the conventions wording. Then practice with a single rotation, then with a double. Check placeholder and summary.
- Serves LO6; FR-LRN-01, FR-LRN-02, FR-LRN-04, FR-VIS-06 (through Do it yourself), FR-VIS-01, FR-VIS-07, FR-VIS-09 (through `TreeView`); D9, D19, D20, D21, D27.

## Capabilities

### New Capabilities
- `module-practice-steps`: rotated-tree figures, rebalance and in-order facts, the BST and same-order claims, and the rotation practice step (seeded trees, hints, new tree, kept on back).
- `module-c5-rotations`: the steps and engine facts of module C5 (LO6).

### Modified Capabilities
None. `module-framework`, `conventions`, `tree-view`, `do-it-yourself` and `avl-engine` are in flight in other changes (item 2) and are used as they are.

## Out of scope

- C6 content, the insert replay (step controls, pseudocode outline, FR-VIS-03, FR-VIS-04) and predict-first in modules: `add-insert-replay` and `add-module-c6-insertion` (item 1).
- The C5 check, question model and scaffold ladder (changes 19 to 21).
- Animation of rotations, the Representation switcher, read-aloud (D26).
- Changes to Do it yourself, its wording, or `src/content/practice.ts` (item 10).
- Deletion rotations (C7), the sandbox (change 16), C4 (change 14).
- Storing anything: rotation practice is never stored and never counts toward readiness.

## Impact

- New: `src/content/modules/c5.ts`; `src/ui/module/practice/RotatePractice.tsx`.
- Changed: `src/modules/schema.ts`, `facts.ts`, `validate.ts`, `generators.ts`, `config.ts`, `registry.ts` (new source, facts, claims, practice kind, generators, C5 registered); `src/ui/module/ModulePlayer.tsx` (rotation practice, kept mounted); `src/content/modules/conventionsWording.ts` (case name entry) and `src/content/modules/practice.ts` (rotation hints).
- No engine change, no new dependencies, no storage change, no network calls.
