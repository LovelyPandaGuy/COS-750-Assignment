# Design

## Context

See proposal.md (Why). Today:

- `LessonSidebar` already gets the right data: `App.tsx` passes `viewing={id}` on every lesson route, and each item has `page: id === viewing`. `LessonLink` sets `aria-current="page"` for it, otherwise `"step"` for `state === 'current'`.
- The look comes from `progress.css`: `[data-state='current']` has a 4px `--action-primary` border and `--action-primary-tint` background. `sidebar.css` adds only bold and underline to `[aria-current='page'] .progress-title`.
- `learnerReducer` `module-completed` moves `currentModule` one step only when the completed module is the current one.

## Goals / Non-Goals

**Goals:** one strongly highlighted item in the sidebar, always the viewed lesson; a current module that is always the first gap in C1 to C9.

**Non-Goals:** changing `LessonLink`, `LessonMenu` or `progress.css` (shared with the gallery and ProgressMap); changing ARIA; a storage migration.

## Decisions

1. **Style override in `sidebar.css`, scoped to `.lesson-sidebar`.** The `[aria-current='page']` rule takes the strong border and tint; `[data-state='current']:not([aria-current='page'])` drops to a 2px solid `--action-primary` border on `--bg-page`. Alternative: a new `data-viewing` attribute or changing `progress.css`. Rejected: `aria-current` already carries the meaning, and `progress.css` is shared with the gallery components, whose contracts should not move. The `LessonMenu` panel is inside `.lesson-sidebar`, so phones get the same look.
2. **Wording in one place.** `shellCopy.sidebar.words.current` becomes "Up next". The symbol ▶ stays. `screens.ts` already uses "Up next", so the vocabulary matches. Only that one value in `shell.ts` is edited; the uncommitted `appTitle` line is left for the user.
3. **Current module = first not-completed lesson.** In `module-completed`: after adding the module, `currentModule = MODULE_IDS.find((id) => !completed.includes(id)) ?? learner.currentModule`. Alternative: keep "advance from the completed one" and also advance past completed lessons. Rejected: it still leaves C1 stuck when C2 to C4 are done first. The new rule can move the current module back (C5 with C2 missing becomes C3); that state cannot arise from the app's own completions under either rule except from hand-made fixtures, and pointing at the first gap is the intent.

## Risks / Trade-offs

- [The existing test "leaves currentModule alone when it was another module" contradicts the new rule] → the test-writer replaces it with the "Current lesson moves back to the first gap" scenario; the implementer does not edit it.
- [Stored learners with a stale `currentModule`] → corrected on their next completion; no migration (cheap to change later in one place, D18).
- [Two primary-coloured borders (viewed thick, current thin)] → they differ in width and fill as well as the word and symbol, so not colour alone; greyscale check in the quality bar.
