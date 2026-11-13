# Tasks

## 1. Failing tests first

- [x] 1.1 Write failing tests: the three new kinds and `READINESS` over seeds 0 to 99 (engine answers, eleven items covering LO1 to LO9, only LO8 optional, validator clean with C9 at eleven); `outcomeStatus` (Ready, Revise, LO8 not tried), `confidentErrors`, `lectureList` (resolved and unresolved, recorded questions, no duplicates, empty only when nothing is unresolved) and `summaryText` (no profile ID); own-question storage and session (older save, tampered, trim, blank, reload, reset); the C9 page (intro, items with ladder and cap, recycle only not-Ready outcomes once as new variants, skipped when all Ready, C9 completion, link to the summary); the summary page (table matches fixtures, links back, flags, lecture list, own question required for export, copy with status, save builds a text file, print stylesheet hides controls, wording scan, axe).

## 2. Assessment layer

- [x] 2.1 Build `search-bound`, `avl-build-root` and `build-and-search`; add `M-AVL-WORST-LINEAR` with hint and lecture template; write `READINESS`; join it into `ALL_ITEMS`; update the validator's C9 count and optional rule.
- [x] 2.2 Build `assessment/readiness.ts`: `outcomeStatus`, `confidentErrors`, `lectureList`, `summaryText`.

## 3. State

- [x] 3.1 Add `ownQuestions` to the learner state, parser, storage writer and inventory; the `own-question-added` action and `addOwnQuestion` on the session.

## 4. Screens

- [x] 4.1 Build `ReadinessCheck` at `/module/C9/check`: intro, the eleven `CheckItem` steps, the recycle step, C9 completion and the summary link.
- [x] 4.2 Build the `Readiness` summary: outcome table, flags, lecture list, own-question form, print, save and copy with a print stylesheet; wording in `content/readiness.ts`.

## 5. Docs and review

- [x] 5.1 Add decisions from D87 for the assumptions in the proposal, update `next-steps.md`, and run `npm test`, typecheck, lint, build and `openspec validate --all`.
- [ ] 5.2 Reviewer and accessibility-checker passes; the user's browser checks (keyboard only, greyscale, colour-vision emulation D25, 360 px touch, print to one A4 page), and a read of the new wording (gate G3).
