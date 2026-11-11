# Design

## Context

There is no `src/state/` yet; the app so far is the engine and a placeholder `App.tsx`. SE §6.2 places `storage.ts` (StorageAdapter plus the localStorage implementation) in `src/state/`, and SE §6.3 gives the `LearnerState` and `Attempt` types. D16 fixes localStorage for progress and SQLite for the event log only. Tests run in Vitest with jsdom, which provides `localStorage` and `crypto.randomUUID`. See proposal.md for motivation and scope.

## Goals / Non-Goals

**Goals:**
- One module owns every browser-storage call, so NFR-05's "code review of storage keys" is one file.
- Load never throws and always returns a usable state, so the UI can render on any stored data.
- The adapter is testable without jsdom quirks: the backing store is injected.

**Non-Goals:**
- No React code: no Context, hook or reducer here. The adapter is plain TypeScript that the reducer change will call.
- No schema migration framework. Version 1 is the only version; anything else is corrupt.
- No debounce or batching of saves. State is small (at most a few hundred attempts), so each save writes the whole state.

## Decisions

**1. Two layers: a key-value backend and the learner adapter.**
`KeyValueBackend` is the subset of the Web Storage API the app needs (`getItem`, `setItem`, `removeItem`, `key`, `length`). `createLearnerStorage(backend, options)` returns the `StorageAdapter` with `load()`, `save(state)`, `reset()` and `isPersistent()`. `browserBackend()` returns `window.localStorage`, reading it inside a try/catch because merely touching `localStorage` can throw in some private modes. `memoryBackend()` is a Map-backed backend for tests and for the fallback.
*Alternative:* a single class that calls `localStorage` directly. Rejected: the failure scenarios (throws on access, quota exceeded) are much easier to test with an injected backend than by patching jsdom's `Storage.prototype`.

**2. Load result carries a status.**
`load()` returns `{ state, status }` with `status` one of `"new" | "restored" | "reset-corrupt"`. The UI change uses `"reset-corrupt"` to show NFR-06's message. Persistence is a separate `isPersistent()` flag because it can change after load (a later save hits the quota).
*Alternative:* throw a typed error on corrupt data. Rejected: the spec says load never throws, and every caller would need the same catch.

**3. Hand-written validator, no schema library.**
`parseLearnerState(unknown): LearnerState | null` checks every field (types, `C1`..`C9` module IDs, path values, status values, attempt fields, `hintsUsed` a non-negative integer, `confidence` absent or `"sure" | "unsure"`). It builds a new object from the known fields only, which also strips extra fields on save (the "only model fields" scenario). `Attempt.answer` is typed `unknown` in SE §6.3; it is accepted as any JSON value.
*Alternative:* zod or valibot. Rejected: a new runtime dependency for one shape, and the project has none so far beyond React and the router.

**4. One key, versioned inside the value.**
Keys use the prefix `avl-primer:`. The learner state lives at `avl-primer:learner`, with `schemaVersion: 1` inside the JSON. `STORAGE_INVENTORY` lists each key with a description; it is the single list the privacy notice (FR-ONB-05) will render. Reset removes every key with the prefix, not just the inventory keys, so a key added by a later change (event log metadata, settings) is cleared even if the inventory were missed — the inventory test catches that omission separately.
*Alternative:* version in the key name (`avl-primer:v1:learner`). Rejected: a version bump would leave the old key behind, and reset by prefix already covers cleanup.

**5. Fallback to memory on any backend error.**
Every backend call is wrapped. On the first failure the adapter switches to an internal `memoryBackend()` seeded with the current state, sets `isPersistent()` to false, and stays in memory for the session. It does not retry localStorage, so the student does not see progress appear and vanish.
*Alternative:* retry on each save. Rejected: a quota error repeats, and a half-working store is harder to explain to the student than "not being saved this session".

**6. Profile ID from an injected generator.**
`options.randomId` defaults to `crypto.randomUUID()`. Tests inject a counter to make IDs predictable where needed. It is not the seeded generator from `src/engine/random.ts`: that one is for repeatable item variants, and a repeatable profile ID would defeat its purpose.

**7. Source scan test for the single access point.**
`tests/state/storage-single-source.test.ts` scans `src/` the way `conventions-single-source.test.ts` does, allowing only `src/state/storage.ts`. An ESLint `no-restricted-globals` rule was considered, but `localStorage` is reached through `window.localStorage` too, and the scan test catches both forms with one pattern and matches the existing precedent.

## Risks / Trade-offs

- [A student types their real name as nickname] → Stored only locally, never exported, capped at 24 characters; the notice will advise against it (proposal question 3).
- [Corrupt data is overwritten, so a bug in the validator could wipe real progress] → The round-trip property test runs the validator over arbitrary valid states, so a validator that rejects valid data fails CI.
- [Two tabs open at once overwrite each other's saves] → Accepted for the prototype; last save wins. A `storage` event listener can be added in the UI change if the pilot shows it matters.
- [`crypto.randomUUID` needs a secure context] → The app is served over HTTPS or localhost. If it is missing, the default generator falls back to a random hex string from `crypto.getRandomValues`.

## Migration Plan

Nothing is stored today, so there is nothing to migrate. A future schema version 2 will add a migration step in `parseLearnerState` before the version check; until then, version 2 data is treated as corrupt.
