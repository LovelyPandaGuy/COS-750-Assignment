# Review notes: add-lesson-outline

## Changes to the plan (user, 14 Nov)

- **The breakpoint.** The side column starts at 1366 px, not 960 px. 960 broke D118 (only 768 and 1366 queries are allowed), and the user chose 1366 over 768 so a tablet keeps the full lesson width. The spec scenarios now use 390 and 1366 px. Updated in the proposal, spec, design and tasks.
- **The decision number** is D154, not D117 (D117 is the TopBar progress area).
- **The branch.** Built on `chore/ui-sweep` at the user's request, next to the archive of seven changes and the `ui-quality-sweep` proposal.

## Role crossings

There are no test-writer, implementer, content-author, reviewer or a11y-checker agents in this session, so the main agent played each role.

- **Test-writer:** wrote `tests/ui/lesson-outline.test.tsx`. During the build it changed one step of its own red test: the keyboard test now clicks the focused summary, because jsdom and user-event don't turn Enter on a `<summary>` into a click. Enter on the summary was checked in Chromium instead (below). Nothing else in the test changed.
- **Content-author:** wrote the labels in `src/content/lesson.ts`. **Flagged for the user to read:** "Lesson outline", "Lesson outline (n screens)", "Done", "You are here" and "Not yet open".

## Implementation notes

- **New files:**
  - `src/ui/lesson/outline.ts`: `outlineOf`, `isScreenFinished`, `firstBlockingIndex` and `isOpen`. They are pure and use the same `isFinished`, `diagnosticResult` and `readinessQueue` as the runners.
  - `src/ui/lesson/LessonOutline.tsx`.
  - `src/ui/useMinWidth.ts`: matches media against `BREAKPOINTS.desktop`, so there is no width literal.
- **`LessonPlayer`:**
  - `goTo` replaces `go` for Next, Back, Skip ahead, the review link and the outline;
  - `seen` holds the screens visited;
  - choosing the current screen refocuses its heading, through a counter in the focus effect (the hooks lint forbids reading the ref there).
- **The disclosure's open state is held by React:** the summary's click toggles it, and the native toggle is prevented, because `toggle` events arrive late. The list is rendered only while open, so a closed outline adds no text to the page.
- **The reading width is kept:** at 1366 px, `.app-main:has(> .lesson-layout)` widens by the outline column only (the same pattern as `start.css`), so the lesson keeps its 66ch reading width.

## Checks

- **`npm test`** (1226 passed), **`npm run typecheck`**, **`npm run lint`**, **`npm run build`** and **`openspec validate --all`** (36 items): all pass, after the build fix below.
- **Build fix (user choice, 14 Nov; outside this change's scope, kept separate in the diff).** HEAD (8650e2b) didn't build: 4 type errors and 5 failing contract tests. The tree-editor merge (113549b) had built `KeyboardHelp`, `TreeEditorToolbar` and `EditLog` but left them in `STUBBED`, without importing them in `src/ui/contracts.ts`.
  - `src/ui/contracts.ts`: imports the three types and moves them from `STUBBED` to `BUILT`. `EditLog` is imported as `./editor/EditLog.tsx` because `editor/editLog.ts` has the same name except for case, as `TreeEditor.tsx` already does.
  - `tests/ui/contracts.test.tsx` (**test-writer crossing**): the pinned counts change from 29 and 16 to 32 and 13, with a line added to the test's own history comment. Nothing else changed.
- **Chromium (by hand, scripted), C3 at screen 4:**

  | Check | 390 × 844 | 1366 × 768 |
  |---|---|---|
  | Layout | closed disclosure above the frame | 256 px sticky column beside a 652 px frame |
  | Opening | Enter on the focused summary opens it (13 entries) | the list is always shown |
  | Sideways scroll | none | none |
  | Entry height | at least 44 px | at least 44 px |
  | Enter on "Goal" | shows Goal, focus on its h2 | shows Goal, focus on its h2 |

- **Greyscale:** every mark is a word, the glyph is decorative, and the current entry also has a 2 px border. Nothing depends on colour.
- **Not yet checked:**
  - the dark theme by eye: the app's theme follows its Aa setting, and the screenshot used the OS setting;
  - the independent reviewer and a11y-checker passes (task 3.2). Both are left to fresh-context agents, or to `ui-quality-sweep`'s audit, which covers the outline panel.

## Archived with an open task (14 Nov)

The user ran `/opsx:archive add-lesson-outline` and chose "Sync now, then archive" with task 3.2 open. 3.2 is not ticked: the independent reviewer and a11y-checker passes were not run. They are covered by `ui-quality-sweep`'s audit (groups 2 and 3), which checks the outline panel. The main spec `openspec/specs/lesson-outline` was created from this delta.
