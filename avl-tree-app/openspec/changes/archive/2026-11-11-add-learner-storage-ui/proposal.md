# Proposal

## Open questions

1. **Assumed, not blocking: Start screen copy vs D1 and D3.** Wireframe 1b says "A 20–30 minute warm-up" and "6 short units". D3 says about one hour in nine resumable chunks and D1 fixes nine modules, C1 to C9, and D1 and D3 win. The ID content has no Start screen wording. So the StartPanel copy is new wording, written by `content-author` in `src/content/start.ts` to match D1 and D3, and flagged for you to read. The three wireframe bullets that do not conflict with a decision (private, retryable, never graded; you finish with questions for the lecture) are kept close to the wireframe.
2. **Assumed, not blocking: the ResumeCard names a module, not an activity (D1).** Wireframe 1b shows "You stopped at U3 · Check (2 of 3)". The learner state (SE §6.3) records only `currentModule`, not the activity or item inside it. So the card says where the student stopped by module ID and D1 title (for example "C4 Search"). Activity-level resume needs a new state field and waits for the module hub change.
3. **Assumed, not blocking: what counts as "saved progress".** Wireframe 1b note 2 shows the ResumeCard "only if saved progress". A profile is saved on first launch (FR-ONB-02), so "a stored state exists" is not enough. This change counts progress as any of: current module other than C1, at least one completed module, at least one attempt. With progress, Resume is the main action and the first-visit Start button is hidden. To start over, the student resets. The reset link shows only when there is progress, since there is nothing to delete before then. Please say if you want both buttons on the return visit.
4. **Assumed, not blocking: where Start and Resume go (SE §6.5).** First visit goes to the diagnostic in C1 and Resume goes to the unit hub (wireframe 1b notes 1 and 2). Neither screen exists yet. This change adds routing (`react-router-dom`, already installed) with the Start route and one placeholder module route, `/module/:moduleId`, which shows only the module's D1 title. Later changes replace the placeholder. First visit to C1 takes one click (NFR-01, within 3 clicks).
5. **Assumed, not blocking: the NFR-06 messages and the reset confirmation.** NFR-06 asks for "a message" when stored data was bad. The design has none. This change adds three short, low-anxiety status messages on the Start screen: "started fresh" (corrupt data), "not being saved" (storage blocked or full) and "progress reset". It also adds a TopBar pill, "Saved on this device" or a not-saved variant, which wireframe 1e shows from the hub onwards. The wording is new, written by `content-author` and flagged. None of it uses red or "error" or "fail" wording.
6. **Assumed, not blocking: dialog styling (design gap).** Wireframe 1b note 4 fixes the behaviour: a two-step reset, focus trapped, Esc cancels. The design system has no ConfirmDialog spec, and elevation e2 has no value (`tokens.css` `[OPEN]`). The dialog uses existing tokens only: `--bg-surface`, `--border-control`, `--radius-md` and no shadow. Neither button is red. No new token is invented.
7. **Carried over, not blocking: nickname (add-learner-storage question 3).** This change adds no nickname entry or display. That question stays open in the storage change.

No `[OPEN]` item blocks the specs.

## Why

The storage layer (`add-learner-storage`) can load, validate, save and reset learner state, but nothing in the app uses it yet. A student cannot resume after a reload (FR-ONB-03) or reset (FR-ONB-04), and the NFR-06 "message instead of crashing" is not shown. The Start screen is the first real screen and the entry point for both. Building it now also fixes how every later screen reads and writes learner state.

## What Changes

- Add `LearnerContext` (SE §6.2): a provider that loads learner state once at startup, saves each change through the existing StorageAdapter, exposes the load status and persistence flag, and offers `reset()`.
- Add a minimal `learnerReducer` with only the actions this change needs (load result, reset). Later changes add their own actions.
- Add routing: the Start route and a placeholder module route.
- Add the Start screen (wireframe 1b): StartPanel with the first-visit Start button, ResumeCard shown only when there is saved progress, ResetProgressLink and ConfirmDialog.
- Add the NFR-06 status messages (started fresh, not being saved) and a progress-reset message, plus the TopBar saved/not-saved pill.
- Add Start screen and module title copy to `src/content/` (flagged for you to read).
- Serves FR-ONB-01 (Must; no credential field), FR-ONB-03 (Must; UI side of resume), FR-ONB-04 (Should; confirmation and return to start), NFR-06 (Reliability; the message), NFR-01 (first-visit click count) and NFR-02 (dialog keyboard and focus, axe). No learning outcome directly.

## Capabilities

### New Capabilities
- `learner-session`: the app-wide learner state in React: one load at startup, saving on change, load status and persistence flag, reset.
- `start-screen`: the Start screen. It covers first visit vs return visit, the ResumeCard, reset with confirmation, and the storage status messages and pill.

### Modified Capabilities
None. The `learner-storage` adapter is used as it is; its requirements do not change.

## Out of scope

The PrivacyNotice and the footer notice link (FR-ONB-05). The diagnostic, the unit hub and any real module content. Activity-level resume. Nickname entry or display. The hero diagram (it needs TreeView). The SQLite event log and clearing it on reset (`add-event-log`). The Playwright resume test (SE §8, Should). The dark theme. Changes to `src/state/storage.ts` or `src/state/learnerState.ts`. No engine file is touched.

## Impact

- New: `src/state/learnerReducer.ts`, `src/state/LearnerContext.tsx`, `src/pages/Start.tsx`, `src/pages/ModulePlaceholder.tsx`, `src/components/ConfirmDialog.tsx`, `src/components/ResumeCard.tsx`, `src/components/StorageNotice.tsx`, styles in `src/ui/` (tokens only), `src/content/start.ts` and `src/content/modules.ts` (D1 titles).
- Changed: `src/App.tsx` (router plus provider), `src/main.tsx` (one load before render), `tests/app.test.tsx` expectations only if the heading changes (test-writer).
- New tests: `tests/state/learner-context.test.tsx`, `tests/ui/start-screen.test.tsx`, `tests/ui/confirm-dialog.test.tsx`.
- No new dependencies. `react-router-dom` is already in `package.json`.
- Depends on `add-learner-storage` (complete, not archived) and `add-design-tokens-and-shell` (one review task left). Neither is changed.
