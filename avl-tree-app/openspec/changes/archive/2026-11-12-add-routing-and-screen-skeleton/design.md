# Design

## Context

See proposal.md for why and the assumptions. Observed on `main`: `src/App.tsx` has `HashRouter` and an exported `AppRoutes` with `/`, `/module/:moduleId` and a catch-all to `/`; a private `Screen` wrapper puts each route in `AppShell` with the saved or not-saved pill; `Start.tsx` and `ResumeCard` navigate to `/module/<id>` with `state: { focusHeading: true }`; `ModulePlaceholder` redirects unknown IDs to Start and focuses its heading when that state is set. `LearnerContext` gives `learner.currentModule`, `learner.completedModules` and `persistent`. `src/content/modules.ts` has the D1 titles and `moduleLabel`. Tests render `AppRoutes` in a `MemoryRouter` with `tests/ui/learner-fixtures.tsx`. `TopBar` actions are buttons only.

## Goals / Non-Goals

**Goals:**
- One place that knows the paths, module IDs and activities, so later changes add a screen without touching navigation.
- Behaviour every screen shares (title, focus, breadcrumb, actions) lives in one wrapper, not in each page.
- Skeletons small enough that replacing one with the real screen deletes the skeleton.

**Non-Goals:**
- Anything in the proposal's "Out of scope"; in particular no new state, no storage fields and no engine imports.

## Decisions

1. **Keep `HashRouter` and the `Routes` element tree.** Alternative: `createHashRouter` with route objects and loaders. Rejected: nothing needs loaders yet, and the existing tests and `AppRoutes` export would change for no gain.

2. **`src/routes.ts` is the single source** (as `conventions.ts` is for height). It exports `paths` (builders: `start()`, `hub()`, `module(id)`, `activity(id, activity)`, `warmUpResult()`, `sandbox()`, `readiness()`), `parseModuleId`, `parseActivity`, `ACTIVITIES_BY_MODULE` and `ACTIVITY_ORDER`. `MODULE_IDS` stays in `state/learnerState.ts` (it validates stored data) and is re-used, not copied. Route patterns for `<Route path>` come from the same file as constants. A source scan test enforces "no hand-written paths"; `Start.tsx` and `ResumeCard` callers move to the builders.

3. **Activity screens are one component, `Activity`, keyed by params.** It reads `:moduleId` and `:activity`, redirects when the module has no such activity, and renders a `SkeletonScreen`. The warm-up check, result and refresher get their own thin pages (`WarmUpCheck`, `WarmUpResult`, refresher through `Activity`) because C1's check is the diagnostic, which will grow into its own screen. `/module/C1/check/result` is an explicit route placed before the generic one; React Router ranks the longer static path higher anyway.

4. **The `Screen` wrapper takes a description, not the page deciding.** Each route supplies `{ heading, breadcrumb, actions }` from a small function of params (in `routes.ts`'s neighbour, `src/content/screens.ts` holds the wording). `Screen` renders `AppShell` and calls `useScreen(heading)`, which sets `document.title` and focuses the `h1`. Alternative: each page renders its own `AppShell`. Rejected: that is how titles and focus drift apart.

5. **Focus on navigation without a state flag.** `useScreen` focuses the heading when `location.key !== 'default'` (react-router gives the first entry the key `default`). This covers Start, Resume, hub links, back and forward, and removes the `focusHeading` state from `Start.tsx` and the module screen. The heading is found with `main h1` and given `tabIndex={-1}` by `SkeletonScreen` and the real pages. Risk: back and forward also move focus to the heading; that is acceptable and matches how a new page loads.

6. **TopBar actions as links.** `TopBarAction` becomes `{ label, onClick } | { label, href }`. `Screen` builds each `href` with `useHref(path)`, which gives `#/sandbox` under `HashRouter`, so `TopBar` stays router-free and the shell tests need no router. Alternative: buttons that call `navigate`. Rejected: a button that navigates breaks open-in-new-tab and screen-reader expectations; the wireframes draw them as plain actions, not as a pattern we must keep.

7. **`ProgressMap` status is a pure function** `mapStatuses(current, completed)` returning `done | current | next | later` per module. `next` is the first module after the current one; a module before the current one that is not completed reads `later` (the map shows only what the state says; a skipped module is an edge for the path-mode change). The component renders a `nav` with an `ol`, each item a link; `data-status` drives the border (solid, thick, dashed) in the stylesheet, and the symbol and word are text. Wording and symbols come from `content/screens.ts`.

8. **`ActivityList` is shared** by the hub's current-module card and the module screen, so the default order and the "1 of 3" labels exist once. Items are links; there are no completion marks because activity progress is not stored.

9. **Skeleton wording** is one "coming later" line per screen kind in `content/screens.ts`, flagged. `SkeletonScreen` renders the heading, the line and the back link, and is the only component the skeleton pages share.

10. **Retiring `ModulePlaceholder`.** `Module.tsx` replaces it with the same unknown-ID redirect, the same heading text (`moduleLabel`) and the added activity list and back link. Existing start-screen tests keep passing because heading and redirect are unchanged; tests that depend on `focusHeading` state are rewritten against "focus follows in-app navigation".

## Risks / Trade-offs

- **Focus on every in-app navigation** can surprise a keyboard user going back; the alternative (only forward moves) needs history inspection the router does not expose cleanly.
- **The activity table is a guess** (proposal, question 3); a wrong table only mislabels skeleton links, and the module content change replaces it.
- **No real screen exists to test deep links into state** (for example the current question of the check). Route params for in-module position are deliberately not designed here.
- **`Lecture questions` links to `/readiness`** though the list has no content yet; the link is a promise the readiness change keeps.
- **Hash URLs** (`#/path`) are less tidy than history URLs but need no server rewrite, which suits a static, no-backend app.
