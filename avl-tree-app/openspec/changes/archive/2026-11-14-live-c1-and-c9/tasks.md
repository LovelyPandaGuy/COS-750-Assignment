# Tasks

Roles as in `.claude/CLAUDE.md`. Nothing under `src/live_content/` or the .docx files is edited. No task commits; the user commits. Apply after `add-live-lesson-questions`.

## 1. Red tests

- [x] 1.1 (test-writer) Write `tests/live/diagnostic.test.ts` and `tests/live/readiness.test.ts` for the C1 route, the re-check selection, the ready rule (return forms, combined questions, LO7 optional), the flags, the lecture questions, the share and the titles. Update `tests/state/*` for storage version 2 (version 1 and 3 reset, attempt ≥ 1, no sub-skill status, no learning path). Verify they fail only because the new code does not exist (ID 7.2, 9.1, 10.4).
- [x] 1.2 (test-writer) Write `tests/ui/lesson-c1.test.tsx`, `tests/ui/lesson-c9.test.tsx` and `tests/ui/display-settings.test.tsx` for every `lesson-c1`, `lesson-c9`, `display-settings`, `route-choice`, `app-routing` and `module-hub` delta scenario. Include axe on every C1 and C9 screen, the certificate name never stored, and 360 px with larger text. Update `tests/ui/routing.test.tsx`, `module-hub.test.tsx`, `start-screen.test.tsx`, `c1-flow.test.tsx` and `prerequisite-note.test.tsx` to the new routes. Verify they fail only because the screens do not exist.

## 2. Rules and storage

- [x] 2.1 (implementer) Add `src/live/diagnostic.ts`, `src/live/readiness.ts` (with `titleFor`) and the C1 prerequisite names in `src/live/outcomes.ts` (ID 7.2). Move to storage version 2 and remove `subSkillStatus` and `diagnostic-skipped` (design 6). Verify the task 1.1 tests pass.

## 3. C1

- [x] 3.1 (implementer, content-author for labels) Add `QuestionSet` (diagnostic and readiness policies), the intro, info and conventions blocks, `RouteResult` and the refresher's re-check. Make `/module/C1` play C1. Verify the `lesson-c1` and `route-choice` tests pass (ID 7.2, 9.1, 9.3).
- [x] 3.2 (implementer) Add the settings model, `SettingsBlock` and the Aa menu switches, with larger text through `tokens.css` (design 5). Verify the `display-settings` tests pass, including 360 px with larger text (ID 10.4, 11.2).

## 4. C9

- [x] 4.1 (implementer) Add the readiness policy of `QuestionSet`, `ReadinessReport` (also on `/readiness`) and `OwnQuestion`. Make `/module/C9` play C9. Verify the `lesson-c9` question, report and own-question tests pass (ID 7.2, 9.2).
- [x] 4.2 (implementer) Add `Certificate` with the print stylesheet (design 4). Verify the certificate tests pass, including the name never stored (ID 10.4).

## 5. Routes

- [x] 5.1 (implementer) Make every module a lesson, keep only the refresher activity, redirect the old C1 and C9 paths, and set the breadcrumbs and TopBar actions (`app-routing`, `module-hub`). Verify the routing, hub, start-screen and prerequisite-note tests pass.

## 6. Removal

- [x] 6.1 (implementer, content-author, test-writer) Move `rotateAt` into `src/engine/rotations.ts`. Then delete the old model in design 7's order, after an import search for each file, together with the tests of the twelve removed capabilities. Verify the reachability check reports no dead source file, no file outside `src/live/` holds lesson or question content, and `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## 7. Records and review

- [x] 7.1 Add D112 to D116 to `.claude/docs/decisions.md`, and mark D6 to D9, D14, D21, D80 to D91 as superseded. Update the CLAUDE.md guardrails (checks, practice, C9, LO numbering LO1 to LO7). Verify `openspec validate --all` passes and there are no new `[OPEN]` markers.
- [ ] 7.2 Run the reviewer and a11y-checker roles. Then by hand: a keyboard-only run through C1 (both routes) and C9 to the certificate, a print preview of the certificate, and a phone run at 360 px with larger text. Verify the reports pass or findings are resolved.

## Workflow follow-up

- Read proposal items 1 to 10, especially 6 (settings) and 7 (old progress replaced once).
- Archive order: `add-live-lesson-content`, `add-live-lesson-questions`, then this change.
- The user commits, merges and archives; agents do not.
