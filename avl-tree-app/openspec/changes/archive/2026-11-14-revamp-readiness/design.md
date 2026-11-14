# Design: revamp-readiness

## Context

See `proposal.md` for the reasons and the open questions; this file covers how. What exists today:

- **The report.** C9's report and `/readiness` render `ReadinessReportView` (`src/ui/lesson/c1c9.tsx`). It reads the learner state and the content, and calls `readinessReport` (`src/live/readiness.ts`). `ReadinessReport` gives rows (`outcome`, `verdict`, `optional`, `flagged`, `lesson`), `overall`, `share`, `title`, `lectureQuestions`, `listenFor` and `done`. It gives no Bloom levels, change notes or mastery.
- **The stubs.** OutcomeStatusTable, ConfidenceFlags, LectureQuestionsList and ExportActions are stubs with narrow props. OutcomeStatusTable's takes the whole `ReadinessReport`, which would tie a lane-B component to `src/live`.
- **Old print rules.** `src/ui/readiness.css` holds them (10.5 pt, unused). `lesson.css` holds the certificate's print rule, which is unchanged.
- **Lint.** It allows `pt` font sizes only inside `@media print` (`avl/print-points-only`), and forbids hex, named and `rgb()` colours outside `tokens.css`.

## Goals / Non-Goals

**Goals:**
- Frame 1o can be drawn from props alone, so the wiring only maps `ReadinessReport` and the learner state onto props.
- The export text is one pure function that tests can read directly.

**Non-Goals:**
- Any change to `src/live/` or `src/live_content/`.
- Change notes (no run history yet).

## Decisions

1. **Row shape (`src/ui/readiness/types.ts`):** `{ id, name, levels: readonly { level: string; word: string }[], status: 'ready' | 'revise', note?, mastery?, optional?, review: { href } }`. Status words and symbols come in one `labels` object per component.
   - *Alternative:* take `ReadinessReport` as the stub did. Rejected, because the component would then import `src/live` and couldn't be tested from fixtures alone.
2. **Levels:** when `level` is one of `CHIP_LEVELS`, the tag is the existing OutcomeChip as a static tag; otherwise it is a plain outlined `span.readiness-level` with the word. This is one function, `levelTag`. When the design adds analyse and evaluate, only the chip changes.
3. **One table markup, laid out two ways by CSS.** The table is a real `<table>` with a caption, row headers and column headers. Below 768 px, CSS turns each `tr` into a card (`display: block` / `grid`), hides the `thead` visually, and adds the column label before each cell from a `data-label` attribute, filled from props by `attr()` in `::before`.
   - *Alternative:* two markups, cards and a table. Rejected, because each would need its own keyboard and axe pass.
   - *Alternative:* a list of cards at every width. Rejected, because frame 1o draws a table and a table reads better with a screen reader at desktop widths.
4. **Status cell:** `<span data-status>`, holding a text symbol in an `aria-hidden` span plus the word.
   - Ready: solid 2 px border, ✓ (symbols from props).
   - Revise: dotted 2 px border, ↻ (symbols from props).

   The colour is neutral ink plus the action tint for Ready, never red (D27). Mastery is beside it, never inside the border.
5. **Headline.** `<section>` with `h1` (the given heading for the overall result), the given line, then the title words and message in a `p`. The `title` prop is `{ words, message }`, so a rank letter cannot be passed at all. The Title-without-rank scenario passes the live `Title` object through the wiring mapper type, which drops `rank` and `minShare`.
6. **The export text, `buildExportText(summary, labels): string`.** A pure function in `exportText.ts`:
   - one line per row (`LO2 Name: Ready (note)`);
   - then the flags, the questions as a numbered list, and the listen-for points;
   - headings from props;
   - plain `\n` line endings.
7. **ExportActions.** It takes `{ text, fileName, labels, onPrint? }` and holds the live-region message and the fallback state.
   - **Copy:** `navigator.clipboard?.writeText(text)`. On success, announce `labels.copied`. On rejection or no clipboard, show the fallback and announce `labels.fallback`.
   - **Save:** `new Blob([text], { type: 'text/plain;charset=utf-8' })`, `URL.createObjectURL`, a temporary `<a download>` click, then `revokeObjectURL`. Any throw shows the fallback. Success announces `labels.saved`.
   - **Print:** `onPrint ?? window.print`.
   - **The fallback** is a read-only `<textarea>` with its label, selected on show; focus moves to it.
   - The live region is always mounted (`role="status"`) and empty until an action.
   - The props have an optional `disabled` and `disabledReason`, because C9 waits for the own question (D113). They use Button's existing `disabledReason`.
8. **LectureQuestionsList.**
   - Each question: `{ id, text, editable?, removable? }`.
   - Edit swaps the text for a labelled `<textarea>` (label from props, including the question number) with Save and Cancel. On Save or Cancel, focus returns to that item's Edit button through a ref map.
   - One item is edited at a time.
   - Empty: `<p>` with the given empty text.
9. **The print block** in `readiness.css`:
   - `@page { margin: 15mm }`;
   - `.readiness-summary { color: CanvasText; background: Canvas; font-size: 12pt }`;
   - hide `button, textarea, .readiness-actions, .readiness-fallback`;
   - status borders in `CanvasText`;
   - links print as plain text.
   - If stylelint rejects `CanvasText`, stop and raise the tokens print block (proposal question 8). Don't work around the lint rule.
10. **Contracts:** widen the four stub interfaces to `ComponentProps<typeof X>` re-exports from `src/ui/readiness/`, move them to BUILT (29 and 16), and delete the stubs. ReadinessSummary and ListenFor stay out (proposal question 11).
11. **Gallery:** `ReadinessGallery.tsx` with every state:
    - overall Ready with LO7 Revise;
    - overall Revise;
    - flags and no flags;
    - questions, one being edited, and empty;
    - the fallback shown.

    It is mounted by one line in `src/gallery/Gallery.tsx`. `tests/visual/readiness.spec.ts` checks the widths, the card layout, greyscale and print emulation (`page.emulateMedia({ media: 'print' })`), and takes screenshots.

12. **Heading level.** ReadinessSummary takes `headingLevel` (1, 2 or 3, default 2). The headline uses it, and its sections use the next level down. In the lesson player, C9's report screen already has an `h1`, so it passes 2. `/readiness` keeps its own `h1` and passes 2.
13. **Wiring (proposal question 13).** `ReadinessReportView` keeps its name and callers (`blocks.tsx`, `Readiness.tsx`) and becomes a mapper. It reads the learner state, the content, `readinessReport` and `ownQuestions`, then maps them:
    - **rows:** the outcome ID; the statement from `OUTCOMES`; levels from `OBJECTIVE_LEVELS`; `verdict` as the status; `optional`; review to `paths.module(lesson)`, labelled `lessonCopy.c9.see(...)`;
    - **flags:** the flagged rows, with `lessonCopy.c9.flag` and a link to the lesson;
    - **headline:** `lessonCopy.c9.overall(word)`, the title's words and message (the rank and share are dropped);
    - **questions:** the report's suggested questions as read-only, then the own questions (stored with ID `own`) with `editable` and `removable`, keyed by `at`;
    - **listen for:** the report's points;
    - **export:** labels from `src/content/readiness.ts`.

    The "answer first" note stays above the summary while `done` is false. `OwnQuestion` gets `showList` (default true); `/readiness` passes false, because the summary already lists own questions.
14. **Session actions (proposal question 14).** Two new reducer actions:
    - `lecture-question-edited { at, text }` maps over the stored questions and replaces the text where `questionId === OWN_LECTURE_QUESTION && at === action.at`;
    - `lecture-question-removed { at }` filters that one out.

    The reducer itself trims and caps the text as `addOwnQuestion` does, and ignores a blank edit, so the rule lives in one place (refined during the build). Saving follows the existing persistence effect, so there is no storage change.
15. **Content (proposal question 15).** The content-author writes `src/content/readiness.ts`:
    - `OBJECTIVE_LEVELS` (an objective ID mapped to a list of `{ level, word }`, from ID 5.1);
    - `readinessCopy`: the column headers, status symbols, level words, Edit, Remove, Save, Cancel and field label, the flags heading, the export labels, messages, fallback instruction and file name, and the empty text (reusing `lessonCopy.c9.noneYet`).

    Everything new is flagged in a header comment.

## Risks / Trade-offs

- [`attr()` in `::before` reads a data attribute] → The label is also in the column header for assistive technology, and the `::before` text is `aria-hidden` by being generated content on a cell that already has a header. The a11y-checker listens to one card in task 4.1.
- [A download blocked silently by the browser cannot be detected] → The live message names the file, and the fallback is one Copy away. This is recorded in proposal question 4.
- [`CanvasText` and `Canvas` may be rejected by lint] → design decision 9: raise it, do not bypass it.
- [Two summary renderers exist until wiring] → The old `ReadinessReportView` stays in use by the pages; the new one is only in the gallery. The wiring change replaces it.
- [The Bloom level words have no content source yet] → Fixture words only here. The wiring change asks the content-author for `src/content/` entries copied from ID 5.1 (flagged).
- [Own questions keyed by `at` could collide if two are added in the same millisecond] → `addOwnQuestion` runs once per click. If a collision happens, an edit changes both, which is visible and harmless. A proper ID is a storage change for later.
- [The lesson-c9 tests pinned the old markup] → They are updated to the table, keeping each assertion's meaning (proposal question 13). The test-writer edit is flagged in `review.md`.
