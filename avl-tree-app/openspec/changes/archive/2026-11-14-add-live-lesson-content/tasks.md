# Tasks

Each task names the ID requirement it serves. The roles are those in `.claude/CLAUDE.md`: the test-writer writes only tests, the implementer writes only `src/` outside `src/content/`, and the content-author writes only `src/content/`. Nothing under `src/live_content/` or the .docx files is edited by any task. No task commits; the user commits.

## 1. Red tests

- [x] 1.1 (test-writer) Update every existing test whose expectation depends on the balance-factor sign or case labels to the ID convention: `tests/conventions*.test.ts`, `tests/engine/*`, `tests/ui/tree-*`, `tests/replay/*`, `tests/sandbox/*`, `tests/ui/replay-player.test.tsx`, `tests/ui/sandbox.test.tsx`. Add the `conventions`, `avl-engine` (letter keys, shape notation, insert-sequence, rotation-sequence and leaf-delete traces, captions), `tree-view`, `step-replay` and `pseudocode-panel` delta scenarios. Name each test after its ID section or FR (ID 7.3, 7.4, 11.1, 12.2). Verify they fail only because the code does not exist or still uses left − right, and that every other test still passes.
- [x] 1.2 (test-writer) Write `tests/live/load.test.ts`, `tests/live/validate.test.ts` and `tests/live/cross-check.test.ts` for every `live-content` scenario. The broken-content cases use fixture copies under `tests/fixtures/live/`, never the real files. Include the gate test: the shipped content validates with no problems. Verify they fail only because `src/live/` does not exist (ID 12.1, 12.2).
- [x] 1.3 (test-writer) Write `tests/ui/lesson-player.test.tsx` and `tests/ui/lesson-blocks.test.tsx` for every `lesson-player`, `lesson-blocks`, `module-hub` and `app-routing` scenario, including axe on every C2 to C8 screen and the 360 px check. Mark the C2 to C8 module tests in `tests/modules/` and `tests/ui/c*-module.test.tsx` for retirement in task 9, but do not delete them here. Verify the new tests fail only because the player does not exist (ID 3.2, 8.1 to 8.3, 11).

## 2. Conventions and engine

- [x] 2.1 (implementer) Make `src/engine/conventions.ts` read `src/live_content/conventions.json` (design 4): balance factor right − left, range, heights, case labels, captions and pseudocode. Add `resolveJsonModule` to `tsconfig.app.json`. Widen `Key` to integers or capital letters with `compareKeys` (design 5). Add shape notation. Verify the task 1.1 conventions, key and shape tests pass and the integer property tests pass unchanged (ID 7.3, `conventions.keys`).
- [x] 2.2 (implementer) Add the insert-sequence, rotation-sequence and leaf-deletion traces with `replay()` support for `delete`, take the search line maps from `lineForStep`, and add the caption builder `src/engine/captions.ts` (design 3, 6). Verify the task 1.1 trace and caption tests pass, including captions equal to the `steps` of every C2 to C8 animation (ID 7.2, 7.4, 8.2).

## 3. Live content loader

- [x] 3.1 (implementer) Add `src/live/` with types, the manifest-ordered loader, the validator, `outcomes.ts` (ID 5.1, 5.2, 7.1) and the engine cross-checks (design 1 to 3). Verify every task 1.2 test passes and the shipped content has no problems. If the shipped content does have problems, stop and list them for the user with both values; do not edit the JSON (ID 12).

## 4. Tree view and replay

- [x] 4.1 (implementer) Give `TreeView` the `show` list and the ID 11.1 node states with their non-colour backups, add the four node tokens to `src/ui/tokens.css`, move the replay to the new roles and to caption positions for lessons (sandbox positions unchanged), use the `conventions.json` search listings, and drop the insert outline from `src/content/pseudocode.ts` with the content-author. Verify the task 1.1 tree-view, step-replay and pseudocode-panel tests pass, along with the contrast and style-scan tests (ID 7.4, 8.2, 11.1).

## 5. Lesson player

- [x] 5.1 (implementer, with the content-author for `src/content/lesson.ts`) Build `src/ui/lesson/LessonPlayer.tsx`, `LessonFrame.tsx`, `PendingInteraction.tsx` and the content-error screen. Cover the frame regions, "Lesson n of 9", "Screen n of m", the phase word, the control strip with Replay step, Show the rule, Hint and Skip ahead on demonstration screens only, focus on each screen's h2, and the last screen returning to the path. Verify the task 1.3 `lesson-player` tests pass (ID 3.2, 8.2, 8.3).

## 6. Content blocks

- [x] 6.1 (implementer) Build `src/ui/lesson/blocks/`: objectives, rule (with the case chart), diagram (with comparison), worked example (step-by-step reveal, post-order highlight, hint), pseudocode, and summary with the objectives recap. Verify the task 1.3 tests for these blocks pass (ID 3.2, 7.3, 8.1).
- [x] 6.2 (implementer) Build the animation block. It plays all five operations with caption positions, the step counter, the side-by-side comparison, role steps, the in-order check, the lit pseudocode line and the "What changed?" prompt. Verify the task 1.3 animation tests pass and every C2 to C8 animation reaches its `result` (ID 7.2, 8.1, 8.2).

## 7. Routes and titles

- [x] 7.1 (implementer) Route `/module/C2` to `/module/C8` to the lesson player and redirect their old activity paths. Keep the C1 and C9 module screens and activities. Replace `MODULE_TITLES` with lesson-file titles in the hub, resume card and breadcrumbs. Verify the task 1.3 `module-hub` and `app-routing` tests pass, and the existing start-screen, hub, routing and shell tests pass (ID 7.1, 8.3).

## 8. Remove the mock lesson content

- [x] 8.1 (implementer and content-author) Delete the files design 10 lists, after an import search shows nothing else uses each one. Retire the C2 to C8 module tests marked in task 1.3, with the test-writer. Verify no source file outside `src/live/` and `src/engine/conventions.ts` imports `src/live_content/`, the "no mock lesson content" scan passes, and `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` all pass (user request 13 Nov).

## 9. Decisions and review

- [x] 9.1 Add D92 to D102 (design) to `.claude/docs/decisions.md`. Update `openspec/config.yaml` `context` and `.claude/CLAUDE.md` "Sources of truth" and "Conventions" to the ID documents and bf = h(right) − h(left). Verify `openspec validate --all` passes and there are no new `[OPEN]` markers.
- [ ] 9.2 Run the reviewer and a11y-checker roles over the diff. Then check by hand: a keyboard-only run through C3 and C5, a greyscale screenshot, colour-vision emulation (ID 13, D25 procedure), and a touch run at 360 px. Verify the reports pass or their findings are resolved.

## Workflow follow-up

- Read proposal items 1 to 12 and the UI labels in `src/content/lesson.ts` (flagged wording).
- Apply `add-live-lesson-questions` before archiving this change (proposal item 9).
- The user commits, merges and archives; agents do not.
