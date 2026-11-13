# Proposal: add-readiness-c9

Plan row 23. Serves FR-ASM-06 (closing readiness check in C9: one item per learning outcome and two combined items; a missed item returns once; results per outcome), FR-RDY-01 (Ready or Revise per LO1 to LO9, LO8 shown but never blocking, confident errors flagged), FR-RDY-02 (unresolved misconceptions become a bring-to-the-lecture list, and the student writes one question of their own) and FR-ASM-07 (a returned item is a new problem). Outcomes: LO1 to LO9.

## Open questions

None block this change (D18). Everything below is assumed, kept in one place, and gets a row in `decisions.md`.

### Assumed, not blocking

1. **Logic before screens (user choice, 13 Nov).** Changes 20 (check screens) and 22 (C1 diagnostic) are not built. This change builds C9 as pure, tested logic: the readiness bank, the C9 session, the readiness report and the lecture list. A later change renders the C9 question screen (after change 20) and replaces the Readiness skeleton with the summary, print, save and copy (FR-RDY-03). Ties to D14, D75.
2. **A separate readiness bank.** C9's items live in their own bank, not in the module checks, so the module-check rules (2 or 3 items per module from C2 to C8, D15) stay as they are. There is one item per outcome, reusing the existing kinds where one fits: LO1 tree height, LO2 node height, LO3 balance factor, LO4 search not found, LO6 rotation result, LO7 rebalancing case, LO8 root after a delete, LO9 scenario choice. Ties to D14, D15.
3. **LO5 gets a new kind.** No existing kind assesses LO5. The new item asks how many nodes a worst-case search visits in a plain BST and in an AVL tree of the same size, with both numbers computed by the engine (D13). Its wrong options reuse two existing misconceptions ("expects every BST search to be short", "expects a search to look at every node"), so the catalogue does not change. The stem and explanations are new wording, flagged `beyond ID`. Ties to D13, D19.
4. **The two combined items are build, then search (ID C9).** One item builds an AVL tree from a short key sequence, chosen by seed so the build needs at least one rotation. The other searches the same tree; it shares the build item's seed. The build counts toward LO7 and the search toward LO4. Ties to D14.
5. **One try per item, then one return.** C9 is the readiness check, so its items have no scaffold ladder: the report's links back are its support. Each missed item returns once, at the end of the run, as a new variant (`READINESS_RETURNS = 1` in the config). The optional LO8 item may be skipped (D4); no other item may (D20). An unreadable answer does not count. Ties to D9, D14, D20, D21.
6. **Status comes from stored attempts.** Each C9 item's status is read from its stored attempts: no attempt means unassessed; a latest attempt that is not correct means not yet; a latest correct attempt after a wrong one means developing; otherwise secure. An outcome is Ready when it has at least one assessed item and every assessed item is secure or developing; otherwise it is Revise. Overall Ready ignores LO8 (D4). The three states are computed, not written to `subSkillStatus`; writing them waits for the mastery threshold (FR-SCA-01). Ties to D8.
7. **Confident errors.** For each outcome, the report counts the wrong attempts rated "sure", across the module checks and C9. Ties to FR-ASM-05.
8. **Links back.** Each outcome links to the worked example of the module or modules the ID names for it (LO5: C4 and C8). The outcome record gains each outcome's modules, taken from the ID. Ties to D1.
9. **The bring-to-the-lecture list.** A misconception is unresolved when a wrong attempt carries it and no later attempt on an item of the same sub-skill is correct. Each unresolved misconception becomes one question from a single template built on its catalogue label. Questions drafted at the retry cap (D81) are listed too. The student's own question is a lecture question with the ID `own` (`OWN_LECTURE_QUESTION` in the config), so the stored shape does not change. At least one own question is required before C9 can finish. Ties to D9, D14, D82.

## Why

C9 is the ID's closing step and the only place LO4, LO5, LO6 and LO9 are revisited together. FR-ASM-06, FR-RDY-01 and FR-RDY-02 are Musts. The summary screen needs a tested report to show; building the rules now lets the screens be thin.

## What Changes

- A readiness bank: one item per outcome from LO1 to LO9 (LO8 optional) and two combined items (build an AVL tree, then search it), validated like the module checks.
- Three new kinds: worst-case search visits (LO5), build an AVL tree from keys (tree answer), and search the built tree (number answer).
- A C9 session: the items in order, then each missed item once more as a new variant; a skip for the optional item; attempt records for the caller to store.
- A readiness report computed from stored attempts: Ready or Revise per outcome, item states (secure, developing, not yet, unassessed), overall Ready that ignores LO8, confident-error counts, and links back.
- A bring-to-the-lecture list: questions for unresolved misconceptions, drafted questions from the retry cap, the student's own questions, and whether an own question is still needed.

## Out of scope

- Every screen: the C9 question screen, the summary (wireframe 1o), print, save and copy (FR-RDY-03). These come in a later change.
- Writing the three states to `subSkillStatus`, the mastery threshold and routing (FR-SCA-01, change 22).
- The event log and the anonymous export (FR-RDY-04, FR-RDY-05, change 26).
- Editing a drafted lecture question (the screens change).
- Marking C9 complete in learner state, which the screens do when the report says C9 can finish.

## Capabilities

### New Capabilities
- `readiness-check`: the C9 readiness bank and its validation, the new kinds it uses, and the C9 session with its single return of each missed item.
- `readiness-report`: Ready or Revise per outcome from stored attempts, confident errors, links back, and the bring-to-the-lecture list with the student's own question.

### Modified Capabilities
None. The module checks, the question model, scaffolds and storage keep their requirements. The new kinds plug into the existing question model.

## Impact

- New: `src/assessment/kinds/readiness.ts` (three kinds), `src/assessment/readiness.ts` (session), `src/assessment/report.ts` (report and lecture list), `src/content/questions/readiness.ts` (the bank and the lecture-list template).
- Changed: `src/assessment/types.ts` (`KindName`, an optional `combined` flag on items), `src/assessment/kinds/index.ts`, `src/assessment/validate.ts` (`validateReadinessBank`), `src/modules/config.ts` (`READINESS_RETURNS`, `READINESS_BUILD_KEYS`, `OWN_LECTURE_QUESTION`), `src/content/questions/outcomes.ts` (modules per outcome).
- Tests: new `tests/assessment/readiness-check.test.ts` and `tests/assessment/readiness-report.test.ts`; `tests/assessment/helpers.ts` gains engine answers for the new kinds.
- No UI, no storage-shape change, no new dependency.
