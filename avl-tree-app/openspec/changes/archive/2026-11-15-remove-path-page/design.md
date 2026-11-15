# Design

## Context

See proposal.md for why. The hub is `src/pages/Hub.tsx` on `patterns.hub` (`/path`), built from `paths.hub()`. These depend on it:
- `LessonPlayer` finishes to `finishTo ?? paths.hub()`;
- `Sandbox.tsx`, `Readiness.tsx`, `Module.tsx` (the non-lesson fallback) and `ContentProblem.tsx` link "Back to path";
- `App.tsx` gives the hub a breadcrumb and both TopBar actions;
- `screenCopy.hub` and `screenCopy.crumbs.hub` hold its wording.

The Lessons sidebar (D155) is on every screen.

## Goals / Non-Goals

**Goals:**
- No screen or link leads to a path page.
- Every former hub exit has a clear destination.

**Non-Goals:**
- Removing the progress components from the gallery (`ui-progress`), or changing their contracts.

## Decisions

### 1. `/path` stays a route, as a redirect

`patterns.hub` stays and renders `<Navigate to={paths.module(currentModule)} replace />` inside the learner context, so old links and bookmarks still work. `paths.hub` is renamed `paths.legacyPath` and used only for this route, so no new code links to it.

*Alternative:* drop the route, so `/path` falls to `*`, which goes to Start. This was rejected because a student with progress would land on Start instead of their lesson.

### 2. The destination after a lesson is one function

`routes.ts` gains `afterLesson(id: ModuleId): string`, which gives the next module's path for C1 to C8 and `paths.readiness()` for C9. `LessonPlayer` uses `finishTo ?? afterLesson(lessonModuleId)`, so the refresher keeps its `finishTo` (C2). The player gets the module ID from its lesson ID.

### 3. One back link component

`BackToLesson` (`src/components/BackToLesson.tsx`) reads `currentModule` from the learner and renders `← Back to {moduleLabel}` linking to `paths.module(currentModule)`. The wording is `screenCopy.links.backToLesson(label)`. The sandbox, readiness, module fallback and content-problem screens use it.

### 4. Remove the hub's wording and actions

`App.tsx`'s hub route becomes the redirect, with no `Screen`. `screenCopy.hub` (except anything still read by the gallery fixtures, which use their own example wording) and `crumbs.hub` are removed, as are `links.backToPath` and `backToPathSandbox`. The state-matrix entries for the hub route are replaced by an entry for the gallery's `HubView` if not already present, so `ui-progress` "Progress states are in the state matrix" still holds.

### Decision rows

| ID | Topic | Decision |
| --- | --- | --- |
| D159 | Path page removed | There is no path page: the Lessons sidebar shows the path (D155). `/path` redirects to the current lesson. Next on a lesson's last screen opens the next lesson, and after C9 the readiness report; the refresher still ends at C2. "← Back to {current lesson}" replaces "Back to path". User choice (15 Nov). |
| D160 | Sandbox suggestion | The hub's Sandbox card and its "after C2" suggestion are removed with the hub; the sandbox stays one click away through the TopBar "Sandbox" link (D11). |

## Risks / Trade-offs

- [The hub was where a student saw their current lesson's phases (ActivityList)] → The lesson frame shows "Screen n of m" and the phase word on every screen, and the sidebar shows the lesson's state.
- [The visual state matrix references `/path`] → It is updated in the test task. Any visual baselines for `/path` are deleted.

## Migration Plan

No data migration. Rollback is reverting the change.
