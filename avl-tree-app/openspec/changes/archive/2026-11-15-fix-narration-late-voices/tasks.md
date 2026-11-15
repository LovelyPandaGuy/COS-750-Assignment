# Tasks

## 1. Confirm the cause

- [x] 1.1 User: in Chrome on macOS, on the page showing the "no built-in voice" note, run `speechSynthesis.getVoices().filter(v => v.localService).map(v => v.name + ' ' + v.lang)` in the DevTools console. Verify: the list is not empty, so this change applies. If it is empty, stop: only remote voices exist, and that is a D147 question for a separate change.

## 2. Red tests (test-writer)

- [x] 2.1 Add `setVoicesSilently(v)` to `tests/ui/narration/fake.ts`, which changes the list without firing voiceschanged, and an option to return `[]` on the first `voices()` call only. Verify: the existing narration tests still pass.
- [x] 2.2 Tests in `tests/ui/narration/controls.test.tsx`, named for NFR-05 and D147, one per new scenario in `specs/narration/spec.md`: voices loaded before the app listens, voices that appear without an event, re-checking stops, no re-check after a voice is found. Verify: the new tests fail and the old ones pass. Commit the red tests.

## 3. Build (implementer)

- [x] 3.1 Export `VOICE_RECHECK = { intervalMs: 250, windowMs: 3000 }` from `src/ui/narration/engine.ts` with a D174 comment. Verify: `npm run typecheck`.
- [x] 3.2 In `NarrationProvider`, replace the voices effect with one that subscribes, reads the list at once, and re-checks on the interval while no voice is found, until the window ends. Keep the voice when the new pick has the same name and lang. Clear the timer and listener on cleanup. Verify: the tests from 2.2 pass.
- [x] 3.3 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`. Verify: all pass.

## 4. Check and record

- [ ] 4.1 User: reload the app in Chrome on macOS with narration on. Verify: the switch is enabled and Read aloud speaks with an on-device voice.
- [x] 4.2 Add an **assumed** row D174 (voice re-check: 250 ms interval, 3 s window) to `.claude/docs/decisions.md`. Verify: the row cites this change and NFR-05.
- [ ] 4.3 reviewer on the diff. Verify: pass, or findings resolved.
