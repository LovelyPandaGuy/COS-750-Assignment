# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/sandbox/sandbox.test.ts` from the non-UI `sandbox` scenarios (insert on and off, delete, notices, cap, rebuild on toggle, sorted and random shortcuts, statistics including a property test over random insert and delete sequences, log entries and case names from the conventions wording, lastInsert rules, no typed case names), each named after the FR, LO or D it serves; verify they fail only because the code does not exist.
- [x] 1.2 Write `tests/ui/sandbox.test.tsx` (controls, tap to delete, switch in words and by keyboard, full tree, statistics shown, event log live region, replay offered and not offered, nothing stored, back link, axe in four states) and update the `screen-skeletons` and `module-hub` tests for the deltas (sandbox out of the skeleton list; hub suggestion after C2); verify the new cases fail only because the code does not exist and the rest pass. Leave them uncommitted.

## 2. Logic

- [x] 2.1 Add `src/sandbox/config.ts` and `src/sandbox/sandbox.ts` (state, reducer, `sandboxStats`); verify the sandbox logic tests pass.

## 3. Content

- [x] 3.1 Write `src/content/sandbox.ts` and the hub suggestion line in `src/content/screens.ts` (content-author; every string flagged, case names only through the conventions wording); verify the wording and no-typed-case-name tests pass.

## 4. UI

- [x] 4.1 Add `InsertControl`, `RebalanceSwitch`, `TreeStats` and `EventLog` in `src/ui/sandbox/` with `sandbox.css` (tokens only, 44 px targets, wraps at 360 px); verify the component cases of the sandbox UI tests pass.
- [x] 4.2 Replace the skeleton in `src/pages/Sandbox.tsx` with the screen (tree, replay last insert, back link); verify every sandbox UI test and the updated skeleton tests pass.
- [x] 4.3 Add the suggestion line to the Sandbox card in `src/pages/Hub.tsx`; verify the hub tests pass.

## 5. Review

- [x] 5.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; add assumed rows to `.claude/docs/decisions.md` for proposal items 2 to 8; verify all pass and there are no new `[OPEN]` markers.
- [ ] 5.2 Run the reviewer and a11y-checker roles; then by hand: keyboard-only run, greyscale screenshot (Unbalanced flag and switch state), colour-vision emulation (D25), touch run at 360 px with a 15-node chain; verify the reports pass or findings are resolved.

## Workflow follow-up

- Read the assumptions in the proposal and every flagged string in `src/content/sandbox.ts` (gate G3).
- The user commits, merges and archives; agents do not.
