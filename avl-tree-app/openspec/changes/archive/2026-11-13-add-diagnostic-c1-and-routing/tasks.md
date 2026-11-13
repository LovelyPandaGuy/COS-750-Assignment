# Tasks

## 1. Failing tests first

- [x] 1.1 Write failing tests: `diagnosticRoute` for all 32 combinations and order-independence; `skillStatuses` and the phase function from attempts (fresh, midway, secure route, refresher route, re-check, finished); the three new kinds and `DIAGNOSTIC` over seeds 0 to 99 (engine answers, tagged `PRE`, misconceptions and hints present, validator clean, bank counts including C1 five); `PRE` accepted and an LO tag on a prerequisite sub-skill rejected; `setPath` session action; the C1 screens (intro, conventions card from the module, one question at a time with no feedback, Back keeps answers, attempts stored, skip from the first screen and mid-flow, result with per-skill words and no fraction or percent, refresher link always, completion on a secure route and after the re-check, re-check only the weak skills as a new variant, route events and "Suggested"); the refresher (validator clean, missing hook caught, heading, topics in order, skippable content steps, ending link); wording scans; axe on every screen and keyboard.

## 2. Assessment layer

- [x] 2.1 Add the `PRE` outcome and four prerequisite sub-skills; build the `tree-terms`, `is-bst` and `insert-parent` kinds; add the six misconceptions with labels, hints and lecture templates; write `diagnostic.ts` with the five items; make the validator, mastery and the reducer use `ALL_ITEMS` and the bank count rule allow five at C1.

## 3. Routing and state

- [x] 3.1 Build `navigation/diagnostic.ts` (`diagnosticRoute`, `skillStatuses`, the phase function) and the `path-set` reducer action with `setPath` on the session.

## 4. Content and screens

- [x] 4.1 Add `validateSequence`, the player's `heading` prop and `c1Refresher.ts`; route `/module/C1/refresher` to the player.
- [x] 4.2 Write `content/diagnostic.ts` and build `WarmUpCheck` (intro, conventions card, questions with confidence, skip, re-check phase) replacing the skeleton.
- [x] 4.3 Build `WarmUpResult` with `SkillStatusList`, the suggested-route panel, route events, C1 completion and the links; generalise `RouteChoice`.

## 5. Docs and review

- [x] 5.1 Add decisions from D84 for the assumptions in the proposal, update `next-steps.md` row 22, update the skeleton and route notes, and run `npm test`, typecheck, lint, build and `openspec validate --all`.
- [ ] 5.2 Reviewer and accessibility-checker passes; the user's browser checks (keyboard only, greyscale, colour-vision emulation D25, 360 px touch), and a read of the new wording (diagnostic, refresher, hints, gate G3).
