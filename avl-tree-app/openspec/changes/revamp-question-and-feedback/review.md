# Review notes: revamp-question-and-feedback

## Visual baselines (task 2.4, D97)

New:
- `tests/visual/__screenshots__/learn-{light,dark}-{phone,tablet,desktop}-darwin.png`: the gallery's learn section.
- `learn-greyscale-desktop-darwin.png`.

Changed, because the gallery page grew by the learn section (one import and one element in `src/gallery/Gallery.tsx`, proposal question 9):
- `gallery-{light,dark}-{phone,tablet,desktop}-darwin.png`;
- `gallery-greyscale-desktop-darwin.png`.

The base-component part of those pages is unchanged. `npm run test:visual` passed (30 tests) on three runs in a row.

## Found while building

- **FullAnswer was open by default in a real browser.** `.learn-full-answer > div { display: grid }` overrode the `hidden` attribute; jsdom does not load CSS, so the unit test passed. Fixed with `:not([hidden])`. The visual test now checks that every FullAnswer starts collapsed.
- **FeedbackPanel took focus on mount when given a variant**, so the gallery opened with focus on the last panel. Changed to focus only on changes after the first render, like QuestionItem. The spec line now reads "SHALL NOT take focus on its first render, with or without a variant". A unit test covers it, and the visual test checks that nothing has focus on load.
- **Option names read "AOption one".** The letter and text spans had no space between them. Fixed.
- **Two existing guards caught rule breaks:**
  - `styles.test.ts`: components must not set `outline`. The row focus rings were removed; the native radio inside each row keeps the shared ring.
  - `conventions-single-source.test.ts`: `? -1 :` style literals were named as constants, and the gallery tree is built by the engine instead of with literal heights.
- **Dev dependency:** `@testing-library/user-event` (user's choice) for real Tab and radio-arrow behaviour.

## Critique (task 3.1, frontend-design, read-only)

Screenshots taken at 390 px and 1366 px, light and dark. At 1366 px light, also with Chrome's vision-deficiency emulation: deuteranopia, protanopia, tritanopia and achromatopsia. Checked against the quality bar, screens 1c and 1i to 1l, and the design system.

| # | Finding | Quality bar | Action |
| --- | --- | --- | --- |
| K1 | The "correct answer" tag's text uses `--feedback-correct-icon`, an icon colour. On the correct background it is the weakest text in the panel, and in greyscale it is lighter than "your answer". | 7, 8 | 3.2: text in `--text-primary`; the border keeps the correct colour. |
| K2 | Screens 1j and 1k show rung state as a pill ("open", "seen") next to the border. Ours is plain secondary text. | 1 | 3.2: style `.learn-rung-state` as a pill (border, `--radius-pill`); the open rung's pill gets the action border. |
| K3 | Gallery only: stems in a row sit at different heights, because cells stretch to the tallest one. | 4 (reading) | 3.2: `align-content: start` on the gallery cell. |
| K4 | Screen 1i shows "✓ your answer" on a correct option. Ours shows "your answer" (thick solid border plus the correct background) with no glyph. A glyph needs a label prop, which is an API change, not polish. | 1 | `[OPEN]`: add `labels.correctGlyph`? The design system's "no cross" rule does not cover the tick. Not done. |
| K5 | Under deuteranopia and protanopia, the correct and not-quite-yet panels have the same border and similar backgrounds. They still differ by glyph (✓ or 💡) and by the verdict words, so quality bar 7 passes. The design gives both a 3px solid border. | 7 | Note only. A dashed not-yet panel border would match the option, but the design does not say so. |
| K6 | The concept link starts a little in from the why text (quiet-button padding keeps the 44 px target). | — | Note only; changing it means editing base `.btn`, which is outside this change. |
| K7 | At 0 hints the Hint button keeps its place, its words and `aria-disabled`, but it loses its outline and reads as plain text. | 3 | Note only. The behaviour matches FR-SCA-02 and the disabled tokens. |

Checked and passing: no red and no cross anywhere, in either theme. Not-quite-yet reads as a dashed border, a bulb and the "your answer" tag. All four rung states differ by border style or width and by word. The stepper and level targets measure 44 px or more. Body text is 16 px or more. Dark mode uses the dark tokens throughout.

## Full check (task 4.1, partial)

| Check | Result |
| --- | --- |
| `npm test` | 1464 of 1465 passed. The one failure is the known `tests/ui/c6-module.test.tsx` flake ("a wrong case leaves the tool hidden"; `Date.now` seed in `src/ui/module/ModulePlayer.tsx:79`), unrelated to this change; it passed on 4 reruns. |
| `npm run typecheck`, `npm run lint`, `npm run build` | pass |
| `npm run test:visual` | 30 passed |
| `openspec validate revamp-question-and-feedback --strict` | valid |
| Keyboard-only flow | covered by `tests/ui/learn/keyboard-flow.test.tsx` (pass) |
| Greyscale and the three colour-vision simulations | screenshots checked by hand (critique above); greyscale is also asserted in `tests/visual/learn.spec.ts` |
| 44 px targets, 16 px text | asserted at three widths in `tests/visual/learn.spec.ts` |
| Axe | clean in every component state (unit tests) |

**Not done; needs a human:**
- A reviewer and a11y-checker with fresh context. No agent definitions exist in `.claude/agents/`, and the same agent (Claude) wrote the tests, the code and this review, so this is a self-check, not an independent one.
- A screen-reader listen for the double announcement (proposal question 8). The heading takes focus and the live region speaks the verdict and the why, so some readers may say the verdict twice.

**Findings for the reviewer:**
- The stepper always shows signed values ("+5"), as the spec says, even for counts such as a height. Is that right for every compute item?
- Critique K4 is `[OPEN]` (a ✓ on "your answer").
- Role crossings: one agent wrote the tests (test-writer), the code (implementer) and the CSS (ui-polisher). Two test edits were made during apply, both additions (the FeedbackPanel focus-on-mount test, and the visual checks for collapsed FullAnswer and no initial focus). Both follow from bugs found in the build and are listed above.
- The red-phase `feedback-types` "not-yet rejects fullAnswer" assertion passed trivially while the module was missing. It is meaningful now; it was checked against the real union.

## Merge with main (14 Nov)

- Learn components, fixtures and tests were ported to the `src/live` types (design.md "Merge with main"). The test edits were the type and shape changes only, with no change to what each test checks, except `revealCorrect`, which now names the engine's option ID.
- `FeedbackPanel` moved from STUBBED to BUILT, and its stub was deleted. Contract counts are 19 and 26.
- Baselines refreshed: `learn-{light,dark}-{phone,tablet}`, `gallery-{light,dark}-phone`. The only change is the example tree in the D97 look (checked by the region that differed).
- Checks: `npm test` (988 passed), typecheck, lint, build, `npm run test:visual` (30 passed), `openspec validate --all` (30 passed).
