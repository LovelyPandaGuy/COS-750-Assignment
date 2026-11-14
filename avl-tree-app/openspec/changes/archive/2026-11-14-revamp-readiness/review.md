# Review: revamp-readiness

## Role crossings (flagged)

No `.claude/agents/` exist, so one agent played every role. Where a role wrote outside its own scope:

- **Test-writer edited existing tests.**
  - `tests/ui/lesson-c1-c9.test.tsx`: the report tests now read the summary table and flags list, with the same meaning (proposal question 13). Added tests for the levels, read-only suggested questions, Copy on `/readiness`, editing an own question, and no rank letter.
  - `tests/ui/contracts.test.tsx`: counts set to 29 and 16.
- **Content-author** wrote `src/content/readiness.ts` (flagged header). Refinement: there is no `OBJECTIVE_LEVELS` copy, because ID 5.1's levels per objective are already typed once in `src/live/outcomes.ts` (`OUTCOMES.levels`). The content file holds only the level words, so one fact stays in one place (D18).
- **Outside the agreed files: `src/ui/lesson/lesson.css`.** The certificate's print rule hid everything but `.certificate` on every page that loads `lesson.css`, so printing `/readiness` gave a blank page. It is now scoped with `body:has(.certificate)`. The certificate prints as before.
- **Design decision 14, refined:** the reducer (not the context) trims, caps and ignores blank edits, so the rule lives in one place.

## Baselines

- **New:** `readiness-{light,dark}-{phone,tablet,desktop}`, `readiness-greyscale-desktop`, `readiness-print-desktop`.
- **Regenerated, with the gallery grown by the readiness section:** the seven `gallery-*` baselines.
  - After 2.4, the old region was pixel-identical (0 diff).
  - After the polish, the tablet and desktop diffs start inside the readiness section: y 11462 against a section top of 11116 at 768, and y 7910 against 7564 at 1366.
- **Page baselines:** none cover `/readiness` or C9's report, so the wiring changed none.

## Critique (4.1)

Screenshots of the wired `/readiness` page were taken at 390, 768 and 1366, in light and dark, with one question being edited at 390, in achromatopsia, and in dark print emulation.

| # | Finding | Quality bar | Result |
|---|---|---|---|
| 1 | Print on `/readiness` was blank: `lesson.css`'s certificate rule hid the whole page | 8 (print) | Fixed (scoped with `:has`) |
| 2 | In the dark theme, `CanvasText` and `Canvas` follow `color-scheme`, so print gave light ink, which is invisible on paper once the background drops | 8 | Fixed (`color-scheme: light` in print) |
| 3 | The status pills kept their dark fill in print, because the status selector outranked the reset | 8 | Fixed |
| 4 | "Since last time" was an empty column on every row (no run history, question 7) | 2 (layout) | Fixed: the column is left out when no row has a note |
| 5 | The optional word ran into the statement ("property.optional") | 3 (text) | Fixed (a space) |
| 6 | Status in greyscale: ✓/↻ plus the word, solid against dotted borders | 7 | Pass |
| 7 | Cards at 390: every row is a card with labelled Level, Status and Review; no sideways scroll; targets 44 px or more | 2, 4, 5 | Pass |
| 8 | Edit state at 390: labelled field, Save and Cancel, nothing red | 3, 6 | Pass |
| 9 | The headline reads "Overall: Revise" over the title "AVL Ace: Strong work: you have mastered this lesson." The share is high, but one objective is Revise. The message is `rewards.json` content, so it is **not changed here** | n/a | **Human decision** (see below) |
| 10 | Long Review link labels ("See C7 Deletion with rebalancing (optional)") wrap to four lines in the 1366 table | 2 | Accepted: the labels come from content; a shorter label is a wording choice |

## For a human

- **The title message contradicts a Revise result.** `rewards.json` titles go by share only (ID 10.4), so a student can be Revise overall and read "you have mastered this lesson". Options:
  - leave it as is;
  - hide the message when the overall result is Revise (a mapper change);
  - reword the content (team).
- **Still open (5.1):** a fresh-context reviewer and the a11y-checker, including a screen-reader listen to one stacked card and to the Copy announcement, and a real print preview on paper in both themes.

## Full check (5.1, partial)

`npm test` (1081 passed), `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:visual` (52 passed) and `openspec validate revamp-readiness --strict`: all pass.

## Archived with open tasks (14 Nov)

The user asked for this change to be archived on `chore/ui-sweep` as the gate of `ui-quality-sweep` (task 1.1). Tasks still open: 5.1 . They were not done and are not ticked. The independent reviewer and a11y-checker passes, and any open polish, are covered by `ui-quality-sweep`'s audit (groups 2 and 3) instead.
