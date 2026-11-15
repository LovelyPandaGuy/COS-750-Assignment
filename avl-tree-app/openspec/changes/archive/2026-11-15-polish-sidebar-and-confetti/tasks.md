# Tasks

Roles as in `.claude/CLAUDE.md`. No task commits; the user commits.

## 1. Red tests

- [x] 1.1 (test-writer) Sidebar: the viewed-lesson rule has no `--accent-highlight` and keeps its thick border and bold underlined title; set the accent scan minimum to two. Celebration, with `react-canvas-confetti` mocked: on completion an `aria-hidden` canvas wrapper with no pointer events appears; fire calls come from both bottom corners (origins x 0 and x 1) with the palette and tree colours and `disableForReducedMotion`; firing stops after 1500 ms; the canvas is gone within 4 s; and nothing happens with the setting off, under reduced motion, or for an earlier completion. Verify they fail only because of the old edge and the CSS pieces (D172, D173).

## 2. Build

- [x] 2.1 (implementer) Remove the edge from `sidebar.css` (design 1). Verify the sidebar tests pass.
- [x] 2.2 (implementer) Add `react-canvas-confetti@2.0.7` with `npm install`, rewrite `Confetti` with the side cannons and token colours, and reduce `confetti.css` to the wrapper (design 2). Verify task 1.1 passes, and `npm test`, `npm run lint` and `npm run build` are green.

## 3. Records and review

- [x] 3.1 Add D172 and D173 to `.claude/docs/decisions.md` and amend D165 and D169. Verify `openspec validate --all` passes.
- [ ] 3.2 Run the reviewer and a11y-checker roles. Then by hand: complete a lesson and watch the cannons in light and dark, with the setting off, and under reduced motion; check the sidebar highlight. Verify the reports pass or findings are resolved.
