# Tasks

Scope: `src/ui/learn/**`, tests, and, as the user agreed (D103):
- `src/ui/contracts.ts`;
- the four stubs and `src/ui/stubs/index.ts`;
- the counts in `tests/ui/contracts.test.tsx`;
- one line in `src/gallery/Gallery.tsx` (proposal question 9, confirm at the skim).

Read proposal questions 1 to 12 first. Fixture text only ("Example verdict"); no `src/content/` changes.

## 1. Red tests (test-writer)

- [x] 1.1 Write `tests/ui/learn/question-item.test.tsx` and `tests/ui/learn/confidence-rating.test.tsx` for every `ui-question` scenario:
  - stem, tree and option order; the editor slot;
  - letters and arrows; letters outside the group;
  - the stepper's range, ends, signed strings, spin-button keys and no text input;
  - states and `data-state`; the first miss not revealing the answer, and the cap revealing it;
  - disabled; focus after Try again, and none on mount;
  - the confidence levels by keyboard and their bar counts;
  - axe for each state.

  Name each test after FR-ASM-01, FR-ASM-03, FR-VIS-10, NFR-02 or D105.
- [x] 1.2 Write `tests/ui/learn/feedback-panel.test.tsx`, `full-answer.test.tsx`, `lecture-question-draft.test.tsx` and `scaffold-panel.test.tsx` for every `ui-feedback` scenario:
  - the four parts in DOM order for all three variants;
  - no red token, cross glyph or fail words (stylesheet and markup);
  - a `@ts-expect-error` for `fullAnswer` on `not-yet`; the cap slots;
  - the live-region text and heading focus; no focus on mount;
  - the disclosure; draft edit, add, decline and added;
  - rungs from props for practice and check; state words and borders;
  - the Hint count, its accessible name and `aria-disabled` at 0;
  - axe for each state.
- [x] 1.3 Cross-cutting tests:
  - update `tests/ui/contracts.test.tsx` counts to 23 built and 22 stubbed;
  - add a source scan (no `src/content/` import under `src/ui/learn/`);
  - add `tests/ui/learn/keyboard-flow.test.tsx` (the composed flow by keyboard only);
  - write `tests/visual/learn.spec.ts`: the gallery's learn section at 390, 768 and 1366, no page scroll, targets of at least 44 px, text of at least 16 px, screenshots.

  Verify that `npm test` fails only in the new cases (plus the contract counts) and that `npm run test:visual` fails only in the new file. Then ask the user before committing the red tests.

## 2. Build (implementer, `src/ui/learn/` and the agreed files)

- [x] 2.1 Widen the four contracts in `src/ui/contracts.ts` (design decision 1), move the names to BUILT, and delete their stubs and index entries. Build `QuestionItem.tsx` (choice group, stepper, slots, states, reveal and focus rule) and `ConfidenceRating.tsx` (design decisions 4 to 6). Verify that the `ui-question` tests and the contracts test pass, and that `npm run typecheck` passes.
- [x] 2.2 Build `FeedbackPanel.tsx` (discriminated union, live region, heading focus), `FullAnswer.tsx` and `LectureQuestionDraft.tsx` (design decisions 3, 6 and 7). Verify that their tests pass.
- [x] 2.3 Build `ScaffoldPanel.tsx` (rungs from props, Hint button with count, `aria-disabled` at 0; design decision 8). Verify that its tests and the keyboard-flow test pass.
- [x] 2.4 Write `learn.css` (tokens only; design decision 9) and `LearnGallery.tsx`, and mount it with one line in `src/gallery/Gallery.tsx`. Verify that `npm run lint` passes, run `npm run test:visual`, create the learn baselines, and regenerate only the gallery baselines that grew (D97). List them in `review.md`.

## 3. Critique, then polish

- [x] 3.1 Critique (read-only): use the `frontend-design` skill to score every component state at 390, 768 and 1366, in light and dark, in greyscale and in the three colour-vision simulations. Score against all ten lines of `.claude/docs/design/quality-bar.md` and screen specs 1c and 1i to 1l, and the design system's QuestionItem, ConfidenceRating, ScaffoldPanel and FeedbackPanel. Write the findings to `openspec/changes/revamp-question-and-feedback/review.md` under "Critique". Do not edit code.
- [x] 3.2 Polish (ui-polisher, CSS and layout markup in `src/ui/learn/` only, no tokens, logic or tests): fix each finding inside the design system. Verify that `npm test`, `npm run lint` and `npm run test:visual` pass and that every quality-bar line reads pass (or records a human decision).

## 4. Review

- [ ] 4.1 Full check: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:visual` and `openspec validate revamp-question-and-feedback --strict` all pass. Then the `reviewer` (fresh context, against both specs, D27 and the quality bar) and the `a11y-checker` report pass, or their findings are resolved. The a11y-checker also runs:
  - the keyboard-only flow;
  - a screen-reader listen for the double announcement (proposal question 8);
  - greyscale and the three colour-vision simulations (D25);
  - 44 px targets and 16 px text.

  Record the results in `review.md`.

## Workflow follow-up

- After the human skim, record D103 to D106 in `.claude/docs/decisions.md`. Add the team questions to the open list: the confidence levels (2 or 3), and the confidence FR ID.
- Content-author: `src/content/learn.ts` with the real labels and verdicts once the balance-factor convention is settled. First-miss reasons must not state the answer (D105, flagged at G3).
- The next change wires CheckItem, practice and the diagnostic onto these components. It modifies `module-checks` (stepper), `check-feedback`, `scaffold-ladder` and `retry-cap`, and repoints the `FeedbackPanel` contract.
- A human merges after `add-ui-foundation` is archived and runs `/opsx:archive`. Agents do not.
