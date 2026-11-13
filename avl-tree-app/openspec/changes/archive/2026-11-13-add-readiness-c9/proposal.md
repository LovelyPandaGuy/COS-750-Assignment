# Proposal: add-readiness-c9

Plan row 23. Serves FR-ASM-06 (closing readiness check in C9: one item per learning outcome and two combined items; what was missed returns once; results per outcome), FR-ASM-07 (a returned item is a new problem), FR-ASM-05 (confident errors), FR-RDY-01 (Ready or Revise per LO1 to LO9, LO8 shown but never blocking), FR-RDY-02 (unresolved misconceptions become a bring-to-the-lecture list, and the student writes one question of their own) and FR-RDY-03 (print, save and copy). Outcomes: LO1 to LO9. Ties to D4, D8, D13, D14, D19, D20.

> **Merge note.** This change was built twice in parallel: logic only on `feat/add-readiness-c9`, and with screens on `feat/add-checks-and-feedback`. Where the two contradicted, this branch's version was chosen (13 Nov). Only the scope question (item 1) is still open.

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item is an assumption kept in one place.

### Assumed, not blocking

1. **Scope: logic first, or logic and screens together. Undecided.** This branch built C9 as pure, tested logic (bank, session, report, lecture list) because changes 20 and 22 were not built (user choice, 13 Nov), leaving the screens to a later change. The incoming branch also builds the C9 page at `/module/C9/check` and the summary at `/readiness`, and retires the screen-skeletons capability.
2. **Eleven items, one per outcome plus two combined (ID C9, D14).** LO1 tree height, LO2 node height, LO3 balance factor, LO4 search, LO6 rotation result, LO7 rebalancing case, LO8 delete (optional, D4), LO9 scenario choice, each reusing a check kind under a C9 ID so the problem is new. All new wording is `beyond ID`, flagged for G3.
3. **A separate readiness bank. Decided 13 Nov: this branch's version.** C9's items live in `READINESS`, not among the module checks, so the module-check rules (D15) stay as they are and C9 has no items in the check bank.
4. **LO5. Decided 13 Nov: this branch's version.** A new kind, `worst-search`, asks how many nodes a worst-case search visits in a plain BST and in an AVL tree of the same size, both numbers from the engine (D13). Its wrong options reuse two existing misconceptions, so the catalogue does not change.
5. **The combined items: build, then search (ID C9). Decided 13 Nov: this branch's version.** The student builds the whole AVL tree from keys chosen so the build needs at least one rotation (tree answer), then counts the nodes a search visits in that same tree (shared seed). The build counts toward LO7 and the search toward LO4.
6. **One try per item, no ladder. Decided 13 Nov: this branch's version.** C9 is the readiness check, so its items have no scaffold ladder or retry cap; the report's links back are its support.
7. **Each missed item returns once. Decided 13 Nov: this branch's version.** Each missed item returns once at the end of the run, in the order missed, as a new variant (`READINESS_RETURNS = 1` in the config). Only LO8 may be skipped (D4, D20); an unreadable answer does not count.
8. **The Ready or Revise rule (FR-RDY-01, D8). Decided 13 Nov: this branch's version.** Each C9 item has a state from its stored attempts, the latest deciding: unassessed, not yet, developing or secure. An outcome is Ready when it has an assessed item and every assessed item is secure or developing; otherwise Revise. Overall Ready ignores LO8 (D4). The states are computed, not written to `subSkillStatus`.
9. **Confident errors (FR-ASM-05).** Wrong attempts rated "sure", across the module checks and C9, counted per outcome; the summary flags an outcome row when its count is above zero.
10. **Links back.** Each outcome links to the worked example of the module that teaches it (LO1 C2, LO2 and LO3 C3, LO4 C4, LO5 C4, LO6 C5, LO7 C6, LO8 C7, LO9 C8). This branch also links LO5 to C8, as the ID names both.
11. **The bring-to-the-lecture list (FR-RDY-02). Decided 13 Nov: this branch's version.** The questions recorded at the retry cap, plus one question per unresolved misconception: one whose latest wrong attempt has no later correct attempt on an item of the same sub-skill. The text comes from one template on its catalogue label (`lectureListText`).
12. **The student's own question. Decided 13 Nov: this branch's version.** It is a stored lecture question with the ID `own` (`OWN_LECTURE_QUESTION`), so the stored shape does not change. The summary says not to type a name or student number. At least one is needed before C9 can finish and before the summary can be exported.
13. **Export (FR-RDY-03, incoming).** Print uses a print stylesheet for one A4 page; save downloads a plain-text file; copy puts the same text on the clipboard. Nothing is sent anywhere.
14. **Completion. Decided 13 Nov: this branch's version.** Marking C9 complete is left to the screens, once the items and returns are done and the lecture list no longer needs an own question.
## Why

C9 is the ID's closing step and the only place LO4, LO5, LO6 and LO9 are revisited together. FR-ASM-06, FR-RDY-01 and FR-RDY-02 are Musts: without them the app ends with no account of what the student can do or what to ask in the lecture, and the misconception and lecture-question work of changes 19 to 22 has no place to surface. C9 and the readiness summary are also the last skeletons.

## What Changes

- **The C9 items:** eleven, one per outcome plus build-then-search, every answer from the engine, validated like the module checks.
- **New kinds:** LO5 worst-case search, the combined build item and the combined search item.
- **The C9 run:** the items in order with one try each, then one return of each missed item as a new variant; a skip for the optional LO8 item only.
- **The readiness report:** Ready or Revise per outcome from stored attempts, LO8 never blocking, confident errors and links back.
- **The bring-to-the-lecture list:** questions for unresolved misconceptions, the questions drafted at the cap, and the student's own question.
- **Screens (incoming branch, scope still open):** the C9 page, the summary at `/readiness` with print, save and copy; the screen-skeletons capability retired.

## Capabilities

### New Capabilities
- `readiness-check`: the C9 items and their validation, the new kinds, and the C9 run with its single return.
- `readiness-report` (this branch): Ready or Revise per outcome from stored attempts, confident errors, links back, and the bring-to-the-lecture list with the own question.
- `readiness-summary` (incoming): the summary screen that shows the readiness report, flags, lecture list, own question and export.

### Modified Capabilities
- `screen-skeletons` (incoming): retired; every requirement is removed.

## Impact

- This branch: new `src/assessment/kinds/readiness.ts`, `src/assessment/readiness.ts` (session), `src/assessment/report.ts`, `src/content/questions/readiness.ts`; changed `types.ts`, `kinds/index.ts`, `validate.ts`, `config.ts` (`READINESS_RETURNS`, `READINESS_BUILD_KEYS`, `OWN_LECTURE_QUESTION`), `outcomes.ts`. Tests in `tests/assessment/readiness-check.test.ts` and `readiness-report.test.ts`.
- Incoming: `src/content/readiness.ts` and the `ReadinessCheck` and `Readiness` pages, which must be moved onto this branch's API. The code files are still in conflict.
- No new dependency; no network.

## Out of scope

- The event log and its export, and the anonymous lecturer file (FR-RDY-04, FR-RDY-05; change 26).
- Progress indicators per sub-skill and mastery markers on other screens (FR-MOT-01 to FR-MOT-03).
- Writing readiness states to `subSkillStatus` and routing on them (FR-SCA-01, change 22).
- Editing a drafted lecture question.
- Accessibility settings (change 24).
