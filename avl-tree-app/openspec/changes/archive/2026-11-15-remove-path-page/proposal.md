# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Please read these before `/opsx:apply`.

1. **Settled (user, 15 Nov): the path page is removed.** The Lessons sidebar on every screen (D155) already shows the student's path, so `/path` ("Your path") goes. Opening `/path` (old links, bookmarks) redirects to the student's current lesson.
2. **Settled (user, 15 Nov): after a lesson, the next lesson.** Next on the last screen of C1 to C8 opens the next lesson. After C9 it opens the readiness report. The refresher still ends at C2.
3. **Settled (user, 15 Nov): "Back to your lesson".** The sandbox, the readiness page and the content-problem screen replace "← Back to path" with "← Back to C3 The AVL property", which links to the student's current lesson.
4. **Assumed, not blocking: the sandbox suggestion after C2 is dropped (D160).** The hub's Sandbox card ("Open sandbox", and a suggestion line once C2 is done) goes with the hub. The sandbox stays one click away through the TopBar's "Sandbox" link on lessons C2 to C9 and the readiness page (D11 "always reachable"). The suggestion line has no other natural place.
5. **Assumed, not blocking: the progress components stay in the gallery.** `HubView`, `ProgressMap`, `UnitCard`, `ActivityList`, `SandboxCard` and `LectureQuestionsCard` stay as design-system components in the development gallery (`ui-progress`), so the component contracts are unchanged. Only the route and the page `src/pages/Hub.tsx` go.
6. **Flagged for the user to read:** "← Back to {lesson}". It is built from the lesson's code and title, as the sidebar shows them.

Serves ID 8.2 (lesson list; Next and Back), FR-LRN-03, FR-LRN-04, D20; D155.

## Why

The user asked to remove the path page, because the sidebar already shows the path. Keeping both shows the same information twice, and leaves "Back to path" links pointing at a page the student no longer needs.

## What Changes

- **Path page (removed):** `/path` and `Hub.tsx`. `/path` redirects to the current lesson.
- **End of a lesson (changed):** Next on the last screen goes to the next lesson, and after C9 to the readiness report.
- **Back links (changed):** "← Back to {current lesson}" on the sandbox, readiness and content-problem screens.
- **TopBar and breadcrumbs (changed):** no hub breadcrumb, and no hub actions.
- **Sandbox suggestion after C2 (removed).**

## Out of scope

- The sidebar itself (D155), and the gallery's progress components.
- Locking lessons (D20 stands).

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `app-routing`: "Route table", "Paths come from one module", "Breadcrumb per screen", "TopBar actions per screen", "Browser title per screen" and "Focus follows in-app navigation" (no hub).
- `module-hub`: "Module screen" (next lesson after the last screen) and "Wording and targets"; "Progress map", "Hub screen" and "Sandbox suggested after C2" are removed.
- `bst-refresher`: "Reachable, skippable, calm" (no hub).
- `live-content`: "Content errors are shown on one screen" (back to your lesson).
- `sandbox`: "Nothing saved, accessible" (back to your lesson).

## Impact

- Removed: `src/pages/Hub.tsx` and the hub route. `paths.hub` becomes the redirect.
- Changed:
  - `src/routes.ts` (`nextAfter(id)`);
  - `src/App.tsx` (redirect, breadcrumbs);
  - `src/ui/lesson/LessonPlayer.tsx` (finish destination);
  - `src/pages/Sandbox.tsx`, `Readiness.tsx` and `Module.tsx`, and `src/ui/lesson/ContentProblem.tsx` (back link);
  - `src/content/screens.ts` (hub wording removed, `backToLesson`).
- Tests: routing, module hub, sandbox, readiness and C9, and the state-matrix entries for the hub.
- Decisions: D159 and D160. D11's hub card is superseded.
- There are no new dependencies, no storage change and no network calls.
