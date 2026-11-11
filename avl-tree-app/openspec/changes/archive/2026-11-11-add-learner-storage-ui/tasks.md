# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/state/learner-context.test.tsx` (`test-writer`) from every `learner-session` scenario, named after FR-ONB-03, FR-ONB-04 or NFR-06. Render `LearnerProvider` under `StrictMode` with an injected adapter (memory, always-throwing and quota-on-`setItem` backends, plus a counting wrapper for the one-load and no-extra-save scenarios). Verify it fails only because `src/state/LearnerContext.tsx` and `learnerReducer.ts` do not exist.
- [x] 1.2 Write `tests/ui/start-screen.test.tsx` (`test-writer`) from the `start-screen` scenarios for no sign-in, first visit, Start, resume, the module placeholder, the three messages, the pill, copy from content and axe in every state, named after FR-ONB-01, FR-ONB-03, FR-ONB-04, NFR-01, NFR-02 or NFR-06. Use `MemoryRouter` with `AppRoutes`, and read expected text from `src/content/`. Verify it fails only because the pages, components and content files do not exist, and that `tests/app.test.tsx` still passes (or report it if the heading change breaks it).
- [x] 1.3 Write `tests/ui/confirm-dialog.test.tsx` (`test-writer`) from "Reset asks first", "Focus stays in the dialog", "Cancel keeps progress", "Confirmed reset returns to the start", the keyboard-only scenario and the 44 px target scenario (stylesheet read). Verify it fails only because `ConfirmDialog` and the Start page do not exist.

## 2. Content

- [x] 2.1 Add `src/content/modules.ts` (`MODULE_TITLES` with the D1 titles, typed by `ModuleId`) and `src/content/start.ts` (StartPanel, ResumeCard, reset link, dialog, the three messages and both pills) with `content-author`. Flag all new wording in a header comment. Verify `npm run typecheck` passes, the "D1 titles" and "wording and style" scenarios pass, and no string contains error, fail, corrupt or invalid.

## 3. State

- [x] 3.1 Add `src/state/learnerReducer.ts` (state shape, `reset` and `persistence` actions, `hasProgress`) and `src/state/LearnerContext.tsx` (`LearnerProvider` taking `storage` and `initial`, `useLearner`, the save effect that skips the first run and then re-reads `isPersistent()`, and `reset()`). Load once in `src/main.tsx` before render. Verify `learner-context.test.tsx` passes and `storage-single-source.test.ts` still passes.

## 4. Screens

- [x] 4.1 Add routing to `src/App.tsx` (`HashRouter`, `LearnerProvider`, exported `AppRoutes` with `/`, `/module/:moduleId` and the fallback; `AppShell` per route with the saved or not-saved pill). Add `src/pages/ModulePlaceholder.tsx`. Verify the module placeholder, unknown-module and pill scenarios pass.
- [x] 4.2 Add `src/pages/Start.tsx`, `src/components/ResumeCard.tsx` and `src/components/StorageNotice.tsx`, with their styles in `src/ui/` (tokens only). Verify the first-visit, Start, resume, started-fresh, not-being-saved and no-sign-in scenarios pass, and that `tests/ui/styles.test.ts` still passes.
- [x] 4.3 Add `src/components/ConfirmDialog.tsx` (modal role and labels, focus to Cancel, Tab wrap, Escape cancels, `inert` on the page behind it) and wire the reset link, confirm and cancel paths in `Start`, including focus return and focus on the heading after a reset. Verify `confirm-dialog.test.tsx` and all of `start-screen.test.tsx` pass.

## 5. Review

- [x] 5.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`. Verify all pass, there are no new `[OPEN]` markers in `src/` and no new dependencies, and `src/state/storage.ts`, `src/state/learnerState.ts` and `src/engine/` are unchanged.
- [x] 5.2 Run the `reviewer` (fresh context) and `a11y-checker` subagents. By hand, do a keyboard-only run of first visit, resume, cancel and confirmed reset, a greyscale check, a 360 px width check, and a reload with storage blocked (private window). Verify the reports pass or their findings are resolved.

## Workflow follow-up

- Read and approve the flagged copy in `src/content/start.ts` (proposal questions 1 and 5), and answer proposal question 3 (both buttons on a return visit?). Record any decision in `docs/decisions.md`.
- Next changes: the PrivacyNotice and the footer notice link (FR-ONB-05, rendered from `STORAGE_INVENTORY`); the diagnostic and the unit hub, which replace the module placeholder; `add-event-log`, whose reset must also clear the event log.
- The user merges and archives; agents do not.
