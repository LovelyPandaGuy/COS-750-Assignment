# Design

## Context

`/module/C9/check` and `/readiness` render `SkeletonScreen`. The assessment layer has `ALL_ITEMS` (diagnostic and checks), `instantiate`, `mark`, the scaffold ladder and cap (`CheckItem`, `capped`, `finished`), `lectureQuestionFor`, and stored `lectureQuestions`. `searchBounds(n).avlWorst` and `maxAvlHeight` give the AVL height bound (D13). `SUB_SKILLS` reserves `search-complexity` (LO5) for readiness. The TopBar's "Lecture questions" action already links to `/readiness`. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Reuse `CheckItem` for every C9 step, so feedback, ladder, cap and storage are identical.
- One pure function from stored attempts to the summary, tested against fixtures (FR-RDY-01 acceptance).

**Non-Goals:**
- Event log, lecturer export, progress markers elsewhere (changes 26 and later).

## Decisions

1. **C9 bank** in `src/content/questions/readiness.ts` (`READINESS`, eleven items, module C9), joined into `ALL_ITEMS`. The validator's count rule gets C9: 0 or 11; the optional rule allows C9's LO8 item. Kinds reused: bst-height (LO1), node-height (LO2), balance-factor (LO3), search-visits (LO4), rotation-result (LO6), rebalance-case (LO7), delete-rebalances (LO8, optional), scenario-choice (LO9). New kinds in `kinds/readiness.ts`: `search-bound` (choice, LO5: worst-case nodes visited in an AVL tree of n keys, wrong values n and the perfect-tree count), `avl-build-root` (choice, LO7: root after AVL inserts, wrong the plain BST root and the middle key), `build-and-search` (number, LO4: nodes visited in the AVL tree, wrong the plain-BST count and the edge count). One misconception, `M-AVL-WORST-LINEAR`, with hint and lecture template.
2. **Readiness model** in `src/assessment/readiness.ts`, pure: `outcomeStatus(attempts)` per LO1 to LO9 (`ready`, `revise`, `not-tried` for LO8 only) from the latest attempt per sub-skill over `ALL_ITEMS`; `confidentErrors(attempts)`; `lectureList(attempts, lectureQuestions, profileId)` (instantiates each unresolved item at the attempt's index to build the template text, unions recorded questions, removes duplicates); `summaryText(...)` for save and copy.
3. **C9 page** `ReadinessCheck` at the existing route: intro, then a step list of the eleven `CheckItem`s, then the recycle items. The recycle list is derived when the eleven are finished: outcomes not Ready whose item has been shown at most once in recycle (an item comes back when its attempt count shows no recycle yet, tracked by a `recycled` set kept in the page and re-derived on load from attempts after the first pass finished). `completeModule('C9')` when required items are finished and the recycle list is done. The final step links to `/readiness`.
4. **Own questions** in `LearnerState.ownQuestions?: { text: string; at: string }[]`, parsed like lecture questions (text 1 to 300 characters), a `own-question-added` reducer action, and `addOwnQuestion` on the session. The inventory description is reworded.
5. **Summary page** `Readiness`: a table (outcome, text, status word, flag, link), the lecture list, the own-question form, and an export bar. Print calls `window.print()` with a `@media print` stylesheet; save builds a `Blob` and an object URL for a `.txt` download; copy uses `navigator.clipboard.writeText` and announces in a polite status. All three are disabled until one own question exists.
6. **Links back**: an `OUTCOME_MODULE` table in `src/content/readiness.ts` with the summary wording; the outcome texts come from the ID's LO list in that file.
7. **Skeletons retired**: `SkeletonScreen` stays only as `Activity`'s fallback for a route no module has; the screen-skeletons spec is removed (`retire_capabilities`).

## Risks / Trade-offs

- **Recycle state from attempts is subtle.** Kept to a derived rule (first eleven finished, then each not-Ready outcome at most once) with tests across reloads.
- **Free text in storage.** First personal-ish data; mitigated by the on-screen note, the inventory, and a 300-character cap. Reset clears it.
- **Print to one A4 page cannot be tested automatically.** A test checks that the print stylesheet hides navigation and controls; the page fit is the user's browser check.
- **Clipboard and download are browser APIs.** Wrapped and stubbed in tests; failures show a calm message.
