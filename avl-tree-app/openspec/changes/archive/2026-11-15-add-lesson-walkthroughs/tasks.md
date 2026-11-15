# Tasks

Roles as in `.claude/CLAUDE.md`. No task commits; the user commits. Change 3 of 3 (15 Nov list). Archive after `revamp-lesson-frame` (both touch `lesson-blocks`, on different requirements).

## 1. Red tests

- [x] 1.1 (test-writer) Walkthrough: every scenario of "How the app works is a walkthrough", meaning captions equal the points in order, the lit part at each step, the mapping length and parts, "▶ here" and the ring, the list on demand, axe, one labelled image, the live caption, and snapping under reduced motion. Verify they fail only because the walkthrough does not exist (D170).
- [x] 1.2 (test-writer) Search frame: the `c2-s06` scenarios on both diagrams (D after two steps on the chain, E after one on the bushy tree, A after stepping back, Z at both ends, nothing at the start), and a C4 search animation. Verify they fail only because no node is framed (D171).

## 2. Build

- [x] 2.1 (content-author) Add `src/content/walkthrough.ts`: the `c1-s03` mapping, "Show all as a list", "▶ here" and the image's name. Verify `npm run typecheck` passes.
- [x] 2.2 (implementer, then ui-polisher) Build `AppWalkthrough` and `walkthrough.css`, and use them in the info block when a mapping exists (design 1). Verify task 1.1 passes.
- [x] 2.3 (implementer) Pass the search `highlightKey` from `LessonAnimation` to its tree (design 2). Verify task 1.2 passes, and `npm test` and `npm run lint` are green.

## 3. Records and review

- [x] 3.1 Add D170 and D171 to `.claude/docs/decisions.md`. Verify `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all` pass.
- [ ] 3.2 Run the reviewer and a11y-checker roles. Then by hand: play "How the app works" with Play and with Step, open the list, try reduced motion; step both diagrams on C2 screen 6. Verify the reports pass or findings are resolved.
