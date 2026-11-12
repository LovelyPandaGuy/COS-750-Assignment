# Proposal

## Open questions

No `[OPEN]` item blocks the specs. Each assumption below is one constant or one wording line, so a different answer changes one place. Please read them before `/opsx:apply`.

1. **Assumed, not blocking: what is already built (D1, SE §2.3).** Routing is not empty any more: `main` already has `HashRouter`, a Start screen (`/`) and a module placeholder (`/module/:moduleId`), from `add-learner-storage-ui`. This change keeps `HashRouter` (static hosting, no server, deep-linkable modules per SE §2.3) and extends the route table; it does not replace it.
2. **Assumed, not blocking: wireframe units become D1 modules (D1, design INDEX item 2).** The wireframes use U0 to U5 and a "Warm-up check" screen; D1 settles C1 to C9. The hub and progress map show the nine C modules with their D1 titles, in the ID's order, with C7 marked optional (D4, ID). The Warm-up check is C1's readiness check (D6) and the BST refresher is C1's conditional part (SE FR-LRN-01, FR-DIA-04), so both live under `/module/C1/...`. The U to C mapping in the wireframes stays unresolved in the design; nothing here depends on it.
3. **Assumed, not blocking: which activities each module has (FR-LRN-05, D15).** The ID lists activities per module unevenly. The skeleton uses one table: C1 has the readiness check and the BST refresher; C2 to C8 have Explore, Worked example and Check; C9 has its check. It is a constant in `src/routes.ts`, and the module content change replaces it with the real structure. The content wording (labels, placeholder line, browser title) is new and flagged for you to read.
4. **Assumed, not blocking: progress map only on the hub (FR-LRN-03).** FR-LRN-03 says a progress map "on every learning screen"; no wireframe draws it outside the hub (1e). Learning screens carry a breadcrumb that names the module and activity (the acceptance is "current position is identifiable without scrolling"). If you want the map on every screen, that is a later change.
5. **Assumed, not blocking: "Lecture questions" goes to the readiness summary (D14, wireframes 1e to 1o).** The wireframes show a "Lecture questions (n)" link and a "View list" button, and put the list inside the readiness summary (1o); no standalone screen is drawn. Both link to `/readiness`. The count is left out: the learner state (schema v1) has no lecture-questions field. Adding one is a storage change.
6. **Assumed, not blocking: TopBar actions follow the wireframes frame by frame.** Hub, module and Explore screens: Sandbox and Lecture questions; Check: Lecture questions; Warm-up check and its result: none; Sandbox: Lecture questions; Readiness: Sandbox. They are links (`<a>`), because they navigate; the TopBar gains an optional `href` on an action (one delta on `app-shell`). The wireframes' extra pills ("Private · not graded", "Private · retryable") are left out; every screen keeps the saved-on-this-device pill from the existing shell, because NFR-06 needs it.

## Why

A student opening the app can reach only Start and a heading. The MVP needs every screen from the wireframes to exist as a route, with the shell, breadcrumb and links in the right places, so that each later change (diagnostic, explore, checks, sandbox, readiness) fills in one screen instead of also inventing navigation. It also gives FR-LRN-03 and FR-LRN-04 their first working part: a progress map and moving back and forth between screens.

## What Changes

- **One route table in `src/routes.ts`**: `/` Start, `/path` the hub, `/module/:moduleId` a module screen, `/module/:moduleId/:activity` an activity (explore, example, check, refresher), `/module/C1/check/result`, `/sandbox`, `/readiness`; unknown paths go to Start. Path builders and parsers live there, and no other file writes a path by hand.
- **Navigation behaviour every screen shares**: the shell, breadcrumb and TopBar actions per wireframe, a browser title per screen, and focus moved to the heading after an in-app move (not on first load).
- **Hub screen (wireframe 1e)**: a progress map of C1 to C9 (done, current, later; symbol, word and border style, never colour alone) from the learner state, the current module's card with its activities as links, a Sandbox card.
- **Module screen** replaces the placeholder: the D1 heading, the activity list in default order, a back link.
- **Skeleton screens** for Warm-up check (1c), its result (1d), Explore, Worked example, Check, BST refresher, Sandbox (1n) and Readiness (1o): a heading, one line saying it is coming, and a link back to the path. No questions, trees or controls.
- Serves FR-LRN-03 (progress map, first part), FR-LRN-04 (move back and forward; nothing is discarded because nothing is stored by navigating), FR-VIS-08 (sandbox reachable from the hub and the TopBar), FR-DIA-04 (refresher reachable), NFR-01 (C1 within 3 clicks stays true), NFR-02. Learning outcomes: none; this is navigation.

## Capabilities

### New Capabilities
- `app-routing`: the route table, path helpers, redirects, titles, focus on navigation, and TopBar actions per screen.
- `module-hub`: the progress map, the hub screen and the module screen with its activity list.
- `screen-skeletons`: the placeholder screens for the diagnostic, its result, the three activities, the refresher, the sandbox and the readiness summary.

### Modified Capabilities
- `start-screen`: "Module screen placeholder" becomes the module screen from `module-hub`; Start and Resume still open the module at once.
- `app-shell`: "TopBar content comes from its props" lets an action be a link.

## Out of scope

Any real screen content: diagnostic questions and routing (FR-DIA), module text, worked examples, StepControls, replay, `ModeSwitch` and `PredictPrompt` placement (they stay unmounted until the Explore change), checks and scaffolds, the sandbox, readiness rules, lecture-question storage and its count; the guided or own-path toggle and reordering activities (wireframe 1e notes 2 and 3, FR-LRN-05); locking units (never locked, wireframe 1e note 4); the extra TopBar pills; browser-history restore of the in-module position; dark-theme work; a second router. `TreeView`, the engine and the learner state files are not changed.

## Impact

- New: `src/routes.ts`, `src/content/screens.ts` (wording), `src/components/ProgressMap.tsx`, `src/components/ActivityList.tsx`, `src/components/SkeletonScreen.tsx`, `src/pages/Hub.tsx`, `src/pages/Module.tsx`, `src/pages/Activity.tsx`, `src/pages/WarmUpCheck.tsx`, `src/pages/WarmUpResult.tsx`, `src/pages/Sandbox.tsx`, `src/pages/Readiness.tsx`, a small stylesheet, and a `useScreen` hook for title and focus.
- Changed: `src/App.tsx` (routes, `Screen` wrapper), `src/ui/TopBar.tsx` (optional `href`), `src/pages/Start.tsx` (path builders), `src/pages/ModulePlaceholder.tsx` (removed).
- New tests: `tests/routes.test.ts`, `tests/ui/routing.test.tsx`, `tests/ui/module-hub.test.tsx`; the existing start-screen and shell tests must still pass.
- No new dependencies (`react-router-dom` is installed). No other change is in flight on these capabilities; `add-predict-and-do-it-yourself` (merged, not yet archived) and `add-avl-insert-trace` touch different capabilities.
