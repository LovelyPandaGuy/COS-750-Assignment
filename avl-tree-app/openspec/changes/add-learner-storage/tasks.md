# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/state/learner-storage.test.ts` from every scenario under "Anonymous profile on first launch", "No personal identifiers stored", "Restore after reload" (including the fast-check round-trip property) and "Reset clears all stored data", named after FR-ONB-02, FR-ONB-03 or FR-ONB-04, using an injected memory backend and ID generator; verify it fails only because `src/state/` does not exist.
- [x] 1.2 Add to the same file every scenario under "Stored data is validated on load" (including the fuzzed-string property), "Works when storage is unavailable" (a backend that always throws, and one that throws a quota error on `setItem` only) and "Stored-data inventory" (a recording backend), named after NFR-05 or NFR-06; verify these fail for the same reason.
- [x] 1.3 Write `tests/state/storage-single-source.test.ts` from "Single storage access point", scanning `src/` like `tests/engine/conventions-single-source.test.ts` and allowing only `src/state/storage.ts`; verify it passes today (nothing touches storage) and fails when a scratch `localStorage` reference is added to another `src/` file, then remove the scratch line. Verify all existing tests still pass.

## 2. Learner state model

- [x] 2.1 Add `src/state/learnerState.ts` with the SE §6.3 `LearnerState` and `Attempt` types, `SCHEMA_VERSION = 1`, the `C1`..`C9` module IDs, `freshLearnerState(id)` and nickname normalisation (trim, cap 24, blank to none); verify `npm run typecheck` passes and the first-launch shape assertions pass once 2.2 lands.
- [x] 2.2 Add `parseLearnerState(unknown)` to the same file: field-by-field validation that returns a new object with only model fields, or `null`; verify the tampered-fields, unknown-version and only-model-fields scenarios pass in isolation.

## 3. Storage adapter

- [x] 3.1 Add `src/state/storage.ts` with `KeyValueBackend`, `memoryBackend()`, `browserBackend()` (guarded `window.localStorage` access), the `avl-primer:` prefix and `STORAGE_INVENTORY`; verify the inventory description scenario passes.
- [x] 3.2 Add `createLearnerStorage(backend, options)` with `load()` returning `{ state, status }` and `save(state)` (JSON, normalised fields), using `crypto.randomUUID` by default; verify the first-launch, round-trip, last-save-wins, nickname and corrupt-data scenarios pass, including both property tests.
- [x] 3.3 Add the memory fallback (wrap every backend call, switch once on failure, `isPersistent()`) and `reset()` (remove every prefixed key, save a fresh state with a new ID); verify the unavailable-storage, reset and every-written-key-is-listed scenarios pass, so the whole `learner-storage.test.ts` passes.

## 4. Review

- [x] 4.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; verify all pass, no new `[OPEN]` markers in `src/`, no new dependencies in `package.json`, and no file under `src/engine/` changed.
- [x] 4.2 Fresh-context review of the diff against the spec delta, SE §6.3, D16, NFR-05 and NFR-06; verify the report is a pass or its findings are resolved. (No UI, so no a11y check.)

## Workflow follow-up

- Answer proposal question 3 (nickname and POPIA) and record it in `docs/decisions.md` under D16.
- Next change: `add-event-log` (FR-RDY-04, SQLite with JSON fallback) after spike S3; its reset must also clear the event log, and its keys go in `STORAGE_INVENTORY`.
- Later UI changes: the reset confirmation (FR-ONB-04), the "we started fresh" and "not being saved" messages (NFR-06) and the privacy notice rendered from `STORAGE_INVENTORY` (FR-ONB-05).
- The user merges and archives; agents do not.
