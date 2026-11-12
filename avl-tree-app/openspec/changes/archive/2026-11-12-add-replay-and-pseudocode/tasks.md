# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/replay/replay.test.ts` (test-writer) from every scenario under "Replay positions come from the trace", "Step forward and step back", the reducer half of "Play, pause and speed" (tick, end, speed order), "Roles during the replay", "Search replays with a step count", the jump and reset parts of "Replay waits for a prediction and can jump to a step", and the data half of "A sentence for each step" (tag per step, balance factors from `after`), named after FR-VIS-03, FR-VIS-02, FR-VIS-07 or FR-VIS-11, with fast-check properties over the generator in the specs; verify they fail only because `src/replay/replay.ts` does not exist.
- [x] 1.2 Write `tests/replay/pseudocode-sync.test.tsx` from "Listings match the engine's line numbers", the automated check in "Current line is highlighted" and "Case equals the engine's case", named after FR-VIS-04; verify they fail only because the listings and panel do not exist.
- [x] 1.3 Write `tests/ui/step-controls.test.tsx` and `tests/ui/replay-player.test.tsx` from the UI scenarios of both specs (fake-timer playback, keyboard-only and scoped keys, labels and 44 px, counter and progress bar, live region, held state, Replay that step, form switch, reading order, Watch slot, axe, calm-wording scan, tokens-only stylesheet scan); verify they fail only because the components do not exist and that all existing tests still pass.

## 2. Logic

- [x] 2.1 Add `src/replay/replay.ts`: the replay reducer and `treeAt`, `rolesAt`, `visitedAt` and `explainAt` (Design decisions 2 and 5); verify `tests/replay/replay.test.ts` passes, including the step-back and positions-equal-replay properties.

## 3. Content

- [x] 3.1 Add `src/content/pseudocode.ts` (insert outline, search loop, search recursive) and `src/content/replay.ts` (control labels, speed labels, `BASE_MS`, sentence templates, held note, region names) with the content-author; flag both files for the user to read; verify the listing half of `pseudocode-sync.test.tsx` and the wording scan pass.

## 4. UI

- [x] 4.1 Add `StepControls` and `StepExplanation` in `src/ui/replay/` with `replay.css` (tokens only); verify `tests/ui/step-controls.test.tsx` passes.
- [x] 4.2 Add `PseudocodePanel` (listing, highlighted line with ▶ and `aria-current`, case label, loop/recursive radios); verify `pseudocode-sync.test.tsx` passes in full.
- [x] 4.3 Add `ReplayPlayer` (operation in, traces via `useMemo`, timer effect, scoped key handling, `held` and `showStep` props, read-only `TreeView` with `rolesAt`); verify `tests/ui/replay-player.test.tsx` passes, including the Watch-slot scenario with `ModeSwitch`.

## 5. Review

- [x] 5.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; verify all pass, no new `[OPEN]` markers, and `git diff --stat` shows no edits under `src/engine/`, `src/ui/tree/` or `src/ui/practice/`.
- [ ] 5.2 Run the `reviewer` (fresh context) and `a11y-checker` subagents; then by hand: keyboard-only run, screen-reader pass over a full insert and a not-found search, greyscale screenshot of the highlighted line and roles, and a 360 px run; verify the reports pass or findings are resolved.

## Workflow follow-up

- Read the flagged content: pseudocode listings, step sentences and the 1200 ms step time; confirm proposal assumptions 3 to 6.
- Take D12 (pseudocode language) and the insert-outline question to the lecturer.
- Next changes: place the player on the Explore and worked-example screens (module framework); node sliding transitions (`tree-view`); "be the algorithm" search; delete replay once delete has a trace (FR-VIS-12).
- The user merges and archives; agents do not.
