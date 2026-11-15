# Tasks

## 1. Red tests (test-writer)

- [x] 1.1 `tests/ui/lesson-sidebar.test.tsx`: update "States in words" to "Up next" and add "The viewed lesson is highlighted, not the current one", "Strong highlight follows the page", "Current lesson not filled when elsewhere" and "Highlight moves when another lesson is opened" (lesson-sidebar, D155, D164). Verify: they fail on `main`.
- [x] 1.2 `tests/state/learner-results.test.tsx`: replace "leaves currentModule alone when it was another module" and add "Completed out of order", "Filling the gap skips completed lessons", "Current lesson moves back to the first gap", "Only C7 left", "All lessons done" (lesson-checks, FR-LRN-05). Verify: the new cases fail on `main`, "C3 completes" still passes.
- [x] 1.3 Commit the red tests. Verify: `npm test` shows only the new tests failing.

## 2. Build (implementer)

- [ ] 2.1 `src/state/learnerReducer.ts` `module-completed`: current module = first lesson in `MODULE_IDS` not completed, else unchanged. Verify: 1.2 passes.
- [ ] 2.2 `src/content/shell.ts`: `sidebar.words.current` = "Up next" (that line only; leave the uncommitted `appTitle` edit alone). Verify: "States in words" passes.
- [ ] 2.3 `src/ui/navigation/sidebar.css`: strong highlight on `[aria-current='page']`, 2px border and no tint on `[data-state='current']:not([aria-current='page'])`, tokens only. Verify: 1.1 passes; `npm run lint` (token rule) passes.
- [ ] 2.4 `.claude/docs/decisions.md`: add assumed row D164 ("Up next" wording; current module = first not-completed lesson, C7 included). Verify: row present, D155 notes the wording change.
- [ ] 2.5 Verify: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `openspec validate --all` all pass.

## 3. Polish and review

- [ ] 3.1 ui-polisher: refine the two sidebar states inside the design system until `.claude/docs/design/quality-bar.md` passes (greyscale, colour-vision, three widths, the phone Lessons panel). Verify: quality bar checklist.
- [ ] 3.2 reviewer and a11y-checker on the diff. Verify: pass, or findings resolved.

## Workflow follow-up

- A human merges and runs `/opsx:archive`. Agents do not.
