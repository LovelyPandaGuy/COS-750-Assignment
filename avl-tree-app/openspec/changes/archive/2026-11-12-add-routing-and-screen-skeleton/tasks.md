# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/routes.test.ts` and `tests/ui/routing.test.tsx` from every scenario under "app-routing" (route table incl. back and forward, builders and the no-hand-written-paths source scan, redirects, shell and pill with throwing storage, breadcrumbs, actions per screen as links, titles, focus on in-app moves and not on first load, axe on every route), plus the TopBar link scenario in `tests/ui/shell.test.tsx`; name them after FR-LRN-03, FR-LRN-04, FR-VIS-08 or NFR-02; verify they fail only because the new modules and routes do not exist.
- [x] 1.2 Write `tests/ui/module-hub.test.tsx` from every scenario under "module-hub" and "screen-skeletons" (map statuses and a pure status function, hub contents, Continue, one primary action, module screens C1 to C9, activities in default order, back links, refresher link on the result, state unchanged after visiting everything, wording scans, targets, axe); verify they fail only because the components do not exist and that all existing tests still pass.

## 2. Routing

- [x] 2.1 Add `src/routes.ts` (builders, parsers, `ACTIVITIES_BY_MODULE`, route patterns) and `src/content/screens.ts` (all new wording, flagged for the user to read); move `Start.tsx` and its callers to the builders; verify `tests/routes.test.ts` passes.
- [x] 2.2 Add the optional `href` action to `TopBar`, the `useScreen` hook (title, focus when `location.key !== 'default'`) and the description-driven `Screen` wrapper in `src/App.tsx` with the full route table and redirects; verify `tests/ui/routing.test.tsx` and the shell tests pass.

## 3. Screens

- [x] 3.1 Add `ProgressMap`, `ActivityList`, `Hub` and `Module` (replacing `ModulePlaceholder`) with their stylesheet, tokens only; verify the hub and module parts of `tests/ui/module-hub.test.tsx` pass.
- [x] 3.2 Add `SkeletonScreen` and the pages `WarmUpCheck`, `WarmUpResult`, `Activity`, `Sandbox` and `Readiness`, wired into the route table; verify the whole `tests/ui/module-hub.test.tsx` passes.

## 4. Review

- [ ] 4.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; run `npm run dev` and click through every route; verify all pass, with no new `[OPEN]` markers and no edits to `src/engine/`, `src/ui/tree/`, `src/practice/` or `src/state/`.
- [ ] 4.2 Run the `reviewer` (fresh context) and `a11y-checker` subagents; then by hand: keyboard-only walk through all screens, focus after each move, greyscale screenshot of the progress map, and a 360 px width run; verify the reports pass or findings are resolved.

## Workflow follow-up

- Read the new wording in `src/content/screens.ts` and answer the six assumptions in the proposal (especially 3, the activity table, and 5, where Lecture questions goes).
- Next changes, one per screen, each replacing one skeleton: the warm-up check and result (FR-DIA), then Explore with step controls and the predict and do-it-yourself parts, Check and scaffolds, the sandbox, and readiness with lecture questions (which needs the storage field).
- The user merges and archives; agents do not.
