# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place; please read them before `/opsx:apply`.

1. **Note: this is change 12 and comes before `add-modules-c2-c3` (plan rows 12 and 13, user choice 13 Nov).** The framework core (step schema, facts, validator, step player, control strip, skip) was first specified inside `add-modules-c2-c3` and its code and tests are already on `main`. Its spec delta, design decisions and tasks now live here, and `add-modules-c2-c3` builds on this change. Archive this change first. The framework and C2/C3 were built together, so the `module-framework` scenarios use C2 and C3 as their worked examples, and the existing tests (`tests/modules/framework.test.ts`, `tests/ui/module-player.test.tsx`) stay as they are.
2. **Assumed, not blocking: how Gagné events map onto the three activity routes (D10, FR-LRN-05, wireframe 1e).** Explore holds hook, goals, recall and content; Worked example holds example and practice; Check holds the check and the summary. Feedback (event 7) lives inside practice, not as its own step. One table, `EVENT_ACTIVITY` in `src/modules/schema.ts`. (Moved from `add-modules-c2-c3`.)
3. **Assumed, not blocking: step position is not persisted.** The player keeps the step index in component state. Leaving and returning starts the activity again; resume stays at module level (D3). Persisting it is a storage change. (Moved from `add-modules-c2-c3`.)
4. **Assumed, not blocking: each module's prerequisite (D20).** The ID names no per-module prerequisites, only that BSTs (C1, C2) come first. Working default: a module's prerequisite is the required module before it in the guided order (C2 needs C1, C3 needs C2, and so on); C7 is optional (D4), so C8 needs C6, not C7. C1 has none. One table, `PREREQUISITE` in `src/navigation/policy.ts`.
5. **Assumed, not blocking: "entering early" means the prerequisite is not in the completed modules.** Until checks complete modules (changes 19 to 21), the note shows on every module screen from C2 on. That is honest about the state and needs no special case.
6. **Assumed, not blocking: where the note shows.** On the module screen only (the entry point from the path and the hub). Deep links straight to an activity show no note. One component, so adding it to the activity screen later is one line.
7. **Assumed, not blocking: what is recommended after a check.** Checks are still placeholders, so there is no result to route on. The recommendation is the next module in the guided order (C6 recommends C7, because D4 keeps deletion in scope; C8 recommends C9). `recommendRoute` takes the module and returns one target; change 20 adds the check result as an input. C1 (warm-up, change 22) and C9 (readiness) do not use the player and are not covered.
8. **Assumed, not blocking: what the student can choose.** Three ways on: the suggested module, "look over this module again" (its module screen), and the existing Next, which goes to the path. Choosing changes nothing in the learner state; the current module moves only when checks complete modules (change 20).
9. **Assumed, not blocking: one primary action.** The control strip's Next stays the only primary button on the step. The suggested route is a secondary button marked with the word "Suggested", so it is not shown by colour or weight alone.
10. **Flagged for the user to read: wording beyond the ID.** Player labels (`src/content/modules/player.ts`, already written), the prerequisite note, the route panel heading and button labels (`src/content/navigation.ts`, new). Each string is flagged.

## Why

Every module (C2 to C9) is played the same way: steps in the Gagné order, facts from the engine, one control strip. That needs one framework that modules are written against, before any module is written. D20 also promises that nothing is locked but a student who starts a module early is told so, and that after a check the app suggests a route and the student chooses; D28 asks that both are logged for the pilot. Module screens say nothing about order today, and the last check step just goes to the path.

## What Changes

Framework core (already built; specified here):

- **Module step schema.** A module is an ordered list of steps, each typed by a Gagné event (hook, goals, recall, content, example, practice, check, summary) and placed in one of the three activities. Each step names its primary representation and may carry supporting rule text shown on demand (D22).
- **Facts from the engine.** A step names its trees by source (plain BST from keys, AVL from keys, seeded generator) and its bounds by size. The framework computes heights, search step counts, best and worst case search bounds, balance factors and AVL validity with the engine, then hands them to the step's text. Content never types an answer.
- **Content validator.** Checks event order (D10), activity placement, engine-checked claims, that every number in rendered text comes from the facts, the keys or a declared allowance, and that no text states the sign, a lean or a case name (D19).
- **Step player.** Shows "Step n of m", the trees, the caption and a control strip in the same place on every step: Back and Next on one side, Show the rule and Hint on the other (D23). "I know this, skip" on content and worked-example steps only (D20). Focus moves to the step heading. Works by keyboard and touch.

New in this change:

- **Entry policy.** One pure function decides entry. It always lets the student in (never locked) and returns the prerequisite to name when it is not complete. Locking later is a change to this one function (D20).
- **Soft prerequisite note.** The module screen shows a calm note naming the prerequisite module, with a link to it, when the policy returns one. The module's activities stay usable.
- **Recommend and choose after a check.** On the last step of a module's Check activity, a "Where next?" panel shows the suggested module and the option to look over this module again; Next to the path stays as it is.
- **Route events.** Showing the panel emits `route_recommended`; choosing a way on (including Next to the path) emits `route_chosen`. Both go to a no-op sink until change 26 adds the event log; tests can swap the sink.

Serves FR-LRN-01, FR-LRN-03, FR-LRN-04, FR-LRN-05; decisions D10, D19, D20, D22, D23, D28. No LO directly; every module's LOs depend on it.

## Out of scope

- Module content (C2 and C3 are `add-modules-c2-c3`, and so on).
- The "Guided path / Choose my own" toggle and reordering of the middle steps (rest of plan row 12; a later change).
- Routing on a check result, and completing a module (changes 19 to 21).
- Routing after the C1 warm-up (change 22) and the C9 readiness check.
- Persisting route events (change 26). Changing `currentModule` when a route is chosen. A step parameter in the URL.
- A note on the activity screens.

## Capabilities

### New Capabilities
- `module-framework`: the step schema and Gagné event order, facts computed by the engine, the content validator, and the step player with its control strip and skip. (Moved from `add-modules-c2-c3`.)
- `module-entry`: the entry policy, the prerequisite table and the soft prerequisite note.
- `route-choice`: the route recommendation after a check, the "Where next?" panel and the route event sink.

### Modified Capabilities
- `module-hub`: the module screen shows the soft prerequisite note when the entry policy names one.

## Impact

- Already on `main` (framework core): `src/modules/` (`schema.ts`, `facts.ts`, `render.ts`, `validate.ts`, `config.ts`, `registry.ts`), `src/ui/module/` (`ModulePlayer.tsx`, `ControlStrip.tsx`, `module.css`), `src/content/modules/player.ts`, `src/pages/Activity.tsx` (renders the player when content exists).
- New: `src/navigation/policy.ts` (`PREREQUISITE`, `entryPolicy`, `recommendRoute`), `src/navigation/routeEvents.ts` (event types, no-op sink, `emitRouteEvent`, `setRouteEventSink`), `src/components/PrerequisiteNote.tsx`, `src/ui/module/RouteChoice.tsx`, `src/content/navigation.ts`.
- Changed: `src/pages/Module.tsx` (renders the note), `src/ui/module/ModulePlayer.tsx` (renders the panel on the last Check step and emits `route_chosen` on Next there), `src/ui/module/module.css` (tokens only).
- No new dependencies, no storage schema change, no network calls.
