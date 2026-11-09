# Next steps (Phase 0)

First proposals, in order, each run through the loop in CLAUDE.md:

1. `add-conventions-and-bst`: tree type, BST insert/search/delete, height and balance factor (FR-ENG-01..03, 05).
2. `add-avl-rebalancing`: rotations, LL/RR/LR/RL, AVL insert and delete, validity check (FR-ENG-04, 06..10).
3. `add-operation-trace`: the trace contract (spike S2 first).

Spikes before the UI changes: S1 tree layout, S2 trace contract, S3 browser features (touch editing, sqlite-wasm, localStorage).

Verify (D13): "at most 28 steps for a million keys" (height <= 28, up to 29 nodes visited).

Questions for the lecturer are at the end of `docs/decisions.md`.

Not yet done: wireframes and the Claude Design artifact to the D2 convention and C1 to C9; regenerate the SE doc from specs; `npm run validate:content`.
