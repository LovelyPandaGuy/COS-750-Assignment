# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place; please read them before `/opsx:apply`.

1. **Assumed, not blocking: a framework slice ships here, not in change 12 (plan rows 12 and 13, user choice 12 Nov).** Change 12 `add-module-framework` has not been proposed. This change builds only what C2 and C3 need: the step schema typed by Gagné event (D10), engine-computed facts, the content validator and a step player. Change 12 later adds what is left: reordering of the middle steps, the guided or own-path toggle and entry policy (D20), and route events (D28). Nothing here blocks those.
2. **Assumed, not blocking: how Gagné events map onto the three activity routes (D10, FR-LRN-05, wireframe 1e).** Explore holds hook, goals, recall and content; Worked example holds example and practice; Check holds the check and the summary. Feedback (event 7) lives inside practice, not as its own step. One table in `src/modules/schema.ts`.
3. **Assumed, not blocking: checks wait for Phase 4 (plan changes 19 to 21).** The ID's C2 and C3 checks need the question model, feedback panel and scaffold ladder. Here the Check activity shows a check placeholder step, then the module summary. A module is therefore not marked complete by this change (D20: only the check completes a module).
4. **Assumed, not blocking: C2 has no practice step.** The ID gives C2 a demonstration and a check but no activity, so nothing is invented. C3's two practice activities come straight from the ID ("fill in the balance factors; spot the problem in a tree where the root looks fine").
5. **Assumed, not blocking: practice support (D21, D27).** Unlimited retries, two hints (a nudge, then a fuller hint), four-part feedback (verdict, why, review, next), "Not quite yet". Practice answers are not stored and never count toward readiness (wireframe 1p). `PRACTICE_HINTS = 2` lives in `src/modules/config.ts`.
6. **Assumed, not blocking: step position is not persisted.** The player keeps the step index in component state. Leaving and returning starts the activity again; resume stays at module level (D3). Persisting it is a storage change.
7. **Assumed, not blocking: the review link opens the rule in place (D27).** A link to another step would need a new route parameter, and the routes belong to the in-flight routing change. "Review: balance factor" opens the step's rule text where the student is.
8. **Flagged for the user to read: wording beyond the ID.** Hooks, recall prompts, summaries, hints and feedback for C2 and C3 are not in the ID. The content-author marks every such string in the content files. Facts (heights, step counts, balance factors, the AVL preview height) are never typed: the engine computes them.
9. **Note: sign wording (D2, D19).** The balance-factor formula, which way a sign leans, and case names come from the conventions module. Content never states them, and the validator rejects content that does. If the lecturer confirms right minus left, one module changes.
10. **Note: in-flight changes.** `add-avl-insert-trace` is open on `avl-engine`, and `add-routing-and-screen-skeleton` owns the routes and screen skeletons. This change adds no delta to either: new logic lives in new files under `src/modules/`, and the Activity page renders the player only where module content exists. Archive the routing change before applying this one.
11. **Note: stale project context.** `openspec/config.yaml` still points at `docs/decisions.md` and D1 to D16. The decision log is now `.claude/docs/decisions.md` with D1 to D28. Not changed here (config is not a change artifact).

## Why

C2 and C3 are where students meet the problem (a lopsided BST is slow, LO1) and the rule that fixes it (height, balance factor and the AVL property, LO2 and LO3). Every later module builds on them. The Explore and Worked example routes for these modules are still skeletons, and there is no way yet to write a module as data whose facts come from the engine.

## What Changes

- **Module step schema.** A module is an ordered list of steps, each typed by a Gagné event (hook, goals, recall, content, example, practice, check, summary) and placed in one of the three activities. Each step names its primary representation and may carry supporting rule text shown on demand (D22).
- **Facts from the engine.** A step names its trees by source (plain BST from keys, AVL from keys, seeded generator) and its bounds by size. The framework computes heights, search step counts, best and worst case search bounds, balance factors and AVL validity with the engine, then hands them to the step's text. Content never types an answer.
- **Content validator.** Checks event order (D10), activity placement, engine-checked claims (for example "this tree is AVL but not perfect"), that every number in rendered text comes from the facts, the keys or a declared allowance, and that no text states the sign, a lean or a case name (D19).
- **Step player.** Shows "Step n of m", the trees, the caption and a control strip in the same place on every step: Back and Next on one side, Show the rule and Hint on the other (D23). "I know this, skip" on content and worked-example steps only (D20). Focus moves to the step heading. Works by keyboard and touch.
- **C2 When BSTs go lopsided (LO1).** 10, 20, 30, 40, 50 into a plain BST makes a chain, and finding 50 visits every node. "What about a million sorted keys?" Search cost follows height, with best case about log2 n and worst case n. Insertion order decides the shape. Preview: the same keys in an AVL tree.
- **C3 The AVL property (LO2, LO3).** Height (edges, from the conventions module), each node stores its height, the balance factor, the rule at every node and not just the root, an AVL tree need not be perfect, height at most about 1.44 log2 n (stated, no proof). A worked balance-factor example, then two practice activities: fill in the balance factors, and spot the problem in a tree whose root looks fine.
- **Tree view: hidden balance factors.** A `TreeView` option hides balance factors and the Unbalanced flag (drawn and described) so practice does not show the answer.
- **Conventions: wording sources.** The conventions module exports which subtree comes first in the balance factor and the allowed range, so content can phrase the rule without typing it.
- Serves LO1, LO2, LO3; FR-LRN-01, FR-LRN-02, FR-LRN-04 (back within an activity), FR-LRN-05 (in part: default order), FR-SCA-04 (in part: worked example before practice); FR-VIS-01, FR-VIS-02, FR-VIS-07 through `TreeView`; decisions D10, D19 to D23, D27.

## Out of scope

- C2 and C3 checks, the question model, mastery threshold, scaffold ladder, retry cap (changes 19 to 21). Module completion.
- Reordering the middle steps, the path-mode toggle, entry policy and prerequisite notes (change 12, D20); route events and the event sink (D28).
- Persisting the step position; a step parameter in the URL.
- Replay controls and pseudocode panels (no C2 or C3 step needs them; change 10 is not built).
- Read-aloud (D26), the sandbox (change 16), other modules.
- Existing practice wording in `src/content/practice.ts` (change 11): the D19 validator covers module content only.

## Capabilities

### New Capabilities
- `module-framework`: the step schema and Gagné event order, facts computed by the engine, the content validator, and the step player with its control strip and skip.
- `module-c2-lopsided-bsts`: the steps and engine facts of module C2 (LO1).
- `module-c3-avl-property`: the steps, facts and the two practice activities of module C3 (LO2, LO3).

### Modified Capabilities
- `tree-view`: adds a hidden-balance mode for practice.
- `conventions`: exports the balance-factor subtree order and the allowed range, and makes content take its sign and lean wording from them.

## Impact

- New: `src/modules/` (schema, facts, validator, generators, config), `src/ui/module/` (step player, control strip, practice components), `src/content/modules/` (C2, C3, conventions wording, player copy).
- Changed: `src/engine/conventions.ts` (two exports, no behaviour change), `src/ui/tree/TreeView.tsx` and `describe.ts` (hidden-balance option), `src/pages/Activity.tsx` (renders the player when content exists).
- No new dependencies, no storage schema change, no network calls.
