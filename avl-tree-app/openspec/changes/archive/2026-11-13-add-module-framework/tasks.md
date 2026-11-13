# Tasks

## 1. Framework core (built on `main`, moved from `add-modules-c2-c3`)

- [x] 1.1 Write `tests/modules/framework.test.ts` (order, activities, facts, claims, numbers, wording) and the navigation, focus, control strip, skip and check-placeholder cases of `tests/ui/module-player.test.tsx` from every `module-framework` scenario; verify they failed only because the framework did not exist.
- [x] 1.2 Add `src/modules/schema.ts` (events, `EVENT_ACTIVITY`, step and figure types), `config.ts` (`PRACTICE_HINTS`), `facts.ts` (tree building, facts, `searchBounds`, `isPerfect`), `validate.ts` (order, activity, claim, number, wording problems) and `registry.ts`; verify the facts, bounds and validator tests pass on the bad-module fixtures.
- [x] 1.3 Add `ModulePlayer` and `ControlStrip` in `src/ui/module/` (tokens only, 44 px targets), `src/content/modules/player.ts` (content-author, flagged), and render the player from `src/pages/Activity.tsx` when module content exists; verify the module-player tests pass and C4 still shows the skeleton.

## 2. Red tests (entry and route choice)

- [x] 2.1 Write `tests/navigation/policy.test.ts` (prerequisite table, entry decisions, never-locked property over generated learner states, recommendations) and `tests/navigation/route-events.test.ts` (default sink, swapped sink) from the `module-entry` and `route-choice` scenarios, named after D20, D28 and FR-LRN-04; verify they fail only because the modules do not exist.
- [x] 2.2 Write `tests/ui/prerequisite-note.test.tsx` (every `module-hub` delta scenario, axe) and `tests/ui/route-choice.test.tsx` (panel placement, one primary, choices by keyboard, events, no state change, axe on C2 and C3); verify they fail only because the code does not exist and all existing tests still pass. Leave them uncommitted for the user to commit.

## 3. Logic and content

- [x] 3.1 Add `src/navigation/policy.ts` (`PREREQUISITE`, `entryPolicy`, `recommendRoute`) and `src/navigation/routeEvents.ts` (event types, no-op sink, `emitRouteEvent`, `setRouteEventSink`); verify the policy and route-event tests pass.
- [x] 3.2 Write `src/content/navigation.ts` (content-author; note, link, panel heading and button labels, every string flagged); verify the calm-wording scenario and the existing hub "no scores" scan pass.

## 4. UI

- [x] 4.1 Add `PrerequisiteNote` in `src/components/` and render it in `src/pages/Module.tsx` (tokens only, 44 px link); verify the prerequisite-note tests and every existing module-hub test pass.
- [x] 4.2 Add `RouteChoice` in `src/ui/module/`, render it from `ModulePlayer` on the last Check step and emit `route_chosen` on Next there; verify the route-choice tests and every existing module-player, C3, C5 and C8 test pass.

## 5. Review

- [x] 5.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; add assumed rows to `.claude/docs/decisions.md` for proposal items 2 to 9; verify all pass, every item has a row and there are no new `[OPEN]` markers.
- [ ] 5.2 Run the reviewer and a11y-checker roles; then by hand: keyboard-only run of C3 entry and the C2 check's last step, greyscale screenshot, colour-vision emulation (D25), a touch run at 360 px; verify the reports pass or findings are resolved.

## Workflow follow-up

- Read the assumptions in the proposal and every flagged string in `src/content/navigation.ts` (gate G3).
- Archive this change before `add-modules-c2-c3` (it no longer carries `module-framework`).
- A later change adds the "Guided path / Choose my own" toggle and reordering of the middle steps.
- The user commits, merges and archives; agents do not.
