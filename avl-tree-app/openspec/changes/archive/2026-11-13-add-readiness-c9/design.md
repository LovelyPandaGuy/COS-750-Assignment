# Design: add-readiness-c9

> **Merge note.** Joins the logic-only design (this branch) and the screens design (`feat/add-checks-and-feedback`). Where they contradicted, this branch's version was chosen (13 Nov).

## Context

See proposal.md for why and scope. What exists and is reused:

- The question model (`src/assessment/`): `instantiate(item, seed, attempt)` gives a new problem per attempt; `mark`, `attemptRecord`, the `Kind` interface and `validateItems` (tags, explanations, options, numbers, D19 wording, calm wording, hints).
- Kinds that fit C9: `bst-height`, `node-height`, `balance-factor`, `search-visits`, `rotation-result`, `rebalance-case`, the delete kinds, `scenario-choice`.
- `searchBounds(n)` and `maxAvlHeight` (D13); `avl` and `plain` in `kinds/shared.ts`; `avlInsertTrace`; `generateInsertSequence` and `variantSeed`.
- The scaffold ladder and cap (change 21), stored `attempts` (with `confidence`, `misconceptionId`, `hintsUsed`) and `lectureQuestions`. `SUB_SKILLS` reserves `search-complexity` (LO5).
- `validateBank` enforces 2 or 3 items per module from C2 to C8 and none for C9.
- `/module/C9/check` and `/readiness` render `SkeletonScreen`; the TopBar's "Lecture questions" action already links to `/readiness`.

## Goals / Non-Goals

**Goals:**
- Every number from the engine and every verdict from stored attempts, through pure functions tested against fixtures (FR-RDY-01 acceptance), so the screens stay thin.
- Incoming: the screens render this logic.

**Non-Goals:** the event log, the lecturer export, progress markers elsewhere (change 26 and later); writing `subSkillStatus`.

## Decisions

### 1. The C9 items (Decided 13 Nov: this branch's version.)

`READINESS` in `src/content/questions/readiness.ts` (content-author): `rdy-lo1` to `rdy-lo9`, then the two combined items. Eight items reuse a module check's wording under a C9 ID. `BankItem` gains `combined?: boolean`. `OUTCOMES` gains `modules` per outcome, from the ID. `validateReadinessBank` checks: one non-combined item per LO; two combined items with outcomes LO7 and LO4; module C9; only LO8 optional. `validateBank(CHECKS)` is untouched.

New kinds in `src/assessment/kinds/readiness.ts`:
- `worst-search` (choice): n from 16 to 4096. The answer is "plain n, AVL log". Wrong options: "both log" (`M-ASSUMES-BALANCED`) and "both n" (`M-SEARCH-VISITS-ALL`).
- `build-avl` (tree): keys come from a bounded seed search for a build that rotates, with a pinned fallback. The wrong answer is the plain BST (`M-FORGETS-REBALANCE`). The trace joins `avlInsertTrace` per key.
- `search-built` (number): the same keys and tree as the build, through the shared seed slot `COMBINED_SLOT`. It reuses the `search-visits` builder.

### 2. Running C9 (Decided 13 Nov: this branch's version.)

A pure session in `src/assessment/readiness.ts`: `startReadiness`, `readinessStep`, `readinessInstance` and `itemSeed`. It holds a queue, the misses and a phase. Every item is shown once in bank order, one try, `hintsUsed: 0`. Then each missed item is queued again as the next attempt, up to `READINESS_RETURNS`. `skip` works only on the optional item, which never returns. Marking C9 complete is left to the screens.

Rejected alternative: change 21's `checkStep` per item, because C9 has no ladder and its returns span items.

### 3. The report (Decided 13 Nov: this branch's version.)

`readinessReport(attempts)` in `src/assessment/report.ts`:
- Attempts are sorted by `at`. Each item's state comes from its attempts, the latest deciding.
- An outcome takes its lowest assessed state. Ready means secure or developing.
- `blocksReady` is false for the outcome whose readiness item is optional (LO8), read from the content.
- Confident errors are counted per outcome. `links` point to the worked examples.

The summary screen renders this report and adds no rule of its own.

### 4. The lecture list (Decided 13 Nov: this branch's version.)

`lectureList(attempts, lectureQuestions)` returns:
- `generated`: unresolved misconceptions, in order of first appearance, with text from `lectureListText(label)`.
- `drafted`: the questions recorded at the cap.
- `own`, and `needsOwn`.

A misconception is resolved by a correct attempt on the same sub-skill after its latest wrong attempt.

### 5. The own question (Decided 13 Nov: this branch's version.)

A stored lecture question with `questionId: 'own'` (`OWN_LECTURE_QUESTION`), so nothing stored changes shape.

### 6. The summary page (incoming)

`Readiness` shows a table (outcome, text, status word, flag, link), the lecture list, the own-question form and an export bar. Print calls `window.print()` with a `@media print` stylesheet; save builds a `Blob` for a `.txt` download; copy uses `navigator.clipboard.writeText` and announces in a polite status. All three stay disabled until one own question exists.

### 7. Skeletons retired (incoming)

`SkeletonScreen` stays only as `Activity`'s fallback; the screen-skeletons spec is removed (`retire_capabilities`).

## Risks / Trade-offs

- **Redoing C9.** Attempts have no run ID, so the latest attempts decide and a redo overrides an older run.
- **Builds with no rotation would make the build item trivial.** This branch uses a bounded search, a pinned fallback and a test over seeds 0 to 99.
- **Large LO5 numbers (up to 4096 keys).** `numbersIn` handles them.
- **No ladder in C9 may feel harsh.** The single return and the links back are the support.
- **Free text in storage.** The own question is the first typed text kept. It is mitigated by the on-screen note and the inventory; reset clears it.
- **Print to one A4 page cannot be tested automatically (incoming).** A test checks that the print stylesheet hides navigation and controls.
- **Clipboard and download are browser APIs (incoming).** They are wrapped and stubbed in tests; a failure shows a calm message.

## Migration Plan

None. Nothing stored changes shape; own questions use the existing lecture-question record.

