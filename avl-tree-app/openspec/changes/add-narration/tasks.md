# Tasks

Scope:
- `src/ui/narration/**`, `src/content/narration.ts` (content-author) and tests;
- the narration markers in `src/ui/lesson/**`, `src/ui/learn/**` and `src/ui/tree/TreeView.tsx`;
- `src/state/storage.ts` (`parseSettings`), `src/ui/DisplaySettings.tsx` and `src/App.tsx` (the provider).

No `src/live/` or `src/live_content/` change.

## 1. Red tests (test-writer)

- [x] 1.1 Write `tests/ui/narration/engine.test.ts`: `pickVoice` (on-device only, prefers English, null with only remote voices); `collectNarration` (document order, nested markers once, `hidden` and `aria-hidden` skipped, `data-narrate-text` wins); splitting long parts at sentence ends. Name the tests after NFR-05 and D146.
- [x] 1.2 Write `tests/ui/narration/controls.test.tsx` with a fake engine:
  - shown only when enabled;
  - Read aloud, then Pause and Resume, then Stop, with the labels in words;
  - stop when the page is hidden and when the setting is turned off;
  - no `fetch` or `XMLHttpRequest`;
  - axe.

  Name the tests after ID 8.1, D148 and NFR-02.
- [x] 1.3 Write `tests/ui/narration/lesson.test.tsx`, routing a lesson with a fake engine:
  - a text screen reads the heading, text and points in order and no button label;
  - a tree screen includes `describeTree`'s words;
  - a closed hint is not read, then is read once opened;
  - an answered question reads the stem, options and feedback;
  - Next cancels speech;
  - no speech before Read aloud;
  - one screen of every block type yields at least one part.

  Update `tests/ui/lesson-c1-c9.test.tsx` "narration comes later" to the display-settings scenarios: turned on and kept, unavailable with the note, a damaged value. This edit is flagged in `review.md`.
- [x] 1.4 Write `tests/visual/narration.spec.ts`: the gallery section at 390, 768 and 1366, light and dark, with no sideways scroll, 44 px targets and screenshots.

  Verify that `npm test` fails only in the new and changed tests, and `npm run test:visual` only in the new file. Then ask the user before committing the red tests.

## 2. Build (implementer; content-author for 2.1)

- [x] 2.1 Content-author: write `src/content/narration.ts` (design decision 8), flagged in a header comment. Implementer: `parseSettings` keeps a boolean `narration`, and `DisplaySettings` enables the switch when narration is available (design decision 7). Verify that the display-settings tests pass.
- [x] 2.2 Write `engine.ts` (`browserEngine`, `pickVoice`, part splitting) and `collect.ts` (`collectNarration`), as in design decisions 1, 3 and 4. Verify that `engine.test.ts` passes.
- [x] 2.3 Write NarrationProvider and `useNarration`, mount the provider in `App.tsx` with an optional engine, and write NarrationControls (design decisions 2 and 5). Verify that `controls.test.tsx` passes.
- [x] 2.4 Wire `LessonPlayer`: place the control after the `h2`, and stop on a screen change. Add `data-narrate` to the heading, text and points, caption, rule, hint, support, question stem and options, and feedback message. Add `data-narrate` and `data-narrate-text` to `TreeView` (design decisions 3 and 6). Verify that `lesson.test.tsx` and the whole `npm test` suite pass.
- [x] 2.5 Write `NarrationGallery.tsx` and mount it with one line in `src/gallery/Gallery.tsx`. Create the narration baselines, and regenerate only the gallery baselines that grew, confirming that the old region is unchanged. Verify that `npm run lint` and `npm run test:visual` pass.

## 3. Review

- [x] 3.1 Critique and polish (ui-polisher, CSS and layout markup only), against `.claude/docs/design/quality-bar.md` and frame 1f's Read aloud: the control's placement and states at three widths, light and dark, greyscale. Write the findings to `openspec/changes/add-narration/review.md`.
- [ ] 3.2 Full check: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:visual` and `openspec validate add-narration --strict` pass. Then a fresh-context `reviewer` and the `a11y-checker` report pass, or their findings are resolved. They include:
  - a real-browser listen in Chrome, Safari and Firefox;
  - the network tab while reading (no requests);
  - a keyboard-only run;
  - the switch's unavailable state on a device without on-device voices.

  Record the results in `review.md`.

## Workflow follow-up

- After the human skim:
  - record D145 to D148 in `.claude/docs/decisions.md`;
  - update D26 and D115: read-aloud is built, and the switch is enabled where a voice exists;
  - resolve the FR [OPEN] in the SE document.
- **Next change (user, 14 Nov):** screen-reader support, for example `improve-screen-reader-support`. It covers:
  - announcing tree edits and replay steps through the tree's live region;
  - reading and focus order on every screen;
  - the editor's keyboard instructions;
  - a VoiceOver and NVDA pass;
  - how narration and a running screen reader coexist.
- A human merges and runs `/opsx:archive`. Agents do not.
