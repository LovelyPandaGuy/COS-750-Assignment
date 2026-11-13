# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place; please read them before `/opsx:apply`.

1. **Note: plan row 15c (D49), built on archived changes.** It uses the insert replay with predict-first and the Watch or Do it yourself switch (`add-insert-replay`, D65 to D68), the rotation practice (`add-modules-c5-c6`, D49 to D53) and the facts and checker pattern from C7. Nothing is in flight, so this change adds `module-framework` deltas (a new tree source and one corrected scenario) and a `screen-skeletons` delta, and no engine code.
2. **Assumed, not blocking: how the ID's fading maps onto steps (ID C6; user choice, 13 Nov).** "Done for you" is an insert replay to watch. "Guided" is two insert steps that ask for a prediction first, one for the unbalanced node and one for the case. "On your own" is a seeded practice that asks the learner to name the case and then rotate. Examples use fixed keys; only the practice is random (user choice, 13 Nov).
3. **Assumed, not blocking: example keys are chosen with the engine.** The content file records which keys, and each example covers a different case, so between the examples and C5 all four cases and both single and double rotations appear. The engine computes every node, case and rotation count; nothing is typed.
4. **Assumed, not blocking: case names (D19, lecturer question 2).** The four options in the practice and every case name in text come from the conventions wording (`caseName`) and nowhere else. A different answer from the lecturer is a one-line change in that module.
5. **Assumed, not blocking: name the case, then rotate is one step with two phases.** The learner names the case for a seeded tree (the tree after a plain BST insert, balance factors shown). When the answer is right, the existing rotation practice (Do it yourself) appears for the same tree and key. New tree draws a new problem and starts at naming again. Going back keeps both phases (FR-LRN-04, D53).
6. **Assumed, not blocking: practice problems are seeded and mix single and double rotations.** A new generator draws a single or a double problem by seed using the existing rotation problem generator, with the same size as C5's practice (`ROTATION_PRACTICE_KEYS`, D52). A property test covers seeds 0 to 199.
7. **Assumed, not blocking: practice support (D21, D27).** Unlimited retries, two hints (look at the unbalanced node and its taller child; then which way each leans, from the conventions wording), then review. A wrong case gets "Not quite yet", the unbalanced node, its taller child and their balance factors, and no judging words. Nothing is stored.
8. **Assumed, not blocking: "one rotation is always enough" is explained from the engine, not proved.** The text says an insert needs at most one rebalance, that is one single or one double rotation, and ties it to C4's step bound: with a million keys the walk up visits at most the computed AVL worst case, then at most one rebalance. A test checks the claim over random insert sequences.
9. **Assumed, not blocking: C6's check is the placeholder (D42).** The ID's check items (click where balance first breaks; name the case; build the final tree) arrive with the assessment changes (19 to 21). This module's practice is practice, not the check, and completes nothing.
10. **Assumed, not blocking: C6 gets content, so no module screen is a skeleton any more except C1 and C9.** Four existing tests and one spec scenario use C6 as their example of a skeleton; they move to C9 (Check) in the same change. This is a test and spec correction, not a behaviour change.
11. **Flagged for the user to read: wording beyond the ID.** The hook, goals, recall, captions, summary, hints and feedback are new, each marked `[beyond ID]` in the content file. Keys, nodes, heights, cases, rotation counts and the million-key figure are computed.

## Why

C6 is where the three earlier modules come together: students insert into an AVL tree, find where balance breaks, work out the case and rotate (LO7). It is the heart of the module list, and the C5 rotations and the new insert replay were built for it. Its routes are still skeletons.

## What Changes

- **Insert figures (framework).** A step can name a tree as an AVL tree of some keys followed by one more key inserted, either plainly (no rebalancing) to show what the insert breaks, or with the AVL insert. The facts include the engine's result for that insert: whether it rebalances, the unbalanced node, the case and the rotation count.
- **Insert outline as a listing.** A step can show the five-step insert outline from the ID in the existing pseudocode panel.
- **C6 Insertion with rebalancing (LO7).** Explore: hook, goals, recall of rotations and balance factors, the five steps (BST insert, update heights going up, find the lowest unbalanced node, work out the case, rotate) each with a tree from the engine, and why one rotation is always enough. Worked example: done for you, guided by a node prediction, guided by a case prediction with Do it yourself on offer, then the on-your-own practice. Check: placeholder and summary.
- **Name the case, then rotate (practice).** Seeded: name which of the four cases applies, then rotate the tree yourself with the existing tool.
- **Skeleton tests and spec.** With C6 filled in, no Explore, Worked example or Check screen is a skeleton; the skeleton spec and the tests that used C6 move to C9.
- Serves LO7; FR-LRN-01, FR-LRN-02, FR-VIS-05, FR-VIS-06 (through the examples); decisions D19, D21, D22, D27, D65 to D68.

## Out of scope

- The C6 check items and marking (changes 19 to 21), and module completion.
- Delete in C6 (C7 covers it).
- Changes to the replay, prediction components or the rotation tool.
- Seeded or random keys in the worked examples.

## Capabilities

### New Capabilities
- `module-c6-insertion`: the steps, engine facts and "name the case, then rotate" practice of module C6 (LO7).

### Modified Capabilities
- `module-framework`: inserted trees as a figure source, insert facts for them, and the skeleton scenario moved from C6 to C9.
- `screen-skeletons`: no module Explore, Worked example or Check activity is a skeleton any more.

## Impact

- New: `src/content/modules/c6.ts` (content-author), `src/modules/casePractice.ts` (problem, marking), `src/ui/module/practice/NameTheCase.tsx`, C6 practice wording in `src/content/modules/practice.ts`.
- Changed: `src/modules/schema.ts` (`inserted` source, `'insert'` listing, `'name-case'` practice, `'insert-rebalance'` generator), `src/modules/facts.ts` (insert facts for inserted figures), `src/modules/validate.ts`, `src/modules/generators.ts` (`practiceProblem` for the new generator), `src/modules/registry.ts` (C6), `src/ui/module/ModulePlayer.tsx` (the practice and the rotation phase), `src/ui/module/module.css`; tests that used C6 as a skeleton (`tests/ui/module-player.test.tsx`, `tests/ui/module-hub.test.tsx`).
- Uses as they are: `ReplayPlayer`, `PredictPrompt`, `PredictionReveal`, `ModeSwitch`, `DoItYourself`, `RotatePractice`, `avlInsert`, `caseFor`, `conventionsWording`.
- No new dependencies, no storage schema change, no network calls.
