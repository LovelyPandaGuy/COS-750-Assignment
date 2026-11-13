# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place; please read them before `/opsx:apply`.

1. **Needs `add-module-framework` (plan rows 12 and 13, user choice 13 Nov).** Change 12 `add-module-framework` comes first and owns the `module-framework` capability: the step schema typed by Gagné event (D10), engine-computed facts, the content validator and the step player. This change writes C2 and C3 on that framework and adds the tree-view and conventions pieces they need. Archive `add-module-framework` before this change. The framework and these modules were built together, so the framework's tests use C2 and C3 as their examples.
2. **Moved to `add-module-framework`:** how Gagné events map onto the activity routes.
3. **Assumed, not blocking: checks wait for Phase 4 (plan changes 19 to 21).** The ID's C2 and C3 checks need the question model, feedback panel and scaffold ladder. Here the Check activity shows a check placeholder step, then the module summary. A module is therefore not marked complete by this change (D20: only the check completes a module).
4. **Assumed, not blocking: C2 has no practice step.** The ID gives C2 a demonstration and a check but no activity, so nothing is invented. C3's two practice activities come straight from the ID ("fill in the balance factors; spot the problem in a tree where the root looks fine").
5. **Assumed, not blocking: practice support (D21, D27).** Unlimited retries, two hints (a nudge, then a fuller hint), four-part feedback (verdict, why, review, next), "Not quite yet". Practice answers are not stored and never count toward readiness (wireframe 1p). `PRACTICE_HINTS = 2` lives in `src/modules/config.ts`.
6. **Moved to `add-module-framework`:** step position is not persisted.
7. **Assumed, not blocking: the review link opens the rule in place (D27).** A link to another step would need a new route parameter, and the routes belong to the in-flight routing change. "Review: balance factor" opens the step's rule text where the student is.
8. **Flagged for the user to read: wording beyond the ID.** Hooks, recall prompts, summaries, hints and feedback for C2 and C3 are not in the ID. The content-author marks every such string in the content files. Facts (heights, step counts, balance factors, the AVL preview height) are never typed: the engine computes them.
9. **Note: sign wording (D2, D19).** The balance-factor formula, which way a sign leans, and case names come from the conventions module. Content never states them, and the validator rejects content that does. If the lecturer confirms right minus left, one module changes.
10. **Note: in-flight changes.** `add-avl-insert-trace` is open on `avl-engine`, and `add-routing-and-screen-skeleton` owns the routes and screen skeletons. This change adds no delta to either. Archive the routing change and `add-module-framework` before this one.
11. **Note: stale project context.** `openspec/config.yaml` still points at `docs/decisions.md` and D1 to D16. The decision log is now `.claude/docs/decisions.md` with D1 to D28. Not changed here (config is not a change artifact).

## Why

C2 and C3 are where students meet the problem (a lopsided BST is slow, LO1) and the rule that fixes it (height, balance factor and the AVL property, LO2 and LO3). Every later module builds on them. The Explore and Worked example routes for these modules are still skeletons, and there is no way yet to write a module as data whose facts come from the engine.

## What Changes

- **C2 When BSTs go lopsided (LO1).** 10, 20, 30, 40, 50 into a plain BST makes a chain, and finding 50 visits every node. "What about a million sorted keys?" Search cost follows height, with best case about log2 n and worst case n. Insertion order decides the shape. Preview: the same keys in an AVL tree.
- **C3 The AVL property (LO2, LO3).** Height (edges, from the conventions module), each node stores its height, the balance factor, the rule at every node and not just the root, an AVL tree need not be perfect, height at most about 1.44 log2 n (stated, no proof). A worked balance-factor example, then two practice activities: fill in the balance factors, and spot the problem in a tree whose root looks fine.
- **Tree view: hidden balance factors.** A `TreeView` option hides balance factors and the Unbalanced flag (drawn and described) so practice does not show the answer.
- **Conventions: wording sources.** The conventions module exports which subtree comes first in the balance factor and the allowed range, so content can phrase the rule without typing it.
- Serves LO1, LO2, LO3; FR-LRN-01, FR-LRN-02, FR-SCA-04 (in part: worked example before practice) through C2 and C3 content; FR-VIS-01, FR-VIS-02, FR-VIS-07 through `TreeView`; decisions D19, D21, D22, D27.

## Out of scope

- C2 and C3 checks, the question model, mastery threshold, scaffold ladder, retry cap (changes 19 to 21). Module completion.
- The module framework itself: step schema, facts, validator, step player, entry policy and route events (change 12 `add-module-framework`).
- Persisting the step position; a step parameter in the URL.
- Replay controls and pseudocode panels (no C2 or C3 step needs them; change 10 is not built).
- Read-aloud (D26), the sandbox (change 16), other modules.
- Existing practice wording in `src/content/practice.ts` (change 11): the D19 validator covers module content only.

## Capabilities

### New Capabilities
- `module-c2-lopsided-bsts`: the steps and engine facts of module C2 (LO1).
- `module-c3-avl-property`: the steps, facts and the two practice activities of module C3 (LO2, LO3).

### Modified Capabilities
- `tree-view`: adds a hidden-balance mode for practice.
- `conventions`: exports the balance-factor subtree order and the allowed range, and makes content take its sign and lean wording from them.

## Impact

- New: `src/modules/generators.ts` and `src/modules/practice.ts`, `src/ui/module/practice/` (practice components), `src/content/modules/` (C2, C3, conventions wording, practice copy).
- Changed: `src/engine/conventions.ts` (two exports, no behaviour change), `src/ui/tree/TreeView.tsx` and `describe.ts` (hidden-balance option), `src/modules/registry.ts` (registers C2 and C3).
- Uses, from `add-module-framework`: `src/modules/` (schema, facts, validator, config, registry), the step player and control strip in `src/ui/module/`, and the Activity page.
- No new dependencies, no storage schema change, no network calls.
