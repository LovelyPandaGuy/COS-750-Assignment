# Tasks

Roles as in `.claude/CLAUDE.md`. No task commits; the user commits. Archive after `revamp-navigation` (both touch `sandbox`, on different requirements).

## 1. Red tests

- [x] 1.1 (test-writer) Engine: `leafDeleteTrace` with `rebalance: false` (no rotation, ends at `20(·, 40(30, 50))`, not-a-leaf reported), and its captions with no false closing line. Verify they fail only because the option does not exist (D161, LO7).
- [x] 1.2 (test-writer) Sandbox: every modified `sandbox` scenario: leaf delete on and off, not-a-leaf message, the entry heading and steps for an insert off, the exact captions for inserting 30 after 10 and 20, the delete entry for 10, the empty rebuild line, no typed case names, and a property test that every step line equals the engine's caption. Update the old one-sentence log assertions. Verify the new and changed tests fail only because the sandbox still uses its own sentences.

- [x] 1.3 (test-writer) Replay: every scenario of `sandbox` "Replay the last change" and `step-replay` "Sandbox operations", including that the replay's captions equal the log entry's steps, the delete replay ending at `40(20(·, 30), 50)` with no pseudocode, and no replay after the sorted shortcut, a rebuild or Clear. Verify they fail only because the replay supports AVL inserts only.

## 2. Build

- [x] 2.1 (content-author) In `src/content/sandbox.ts`: the entry headings, `noRotation`, the not-a-leaf notice, the empty rebuild line, "Replay last delete", the delete replay label and the new availability line. Remove the old rebalance sentence once unused. Verify `npm run typecheck` passes.
- [x] 2.2 (implementer) Add the `rebalance` option to `leafDeleteTrace`, and close a delete's captions with `done` only when the tree is an AVL tree (design 3). Verify task 1.1 passes and every engine test still passes.
- [x] 2.3 (implementer) Run the traces in the sandbox reducer, carry the captions in log entries, and render headings and steps in `EventLog` (design 1, 2, 4). Verify every task 1.2 test passes.
- [x] 2.4 (implementer) Add the insert `rebalance` flag and the `delete` kind to the replay `Operation` and `ReplayPlayer`, track `lastChange` in the reducer, and show "Replay last insert" or "Replay last delete" (design 5). Verify every task 1.3 test passes, and `npm test` and `npm run lint` are green.

## 3. Records and review

- [x] 3.1 Add D161 to D163 to `.claude/docs/decisions.md`. Verify `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all` pass.
- [ ] 3.2 Run the reviewer and a11y-checker roles. Then by hand: insert 10, 20, 30 with rebalancing on and compare the log with C6's animation captions; replay an insert and a delete, on and off, and compare the replay's captions with the log; delete a leaf and a non-leaf; repeat with rebalancing off; and read the log with a screen reader. Verify the reports pass or findings are resolved.

## Workflow follow-up

- The user commits, merges and archives; agents do not.
