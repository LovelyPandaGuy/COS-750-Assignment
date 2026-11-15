# Tasks

Roles as in `.claude/CLAUDE.md`. No task commits; the user commits.

## 1. Red tests

- [x] 1.1 (test-writer) Write `tests/ui/lesson-sidebar.test.tsx` for every `lesson-sidebar` scenario: nine links in order on every route, opening a lesson, states in words, `aria-current` only on the viewed lesson, the 768 px sticky grid rule and the phone Lessons button, order and skip link, axe closed and open, 44 px links. Verify they fail only because the sidebar does not exist (D155, ID 8.2).
- [x] 1.2 (test-writer) Update the tests for the modified requirements: Settings button text and name, no pill with working and blocked storage (shell, routing, start screen), landmarks order, the objectives block without points on `c1-s02`, no lesson outline on C1, and the sandbox container rule in `tests/ui/sandbox-layout.test.tsx`. Delete the lesson-outline tests with the capability, keeping any Next and Back assertions in `lesson-player` tests. Verify the changed tests fail and the others still pass.

## 2. Build

- [x] 2.1 (content-author) In `src/content/shell.ts`: "Settings", "Settings: display and read-aloud", "Lessons" and the three state words. Remove `savedPill` and `notSavedPill` from `src/content/start.ts` and the outline wording from `src/content/lesson.ts` once nothing uses them. Verify `npm run typecheck` passes.
- [x] 2.2 (implementer) Build `LessonSidebar` and `sidebar.css` (design 1 to 3), add the `sidebar` slot and `.app-body` to `AppShell`, the optional `current` flag to `LessonItem` and `LessonLink`, and pass the sidebar from `Screen` on every route. Verify every task 1.1 test passes.
- [x] 2.3 (implementer) Remove the status pill (`TopBar` prop, CSS, `Screen`), rename the Aa button through its copy, remove `LessonOutline`, `outline.ts` and their CSS from the lesson player, and drop `points` from the objectives block (design 4 to 6). Verify the task 1.2 shell, routing, start-screen, C1 and lesson tests pass.
- [x] 2.4 (implementer) Move the sandbox's two-column rules to a container query (design 7). Verify the sandbox tests pass, and `npm test` and `npm run lint` are green.

## 3. Records and review

- [x] 3.1 Add D155 to D158 to `.claude/docs/decisions.md`, and mark D154 superseded by D155 and D140's breakpoint amended by D156. Note the sidebar and the Settings button in `.claude/docs/design/INDEX.md`. Verify `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all` pass.
- [ ] 3.2 Run the reviewer and a11y-checker roles. Then by hand: the sidebar at 360, 768 and 1366 px on Start, C1, a lesson, the sandbox and the readiness page; it stays in view while scrolling a long lesson; keyboard only (skip link, sidebar, Settings); greyscale check of the states. Verify the reports pass or findings are resolved.

## Workflow follow-up

- The user commits, merges and archives; agents do not.
