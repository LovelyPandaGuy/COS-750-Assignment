# Proposal

## Open questions

Resolve or accept these at the human skim. Items marked [OPEN] block only the piece of work they name.

1. **[OPEN] Change boundary (`docs/next-steps.md`, D1 order).** `next-steps.md` plans `add-avl-rebalancing` (FR-ENG-04, 06..10) and then `add-operation-trace` (spike S2) as two changes. This change takes a vertical slice of both: AVL insert with rebalancing *and* the trace contract, for insert only. Reason: SE §6.4 defines insert by the trace steps it emits, and C6 (LO7) needs both together. AVL delete (FR-ENG-08) and the search trace (FR-ENG-09) become later changes that reuse the contract. Confirm, and update `next-steps.md` if accepted.
2. **[OPEN] Pseudocode line numbers for insert (D12, FR-VIS-04).** SE §6.3 gives every `TraceStep` a `pseudocodeLine`. The ID gives pseudocode for search (C4) but not for AVL insert (C6 lists only the steps: BST insert → update heights → find lowest unbalanced node → name case → rotate). Drafted: the engine numbers the five C6 steps 1 to 5 in one exported table, and a step's `pseudocodeLine` points into it. Real pseudocode text is content beyond the ID and must be flagged. Confirm the five-step numbering, or supply the pseudocode.
3. **[OPEN] Case names and balance-factor sign (D2, lecturer to confirm).** The trace labels LL, RR, LR, RL come from `REBALANCE_CASES` in the conventions module, so renaming them is a one-line edit. LL means z has balance factor +2 and y ≥ 0 under the left-minus-right sign.
4. **Spike S2 (trace contract), not blocking.** This change *is* the S2 outcome for insert: the SE §6.3 `TraceStep` shape is adopted as-is. Delete and search may add step kinds later; the type is designed to widen without breaking insert traces.
5. **Assumptions, not blocking (recorded in the specs):**
   - A double rotation emits **two** `rotation` steps (inner then outer), both labelled with the double case (LR or RL), so the student sees "two singles" (C5).
   - A duplicate insert returns the same tree with `inserted: false` and a trace of the comparisons ending in a `found` step (SE §6.3 has no `duplicate` kind).
   - "Replay" (FR-ENG-06) means: applying each step's `after` in order, starting from the input tree, reproduces the result tree, and each step's `before` equals the previous step's `after`.
   - After the one rebalance, the walk up stops (SE §6.4 step 5), so no `update-height` steps are emitted above z.

## Why

C6 (LO7) asks the student to find where balance first breaks, name the case and build the final tree, and FR-VIS-02..05 replay that step by step. None of this can be built until the engine performs AVL insert and returns a trace that the UI, the pseudocode panel and the answer marker all read. The main `avl-engine` spec already states these requirements, but the code has only plain BST operations and rotation primitives.

## What Changes

- Add AVL insert: BST insert, walk back up recomputing heights, find the lowest unbalanced node z and its taller child y, apply LL/RR/LR/RL, stop (FR-ENG-04).
- Add the trace contract from SE §6.3 (`TraceStep`, `OperationResult`) and a `replay` function, used first by AVL insert and plain BST insert (FR-ENG-06).
- Plain BST insert gains a trace (descend/compare/insert steps) so the comparison mode replays too (FR-ENG-07). Its `{ tree, inserted }` result widens to `OperationResult`; existing callers keep working.
- Add a pseudocode-line table for insert, pending open question 2.

No UI, no AVL delete, no search trace.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `avl-engine`: the **AVL insert** requirement gains the SE §7.2 scenarios (z deeper in the tree, both sides; trace contents per case); **Trace for every operation** gains the replay, snapshot-chain and immutability scenarios for insert; **Plain BST insert for comparison** gains a trace scenario.

## Out of scope

AVL delete and its trace (FR-ENG-08, FR-VIS-12); search trace, step counts, loop and recursive forms (FR-ENG-09, FR-VIS-11); the D13 step-count figure; seeded generators (`generate.ts`); all UI, including TreeView, StepControls and PseudocodePanel (FR-VIS-01..07); pseudocode text; content and storage.

## Serves

FR-ENG-04, FR-ENG-06 (insert), FR-ENG-07; engine groundwork for LO6 (C5) and LO7 (C6), and for FR-VIS-03, FR-VIS-04 and FR-ASM-04.

## Impact

- New: `src/engine/avl.ts` (AVL insert), `src/engine/trace.ts` (types, `replay`, pseudocode-line table), `tests/engine/avl-insert.test.ts`, `tests/engine/trace.test.ts`.
- Changed: `src/engine/bst.ts` (insert emits a trace; result type widens), `src/engine/index.ts` (exports), `src/engine/conventions.ts` (comment only: the order of `REBALANCE_CASES` is the contract; no value changes).
- Not touched: `rotations.ts`, `validity.ts`, UI files.
