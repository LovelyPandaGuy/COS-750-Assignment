# Tasks

Roles as in `.claude/CLAUDE.md`. No task commits; the user commits. Archive after `revamp-navigation` (the sidebar this change relies on).

## 1. Red tests

- [x] 1.1 (test-writer) Write and update the tests for every modified scenario: `/path` redirects to the current lesson, routes and builders without the hub, `afterLesson` for C1 to C9, breadcrumbs and actions without the hub, titles on `/sandbox`, focus after a sidebar link, Next on the last screen of C3 and of C9, the refresher still ending at C2, "← Back to {current lesson}" on the sandbox, readiness and content-problem screens, and no "Back to path" anywhere. Remove the hub-page tests (`module-hub` "Progress map", "Hub screen", "Sandbox suggested after C2"), keeping the gallery component tests. Verify the new and changed tests fail only because the hub still exists.

## 2. Build

- [x] 2.1 (content-author) Add `screenCopy.links.backToLesson`, and remove the hub page wording, `crumbs.hub`, `backToPath` and `backToPathSandbox` once unused. Verify `npm run typecheck` passes.
- [x] 2.2 (implementer) Add `afterLesson` and `paths.legacyPath` to `routes.ts`, make `/path` the redirect, and make `LessonPlayer` finish to `afterLesson` (design 1, 2). Verify the routing and module tests pass.
- [x] 2.3 (implementer) Add `BackToLesson`, use it on the sandbox, readiness, module fallback and content-problem screens, and delete `src/pages/Hub.tsx` (design 3, 4). Update the state matrix (`tests/visual/matrix/states.ts`) and the coverage test for the removed route. Verify every task 1.1 test passes and `npm test` and `npm run lint` are green.

## 3. Records and review

- [x] 3.1 Add D159 and D160 to `.claude/docs/decisions.md`, mark D11's hub card superseded, and note in `.claude/docs/design/INDEX.md` that frame 1e (Unit hub) is not built as a page. Verify `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all` pass.
- [ ] 3.2 Run the reviewer and a11y-checker roles. Then by hand: finish C3 and land on C4, finish C9 and land on the readiness report, open `/path` and land on the current lesson, and use the back links on the sandbox and the readiness page. Verify the reports pass or findings are resolved.

## Workflow follow-up

- The user commits, merges and archives; agents do not.
