# Proposal: revamp-readiness

Owner: Dev B (lane B, D121). Capability: `ui-readiness`.

## Open questions

No question blocks the work. Each has a recommendation, the specs follow it, and it is isolated in a prop, one file or one rule (D18). Decision numbers start at D138: main uses D1 to D124, and the three revamp changes propose D125 to D137, which are not yet recorded.

1. **Folder and the files outside it (proposed D138).** The brief says "Only `src/ui/learn/**`". As with `revamp-progress-and-hub` (D132, merged in #22), these are their own components.
   - **Recommendation, assumed:** build them in `src/ui/readiness/**`.
   - The contract test fails once a real component has a stubbed name, so the change also has to:
     - edit `src/ui/contracts.ts`: move OutcomeStatusTable, ConfidenceFlags, LectureQuestionsList and ExportActions to BUILT, with widened props;
     - delete their four stubs and their index lines;
     - change the contract-test counts to 29 built and 16 stubbed;
     - add one line to `src/gallery/Gallery.tsx`.
   - **Please confirm at the skim.**
2. **Seven objectives, not nine; LO7 is the optional one (ID 5.1, D113 supersedes D4 and D8).** The brief, D4, D8 and frame 1o say LO1 to LO9, with LO8 (deletion) optional. ID 5.1 (source 0, D92) has LO1 to LO7, and LO7 (leaf deletion, C7) is the optional one. D113, the lesson-c9 spec and `c9.json` (`optionalObjectives: ["LO7"]`) already follow the ID.
   **Settled by the ID:** the components take whatever rows they are given. The fixtures and scenarios use LO1 to LO7, with LO7 optional. Read the brief's "LO8 never blocks Ready" as "LO7".
3. **Ready or Revise, or the three mastery states (D8, D113, frame 1o).** The design draws Secure, Developing and Not yet; D8 said show Ready or Revise. D113 supersedes D8: C9's `readyRule` gives Ready or Revise only, and since D116 nothing stores the three states.
   - **Recommendation (proposed D139):** the status shown is Ready or Revise, each as a symbol, a word and a border (solid for Ready, dotted for Revise).
   - Each row also takes an optional mastery state. When given, it renders the existing MasteryBadge beside the status as secondary detail, but the wiring will not pass one, because nothing computes it.
   - This keeps the design's badge available without putting a second, uncomputed status in front of the student. If the team later wants the three states, the wiring passes them, and nothing here changes.
4. **What Save produces if the browser blocks downloads (proposed D140).** Save makes a plain-text file (FR-RDY-03, frame 1o conflict "Save as PDF" against a text file) from a Blob, entirely in the browser.
   - **Recommendation:** if the Blob or download step throws, or the page is sandboxed so no download can start, the component shows the same text in a read-only text area with a short instruction from props ("Select the text and copy it"), and announces that in the live region.
   - Copy uses the same fallback when the clipboard is unavailable or refused.
   - A blocked download that throws nothing cannot be detected, so the live message after Save always names the file. The text area is the visible fallback.
   - **"Save as PDF" is dropped:** Print lets the browser save a PDF.
5. **Bloom levels have no source in the live content (ID 5.1).** The JSON has no Bloom level per objective; ID 5.1 has them. LO3 has two levels (Apply and Understand) and LO6 is Evaluate, which OutcomeChip does not style ([OPEN] in `src/ui/base/levels.ts`).
   - **Recommendation, assumed:** each row takes a list of levels, so LO3 shows two chips.
   - A level the chip does not know (Evaluate) shows as its word in a plain outlined tag, never as a coloured chip, until the design adds it. That is one map in `src/ui/readiness/`.
   - Where the words come from at wiring time (`src/content/`, by the content-author, copied from ID 5.1) is a question for the wiring change.
6. **The overall title and "no ranking" (ID 9.3, 10.4).** ID 10.4 requires the overall title at the top of the C9 report (lesson-c9 spec), and the titles are "ranked from S to C". The brief forbids any score, percentage or ranking.
   - **Recommendation (proposed D141):** the headline shows the title's words and its message. It never shows the rank letter, the share or a percentage.
   - The headline follows the given overall result, Ready or Revise. It never works the result out from the rows (question 2).
7. **The change since the last attempt.** The live report has no history per objective. The note ("up from Revise", "first try") is a string prop per row, worked out by a later logic change against the student's own earlier attempt. With no note given, the row shows nothing there rather than an invented note. The note never compares with other students and never shows a percentage.
8. **Printing in the dark theme (proposed D142).** The tokens have no print values. Printing in the dark theme would put light text on white paper, because browsers drop backgrounds. The old `src/ui/readiness.css` print rule also sets body text at 10.5 pt, below the brief's 12 pt minimum, and that file is no longer imported.
   - **Recommendation, assumed:** the `@media print` block in `src/ui/readiness/readiness.css` sets the text colour to `CanvasText` and the background to `Canvas` (CSS system colours, not named or hex colours), and body text to 12 pt. It hides every control and shows status as words only.
   - If the stylelint colour rules reject system colours, the fallback is a print block in `tokens.css`. That is a base change, so it would be raised then, not assumed.
9. **Editing the lecture questions (D91, superseded by D113; frame 1o note 3).** The design makes every question editable and removable.
   - **Recommendation:** each question has an Edit control that opens an inline field, plus Save and Cancel. Remove is offered only where the props say the question is removable. Saving calls `onEdit(id, text)` and removing calls `onRemove(id)`.
   - The component stores nothing. Which questions can be edited (the own question, or also the suggested ones) is the wiring change's choice.
   - **Empty state:** the given text, with no list.
10. **"What to listen for".** The content exists: `c9.json` `c9-s03` `listenFor`, three points. It comes in as a list of strings. No new teaching content.
11. **Composed view (assumed).** ReadinessSummary is the composed screen: headline, table, flags, the listen-for block, the lecture list and the exports. Like HubView, it stays out of `contracts.ts`, because the design-system name is not one of the 45 contract names.
13. **Scope added: wiring (user, 14 Nov, settled).** The user asked for the pages to be wired in this change.
   - `ReadinessReportView` (`src/ui/lesson/c1c9.tsx`), used by C9's report screen and `/readiness`, becomes a thin mapper from `readinessReport` and the learner state onto ReadinessSummary. Its export name and callers stay the same.
   - The unused `src/ui/readiness.css` is deleted.
   - The `lesson-c9` tests that pinned the old list markup ("LO2: Revise" in one list item) are updated to the table, with the same meaning. That is a test-writer edit, flagged.
   - This adds three tasks, for 13 in all. The user asked for one change, so it is not split.
14. **Editing own questions (user, 14 Nov, settled; proposed D143).** The learner state could only add a lecture question.
   - The change adds two session actions: `editOwnQuestion(at, text)` and `removeOwnQuestion(at)`. They act only on own questions (ID `own`), found by their `at` time, under the same storage key with no version change.
   - Suggested questions (from misconceptions) stay read-only.
15. **Bloom levels (user, 14 Nov, settled; proposed D144).** The content-author adds `OBJECTIVE_LEVELS` to `src/content/readiness.ts`, copied word for word from ID 5.1:
   - LO1 Understand;
   - LO2 Apply;
   - LO3 Apply and Understand;
   - LO4 Apply;
   - LO5 Apply;
   - LO6 Evaluate;
   - LO7 Apply.

   **FLAGGED FOR THE USER TO READ.** The new summary labels in the same file are also flagged: table headers, Edit, Remove, Print, Copy, Save, the messages, the fallback instruction and the file name. The headings that already exist in `lessonCopy.c9` are reused.

12. **Requirement IDs.** From the screen spec (1o) and existing specs: FR-RDY-01 (status per outcome), FR-RDY-02 (lecture list), FR-RDY-03 (print, save, copy), FR-MOT-04 (no score wording), NFR-05 (nothing leaves the device), FR-VIS-10 and NFR-02 (keyboard, accessibility).
    - [OPEN] No FR-ASM ID applies that the screen spec or the existing specs name; check the SE document.
    - The summary reports LO1 to LO7 but teaches none.

## Why

C9 ends the primer, so its summary is what the student takes to the lecture (ID 7.2 C9, ID 10.4). Today:
- the summary is one view in `src/ui/lesson/c1c9.tsx` that reads storage and content itself;
- it is a table that does not stack on a phone, and its print rule is in an unused stylesheet;
- the four designed components of frame 1o are stubs.

## What Changes

- **ReadinessSummary:**
  - **Headline:** the overall Ready or Revise result, as given; the title words and message without the rank letter; calm wording for an optional objective.
  - **OutcomeStatusTable:** one row per objective with its name, Bloom level chips, status (symbol, word and border), change note and a Review link to its lesson, plus an "optional" word where given. It is a table from 768 px and stacked cards below.
  - **ConfidenceFlags:** a calm text flag per objective where the student was sure but did not match, with a link to look again.
  - **"What to listen for in the lecture":** the given points.
  - **LectureQuestionsList:** the questions, edited inline; the empty-state text when there are none.
  - **ExportActions:**
    - Print, Copy and Save as a text file, all in the browser, with the text built from the given rows, flags, questions and listen-for points;
    - Copy and Save confirm in a live region, with the text-area fallback;
    - a print stylesheet: black on white, 12 pt body, words not colour, no controls.
- **Contracts:** four stubs become built (29 built and 16 stubbed).
- Every word comes in as a prop.
- **Wiring (question 13).** C9's report screen and `/readiness` render ReadinessSummary from the report. Own questions can be edited and removed (question 14). Bloom levels and labels come from `src/content/readiness.ts` (question 15). The old report list and the unused stylesheet are removed.

## Out of scope

- Working out readiness, the return-once logic, the change notes and the flags.
- The C9 questions, the own-question screen and the certificate.
- Storage and the event log.
- All wording.
- Change notes per objective: there is no run history yet, so no note is shown (question 7).

## Capabilities

### New Capabilities

- `ui-readiness`: the presentational components of the readiness summary (frame 1o): headline, objective table, confidence flags, listen-for points, lecture-question list and exports, with their print view. They render the results and words they are given.

### Modified Capabilities

- `lesson-c9`: the report and `/readiness` render the readiness summary, with export and editable own questions.
- `learner-session`: own lecture questions can be edited and removed.

## Impact

- **New:** `src/ui/readiness/` with:
  - ReadinessSummary, OutcomeStatusTable, ConfidenceFlags, LectureQuestionsList, ListenFor and ExportActions;
  - `exportText.ts`, a pure formatter;
  - `readiness.css` and ReadinessGallery.
- **Changed:** `src/ui/contracts.ts`, four stubs and `src/ui/stubs/index.ts`, `tests/ui/contracts.test.tsx` counts, and one line in `src/gallery/Gallery.tsx`.
- **Changed for wiring:**
  - `src/ui/lesson/c1c9.tsx` (`ReadinessReportView`, `OwnQuestion`'s list on `/readiness`);
  - `src/pages/Readiness.tsx`;
  - `src/state/learnerReducer.ts` and `LearnerContext.tsx` (two actions);
  - new `src/content/readiness.ts` (content-author);
  - the report tests in `tests/ui/lesson-c1-c9.test.tsx`.
- **Deleted:** `src/ui/readiness.css`.
- **Reused unchanged:** OutcomeChip, MasteryBadge, Button, tokens.
- **Browser APIs, all local:** `window.print`, `navigator.clipboard.writeText`, `Blob` and `URL.createObjectURL`.
- No new dependencies, no storage change, no network calls.
