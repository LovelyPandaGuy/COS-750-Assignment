# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place. Please read them before `/opsx:apply`.

1. **Assumed, not blocking: the eleven C9 items (ID C9, D14).** One per outcome, LO1 to LO9, reusing the check kinds (LO8's delete item is optional, D4). Two new kinds serve LO5 ("worst-case search in an AVL tree of n keys", from the engine's height bound, D13) and the two combined items: "build an AVL tree from these keys: which key is the root?" and "build it, then how many nodes does a search for k visit?". One new misconception (expecting an AVL tree's worst case to be as slow as a plain BST's) joins the catalogue with a hint and a lecture question. All wording is `beyond ID`, flagged for G3.
2. **Assumed, not blocking: the C9 check works like any check.** Each item has the ladder and the retry cap (D21, change 21), on its own page at `/module/C9/check`, because C9 has no Explore or Worked example to build module content from.
3. **Assumed, not blocking: "anything missed earlier comes back once, in a new form" (D14).** After the eleven items, every outcome that is not Ready (rule in item 4) brings back its C9 item once more, as a new variant. An outcome comes back at most once. The recycle step is skipped when every outcome is Ready.
4. **Flagged for you: the Ready or Revise rule (FR-RDY-01, D8).** An outcome is Ready when the most recent attempt at each of its sub-skills is right; otherwise Revise, including when it was never tried. LO8 is shown with "optional" and, when never tried, reads "Not tried" rather than Revise, so it never blocks (D4). The stored three-state status (D8, change 21) is kept for routing and scaffolding, as the SE document asks. Displaying it directly would leave a student at Revise after a right answer on the return question.
5. **Assumed, not blocking: confident errors (FR-ASM-05, FR-RDY-01).** An outcome row is flagged "You were sure, but missed one here" when any attempt at it was wrong with confidence "sure".
6. **Assumed, not blocking: the bring-to-the-lecture list (FR-RDY-02).** It holds the lecture questions recorded at the retry cap, plus the template question for each misconception whose item was never answered correctly afterwards, without duplicates. It is empty only when nothing is unresolved.
7. **Flagged for you: the student's own question is stored as typed text (FR-RDY-02, D14).** It is the first free text the app keeps. It stays in this browser, is listed in the stored-data inventory, and the screen says not to type a name or student number. Print, save and copy are enabled once at least one question is written; more are allowed.
8. **Assumed, not blocking: export (FR-RDY-03).** Print uses a print stylesheet sized for one A4 page; save downloads a plain-text file; copy puts the same text on the clipboard. Nothing is sent anywhere. The event log and the lecturer file (FR-RDY-04, FR-RDY-05) are change 26.
9. **Assumed, not blocking: C9 completes when the eleven items are finished (right or capped, D20, change 21) and the recycle step is done.** LO8's item is optional. The summary is open at any time and always reflects the stored attempts.
10. **Assumed, not blocking: links back.** Each outcome row links to the Worked example of the module that teaches it (LO1 C2, LO2 and LO3 C3, LO4 C4, LO5 C4, LO6 C5, LO7 C6, LO8 C7, LO9 C8).

## Why

C9 and the readiness summary are the last skeletons. FR-RDY-01 and FR-RDY-02 are Musts: without them the app ends with no account of what the student can do or what to ask in the lecture, and the misconception and lecture-question work of changes 19 to 22 has no place to surface.

## What Changes

- **The C9 check:** eleven items (one per outcome plus two combined), with feedback, ladder and cap, then a recycle step for outcomes not yet Ready.
- **The readiness summary** at `/readiness`: Ready or Revise for LO1 to LO9 with links back, confident-error flags, the bring-to-the-lecture list, the student's own question, and print, save and copy.
- **Assessment:** two new kinds, one misconception, the C9 bank and the bank count for C9.
- **Learner state:** a list of the student's own questions.
- The screen-skeletons capability is retired: no skeleton is left.
- Serves FR-RDY-01, FR-RDY-02, FR-RDY-03, FR-ASM-05, FR-ASM-06, D4, D8, D13, D14, D19, D20, for LO1 to LO9.

## Capabilities

### New Capabilities
- `readiness-check`: the C9 items, their flow, the recycle step and C9's completion.
- `readiness-summary`: the per-outcome summary, flags, lecture list, own question and export.

### Modified Capabilities
- `question-bank`: C9 has eleven items.
- `learner-storage`: the student's own questions are stored and validated.
- `learner-session`: screens can record an own question.
- `screen-skeletons`: retired; every requirement is removed.

## Out of scope

- The event log and its export, and the anonymous lecturer file (FR-RDY-04, FR-RDY-05; change 26).
- Progress indicators per sub-skill and mastery markers on other screens (FR-MOT-01 to FR-MOT-03).
- Accessibility settings (change 24).
