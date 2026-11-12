# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place. Please read them before `/opsx:apply`.

1. **Flagged for the user to read (gate G3): comparison facts beyond the ID (user choice, 12 Nov).** The ID's C8 names the four structures, the AVL trade-off ("an extra height in each node + rotation work, but guaranteed O(log2 n)") and the Red-Black mention. It gives no costs for a sorted array or a hash table, and nothing on keeping keys in order. These come from one content record, `src/content/modules/structures.ts`. Every row and cell that is not in the ID is marked `[beyond ID]`, and no student sees them until you have read the record. Tree and array step counts are not in the record: the engine computes them.
2. **Assumed, not blocking: scenario items are practice for now (user choice, 12 Nov).** The check needs the question model (change 19, which lists a "scenario choice" type). Until then, scenario items are two practice steps in Worked example: unlimited retries, 2 hints, then Review, nothing stored (D21). The Check activity shows the placeholder, as C2, C3 and C5 do. Change 19 can reuse the scenario records as check items (D15, FR-ASM-01).
3. **Assumed, not blocking: the answer to a scenario is computed, not typed.** Each scenario lists the needs it has (for example "keys listed in order", "worst-case search in O(log2 n)"). Each structure records which needs it meets. The answer is the one structure that meets every need, and the validator rejects a scenario with no answer or more than one. Feedback on another choice names a need it does not meet. This keeps the guardrail "every answer shown to a student is computed" for a judgement question. The list of needs is one type plus one record.
4. **Assumed, not blocking: no million-key figure in C8 (D13).** The ID's "at most 28 steps" is marked verify, and C4 (change 14) owns that figure. C8 compares search steps on a small set of sorted keys built by the engine: a plain BST, an AVL tree and binary search on a sorted array. The key set is one constant in the C8 content file.
5. **Assumed, not blocking: Red-Black trees are a mention only.** One content step says they exist and are another self-balancing BST, and that the course does not cover them. They are never a table row or a scenario option. This follows the ID ("Mention Red-Black trees but not a full comparison") and the SE document (other balanced trees are out of scope, section 4.4).
6. **Assumed, not blocking: going back keeps a scenario answer (FR-LRN-04).** The step player already keeps each practice step's state (seed, hints used) by step id. The scenario choice and the checked answer join that state, so Back and Next keep them without keeping the step mounted. New scenario is the only thing that discards the answer.
7. **Assumed, not blocking: no in-flight capability is touched.** `module-framework`, `conventions` and `tree-view` (from `add-modules-c2-c3`) and `module-practice-steps` (from `add-modules-c5-c6`) are not archived yet. The additions here form a new capability, `structure-comparison`, as C5 did with `module-practice-steps`.
8. **Assumed, not blocking: no design frame for C8.** The wireframes have no C8 frame (`design/INDEX.md`, fix 1). The comparison table and the sorted array drawing use existing tokens and the TreeView's marker style (outline plus a text label, never colour alone). The design can restyle them later without changing the content.
9. **Note: D19 still applies.** No C8 string names a case or states the balance-factor sign. C8 does not need either.

## Why

C8 is where students weigh the AVL tree against the alternatives (LO9) and see once more why AVL search is O(log2 n) while a plain BST can be O(n) (LO5). It is the last teaching module before C9's readiness check, and its route is still a skeleton.

## What Changes

- **Structure record.** One content record describes four structures (plain BST, AVL tree, sorted array, hash table): their cost classes for search and insert, and which needs each meets. Rows from the ID are marked `[ID]`; the rest are marked `[beyond ID]` (item 1).
- **Sorted array figures.** A step can show a sorted array of keys and search it. The engine-side model counts binary search probes. The drawing marks each probed cell with an outline and a text label.
- **Comparison table step.** A step can show the four structures side by side, rendered from the record as an accessible table.
- **Scenarios.** A scenario is a short situation and the list of needs it has. The answer, and the reason each other structure does not fit, are computed from the record. The validator rejects scenarios that have no unique answer or that name a structure in their text.
- **Scenario practice step.** The four structures as a radio group, shuffled by seed. Check gives four-part feedback (D27). Two hints, New scenario, then Review the comparison (D21). Nothing is stored.
- **C8 Choosing a structure (LO9, LO5).** Hook: the same sorted keys as a chain and as an AVL tree, with search steps from the engine. Goals, recall, then content: a sorted array and binary search, a hash table, the AVL trade-off (extra height in each node, rotation count from the engine), the comparison table and the Red-Black mention. Worked example: one scenario worked through, then two scenario practice steps. Check placeholder and summary.
- Serves LO9 and LO5; FR-LRN-01, FR-LRN-02, FR-LRN-04, FR-LRN-05; FR-ASM-03 in part (practice feedback explains every choice); D15 (placeholder), D19, D20, D21, D27.

## Capabilities

### New Capabilities
- `structure-comparison`: the structure record and its needs, sorted array facts and drawing, the comparison table, scenarios with computed answers and their validation, and the scenario practice step.
- `module-c8-choosing`: the steps and facts of module C8 (LO9, LO5).

### Modified Capabilities
None. `module-framework`, `module-practice-steps`, `conventions` and `tree-view` are in flight in other changes (item 7) and are used as they are.

## Out of scope

- The C8 check, the question model, the scaffold ladder and stored attempts (changes 19 to 21).
- A million-key or height-bound figure (C4, change 14; D13).
- Red-Black trees beyond a mention, other balanced trees, hash functions and collision handling in any depth.
- Animation of binary search, the Representation switcher, read-aloud (D26).
- C4, C6, C7 and C9 content.
- Storing anything: scenario practice never counts toward readiness.

## Impact

- New: `src/content/modules/structures.ts` (record and scenarios, content-author, flagged); `src/content/modules/c8.ts`; `src/modules/compare.ts` (binary search probes, scenario answers); `src/ui/module/ArrayView.tsx`, `src/ui/module/ComparisonTable.tsx`, `src/ui/module/practice/ScenarioPractice.tsx`.
- Changed: `src/modules/schema.ts`, `facts.ts`, `validate.ts`, `generators.ts`, `registry.ts` (array figures, table and scenario fields, scenario facts, scenario checks, C8 registered); `src/ui/module/ModulePlayer.tsx` (array, table and scenario steps; scenario choice kept in the per-step practice state); `src/content/modules/practice.ts` (scenario feedback and hints).
- No engine change, no new dependencies, no storage change, no network calls.
