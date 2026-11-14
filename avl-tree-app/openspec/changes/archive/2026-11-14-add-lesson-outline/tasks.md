# Tasks

Roles as in `.claude/CLAUDE.md`. No task commits; the user commits. Apply after `live-c1-and-c9`.

## 1. Red tests

- [x] 1.1 (test-writer) Write `tests/ui/lesson-outline.test.tsx` for every `lesson-outline` scenario: grouping in C3 and C6, the marks, moving back, not past an unfinished check, open after the check, focus on the heading, the 390 px and 1366 px layout rules (CSS checks), axe with the outline open and closed, keyboard use. Add a unit test for `outlineOf` and the open rule. Verify they fail only because the outline does not exist (ID 8.2, 8.3).

## 2. Outline

- [x] 2.1 (implementer) Add `outlineOf` and the open rule (design 1), and `goTo` in `LessonPlayer` (design 2), with Next, Back, Skip ahead and the review link moved onto it. Verify the unit tests pass and every existing lesson-player test still passes.
- [x] 2.2 (implementer, content-author for the labels) Add `LessonOutline` and the `.lesson-layout` grid and disclosure (design 3, 4) to every lesson, including the refresher. Verify the task 1.1 UI tests pass.

## 3. Records and review

- [x] 3.1 Add D154 to `.claude/docs/decisions.md` (D117 is taken by the TopBar progress area). Verify `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all` pass.
- [ ] 3.2 Run the reviewer and a11y-checker roles. Then by hand: the outline on a laptop and on a phone at 390 px, keyboard only, and a greyscale check of the marks. Verify the reports pass or findings are resolved.

## Workflow follow-up

- Archive order: `add-live-lesson-content`, `add-live-lesson-questions`, `live-c1-and-c9`, then this change.
- The user commits, merges and archives; agents do not.
