# Tasks

Roles as in `.claude/CLAUDE.md`. No task commits; the user commits. Change 2 of 3 (15 Nov list).

## 1. Red tests

- [x] 1.1 (test-writer) Lesson frame and headings: no position line or phase word on any lesson screen, the objectives screens' single "Learning objectives" heading (C1 to C8), and C1's heading list. Update the existing frame, phase, objectives, C1 and sidebar tests. Verify they fail only because the line and the old headings are still there (D167, D168).
- [x] 1.2 (test-writer) Celebration: confetti on completion, not with the setting off, under reduced motion or on a revisit, gone after 1500 ms, `aria-hidden` and no pointer events; `lessonTitle` (null until finished, each title band, either attempt counts); the summary's title panel and its calm wording. Verify they fail only because the celebration does not exist (D169).

## 2. Build

- [x] 2.1 (content-author) In `src/content/lesson.ts`, add "Your title for this lesson" and remove the position wording once unused. Verify `npm run typecheck` passes.
- [x] 2.2 (implementer) Remove the position line and choose the objectives heading in `LessonPlayer`, and drop the block's `h3` (design 1). Verify task 1.1 passes.
- [x] 2.3 (implementer) Add `lessonTitle`, the summary's title panel, and `Celebration` and `Confetti` mounted in `App` (design 2, 3). Verify task 1.2 passes, and `npm test` and `npm run lint` are green.

## 3. Records and review

- [x] 3.1 Add D167 to D169 to `.claude/docs/decisions.md` (D167 records the user override of ID 8.2; there is no separate conflicts list). Verify `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all` pass.
- [ ] 3.2 Run the reviewer and a11y-checker roles. Then by hand: finish a lesson's check and watch the confetti, turn the setting off and repeat, try reduced motion, and read a C2 to C8 summary title. Verify the reports pass or findings are resolved.
