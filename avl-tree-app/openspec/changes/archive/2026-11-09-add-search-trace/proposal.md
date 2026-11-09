# Proposal

## Open questions

1. **[OPEN] Pseudocode line layout (D12, lecturer question 2).** The ID prints the loop and recursive versions with their line breaks lost in the PDF text, so the numbering is my reading of them: loop = 7 lines (header, `v = root`, `while`, equality test with return, `else if` go left, `else` go right, `return null`); recursive = 5 lines (header, `if v == null`, equality test with return, go left, go right). Please check this against the PDF page for C4 before apply. If the lecturer wants Java or Python, the maps change in one file and no test logic.
2. **Settled by the SE, recorded here: step count.** FR-ENG-09 says the step count equals the number of nodes visited. It is not the trace length. The D13 "28 steps for a million keys" figure is a separate verify item and is not touched here.
3. **Assumed, not blocking: shape of the trace.** You chose to define `TraceStep` as in SE §6.3. For search: `before` and `after` are the unchanged tree; `descend` lists the key moved from and, when the child exists, the key moved to; `not-found` lists the last node visited and is empty for an empty tree; `rebalanceCase` is never set. All SE step kinds are declared now so `add-operation-trace` extends behaviour, not the type.
4. **Assumed, not blocking: one comparison step per visited node.** The pseudocode makes up to two tests per node (equal, then less). The trace records one `compare` step per node at the equality line, then `found` or `descend` at the branch line taken. Which test decided is visible from the next step.
5. **Assumed, not blocking: names.** `searchTrace(tree, key, form)` with form `'loop'` or `'recursive'`. The existing plain `search` stays as it is.

## Why

C4 and LO5 need students to watch search happen: which node is visited, which comparison is made, which pseudocode line it matches, and how many steps it took. "Be the algorithm" mode (D5) and the step counter need the engine to produce that, so no answer is typed into content. Search is also the smallest operation to settle the shared trace type on.

## What Changes

- Add the `TraceStep` type (SE §6.3) and a search result type with `found`, `steps` and `trace`.
- Add `searchTrace` in loop and recursive forms, for found and not-found keys and for the empty tree.
- Add the pseudocode line maps for both forms (flagged, see question 1).
- Serves FR-ENG-09 (Must), FR-ENG-06 in part (shape of a step, search only), FR-VIS-04 groundwork (line numbers), D5. Learning outcomes: LO5 (C4), engine side only.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `avl-engine`: modifies "Search with a trace" (existing text and scenario kept, scenarios added) and adds "Search trace steps" and "Pseudocode line maps".

## Out of scope

Insert and delete traces, rebalancing steps and trace replay for them (`add-operation-trace`); the pseudocode text and panel (content and UI); step controls, "be the algorithm" mode and the step counter UI; the D13 figure; the D12 language choice; any storage.

## Impact

- New: `src/engine/trace.ts` (types), `src/engine/search.ts` (traces and line maps), exports in `src/engine/index.ts`; tests in `tests/engine/search.test.ts`.
- Unchanged: `bst.ts` `search`, and all existing tests.
- No new dependencies. No other change is in flight on `avl-engine`.
