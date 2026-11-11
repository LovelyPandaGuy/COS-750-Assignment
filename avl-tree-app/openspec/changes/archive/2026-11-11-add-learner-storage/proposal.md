# Proposal

## Open questions

1. **Assumed, not blocking: split from the event log (D16).** D16 puts progress and settings in localStorage behind a StorageAdapter, and the event log in SQLite (sqlite-wasm). This change covers only the localStorage side. The SQLite event log (FR-RDY-04) and its JSON fallback follow as their own change, `add-event-log`, after spike S3 confirms browser support. That keeps each change near ten tasks and keeps the new sqlite-wasm dependency out of this one.
2. **Assumed, not blocking: settings (D16).** D16 says localStorage holds "progress and settings", but no decision or FR lists any settings yet. This change stores the learner state only. The stored-data inventory and reset already cover every key under the app prefix, so a settings key can be added later without changing reset or the notice text.
3. **Assumed, not blocking: nickname and personal data (NFR-05, FR-ONB-02).** FR-ONB-02 allows an optional nickname, and NFR-05 says no personal data is collected. A student could type their real name. The nickname is stored only in this browser, is never exported (FR-RDY-05 already says "no identifiers"), and is trimmed and capped at 24 characters. The privacy notice (FR-ONB-05, a later UI change) should tell students not to use their real name. Please confirm this is acceptable for POPIA, or say whether the nickname should be dropped.
4. **Assumed, not blocking: corrupted data is replaced, not kept (NFR-06).** When stored data cannot be read or fails validation, the app starts fresh and reports that it did, so the UI can show a message. The unreadable data is overwritten on the next save; no backup copy is kept. A backup could hold the same personal data the student was trying to clear, and nothing in the SE document asks for recovery.
5. **Assumed, not blocking: module IDs.** `currentModule` and `completedModules` use the D1 module IDs `C1` to `C9`. A fresh profile starts at `C1` on the `guided` path (SE §6.3).

No `[OPEN]` item blocks the specs.

## Why

The app has no backend or login (SE §3, §4.1), so a student's progress lives only in the browser. Resume after reload (FR-ONB-03), reset (FR-ONB-04), routing, retries and the readiness summary all need learner state that survives a reload, and the SE document requires that bad stored data never crashes the app (NFR-06). This is the first change in the state layer, so it sets the storage contract before any UI is built on it.

## What Changes

- Add the learner state model from SE §6.3 (`LearnerState`, `Attempt`) with a schema version.
- Add a StorageAdapter that loads, saves and clears learner state in localStorage, behind an interface that tests can back with memory.
- Create an anonymous profile (random ID, optional nickname) on first launch.
- Validate stored data on load. Missing, unreadable, invalid or unknown-version data gives a fresh profile and a status the UI can report.
- Keep working, without persistence, when localStorage is blocked or full.
- Reset clears every app key and returns a fresh profile with a new ID.
- Export a stored-data inventory (each key and what it holds) for the privacy notice and POPIA documentation.
- Add a check that no file under `src/` other than the storage adapter touches browser storage.
- Serves FR-ONB-02 (Must), FR-ONB-03 (Must, storage side), FR-ONB-04 (Should, storage side), NFR-05 (storage keys) and NFR-06 (stored-data part). No learning outcome directly; it supports routing and the readiness summary (LO1 to LO9) later.

## Capabilities

### New Capabilities
- `learner-storage`: the persisted learner state, its validation on load, profile creation, reset, the storage-failure fallback and the inventory of what is stored.

### Modified Capabilities
None.

## Out of scope

The SQLite event log and its JSON export (FR-RDY-04, next change); settings; the learner reducer, Context and routing (SE §6.2 `learnerReducer.ts`, `routing.ts`); the start screen, the reset confirmation dialog, the "we started fresh" message and the privacy notice UI (FR-ONB-04 confirmation, FR-ONB-05); the anonymous results export (FR-RDY-05); migrating older schema versions (there are none yet); the Playwright resume test. No engine file is touched.

## Impact

- New: `src/state/learnerState.ts` (types, fresh state, validation), `src/state/storage.ts` (StorageAdapter, localStorage and memory backends, inventory).
- New tests: `tests/state/learner-storage.test.ts`, `tests/state/storage-single-source.test.ts`.
- No new dependencies. `crypto.randomUUID` (browser built-in) makes the profile ID.
- One other change is in flight (`add-avl-insert-trace`, on `avl-engine`); it does not overlap.
