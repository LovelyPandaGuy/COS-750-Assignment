# Tasks

## 1. Failing tests first

- [x] 1.1 Write failing tests, by the test-writer: `checkComplete` and the seed and attempt helper; session actions (attempt saved and reloaded, idempotent completion, invalid attempt refused, reset clears); `recommendRoute` with attempts; Check activity steps from the bank for C2 to C8 with no placeholder; each answer type, unreadable number, stored attempt with confidence; retry shows a new variant; four-part feedback, wording scan over every item and seeds 0 to 99; tree editor insert, rotate, stop early and keyboard-only; completion, skip and C7 scenarios; "Suggested" follows the result; axe and 44 px checks.

## 2. Session and rules

- [x] 2.1 Add `attempt-recorded` and `module-completed` to the learner reducer and `recordAttempt` and `completeModule` to the session, saved and validated; advance `currentModule`.
- [x] 2.2 Add the seed helper, `checkComplete`, `REVIEW_AFTER_MISSES` in the config, and attempts as an input to `recommendRoute`.

## 3. Check steps and feedback

- [x] 3.1 Share one four-part feedback panel between practice and checks; add `checkCopy` (verdict, Review, Try again, Next question, unreadable prompt, confidence labels) to content.
- [x] 3.2 Build the `check-item` step for choice and number items, with confidence, Check answer, feedback, and Try again as a new variant.
- [x] 3.3 Build `TraceEditor` for the trace-an-insert item from the existing rotation menu and engine insert, with Undo, Reset and an edit log.
- [x] 3.4 Expand each Check activity in `ModulePlayer` from the bank, remove the placeholder from content, complete the module on the last required right answer, and mark "Suggested" by the result in `RouteChoice`.

## 4. Docs and review

- [x] 4.1 Add decisions D75 onward for the assumptions in the proposal, update `next-steps.md` row 20, and run `npm test`, typecheck, lint, build and `openspec validate --all`.
- [ ] 4.2 Reviewer and accessibility-checker passes; the user's browser checks (keyboard only, greyscale, colour-vision emulation D25, 360 px touch).
