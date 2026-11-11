# Design

## Context

`src/state/storage.ts` already provides `createLearnerStorage(backend)` with `load() → { state, status }`, `save`, `reset` and `isPersistent()`, and `browserBackend()` / `memoryBackend()`. Load never throws. On its first backend failure it falls back to memory. `src/App.tsx` renders `AppShell` around a placeholder heading. `TopBar` already takes a `status` pill and `actions` as props. `main.tsx` renders inside `StrictMode`. `react-router-dom` 7 is installed but not used. There are no `src/pages/` or `src/components/` folders yet; SE §6.2 places them there. Tests use Vitest, jsdom, Testing Library and vitest-axe. See proposal.md for scope and the specs for behaviour.

## Goals / Non-Goals

**Goals:**
- Screens never call the storage adapter directly. They use one hook, so later screens get resume and save for free.
- Every test can inject storage (a memory or throwing backend) and the starting route, without touching jsdom's `localStorage`.
- The storage adapter and learner model are used unchanged.

**Non-Goals:**
- No general reducer. Only `reset` exists. Actions such as recording an attempt or moving module come with the screens that need them.
- No cross-tab sync (the `storage` event). Last save wins, as accepted in `add-learner-storage`.
- No dialog library and no portal.

## Decisions

**1. Load once, outside React.**
`main.tsx` calls `bootLearner()` (`src/state/boot.ts`), which creates the adapter over `browserBackend()` and calls `load()`, before `createRoot().render`. `App` without props (the shell tests) falls back to one cached `bootLearner()` per page. It passes `{ storage, initial }` to `<App>`. `LearnerProvider` takes these as props and never calls `load()` itself.
*Why:* `StrictMode` runs `useState` initialisers and effects twice in development. A load inside render would run twice. On empty or corrupt storage, the first run writes a fresh state and the second reads it back as `"restored"`, so the NFR-06 message would be lost. The "status survives re-rendering" scenario guards against this.
*Alternative:* a module-level singleton inside `LearnerContext.tsx`. Rejected because tests would share it across files and could not inject a backend.

**2. `LearnerContext` plus a small reducer.**
`learnerReducer.ts` (pure) holds `{ learner: LearnerState, loadStatus: LoadStatus | 'reset-by-user', persistent: boolean }` with two actions. `reset` replaces the learner and sets `loadStatus: 'reset-by-user'`. `persistence` updates the flag. `LearnerContext.tsx` exposes `useLearner()`, which returns `{ learner, loadStatus, persistent, reset() }`. A `useEffect` keyed on `learner` calls `storage.save` and then dispatches `persistence` with `storage.isPersistent()`. That is how a quota failure during the session reaches the pill. The effect skips the first run, because load already saved (the "no extra save on start" scenario). `reset()` calls `storage.reset()` and dispatches its result. The following save is then a harmless rewrite of the same value.
*Alternative:* save inside the reducer. Rejected because reducers must stay pure; StrictMode also double-invokes them.

**3. Hash routing, routes in their own component.**
`App` is `<HashRouter><LearnerProvider …><AppRoutes/></LearnerProvider></HashRouter>`. `AppRoutes` declares `/` → `Start`, `/module/:moduleId` → `ModulePlaceholder`, and `*` → redirect to `/`. `ModulePlaceholder` redirects to `/` when the ID is not in `MODULE_IDS`. Tests render `<MemoryRouter initialEntries={…}>` around the provider and `AppRoutes`.
*Why hash:* the app is a static build with no server (SE §3). A browser-history URL such as `/module/C4` gives a 404 on reload unless the host is configured. A hash URL needs no host setup and makes no network call.
*Alternative:* no router, with a `screen` value in state. Rejected because every later screen would need routing anyway, and the shell change deferred routing to "the first real screen", which is this one.

**4. Progress rule as a pure function.**
`hasProgress(state)` returns true when `currentModule !== 'C1'`, `completedModules.length > 0` or `attempts.length > 0`. It lives in `learnerReducer.ts` with the other pure state helpers, not in `learnerState.ts`, which is out of scope. The Start page uses it to pick the first-visit or return layout and to show the reset link.

**5. ConfirmDialog: a hand-built modal.**
`ConfirmDialog` renders `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (title) and `aria-describedby` (body). On open it focuses Cancel. Tab and Shift+Tab wrap between its focusable elements, and Escape calls `onCancel`. While it is open, `Start` sets `inert` on the AppShell's banner and on the page content outside the dialog. To make that possible, the dialog is rendered as a sibling of the page content inside `main`, not inside the content. On close the caller returns focus to the reset link through a ref. Cancel uses the secondary button style and Reset the primary. Nothing is red. There is no scrim token, so the backdrop covers the page in `--bg-page` rather than inventing a translucent colour.
*Alternative:* the native `<dialog>` with `showModal()`, which traps focus and makes the page inert for free. Rejected for now: jsdom support for `showModal` and top-layer inertness is incomplete, so the focus-trap and inert scenarios could not be tested without a browser. Revisit when the Playwright suite exists.

**6. Status messages: one component, one live region.**
`StorageNotice` renders a `role="status"` region that is always in the DOM, so screen readers pick up later changes. Inside it, each line applies on its own and they show in this order: the reset message after a reset by the user, the started-fresh message for `"reset-corrupt"`, and the not-being-saved message when `persistent` is false. A reset with full storage, or corrupt data with blocked storage, shows two lines. Each line has a decorative icon (`aria-hidden`) and words. Styling uses `--bg-surface`, `--border-control` and `--text-primary`, never the not-quite-yet or not-yet tokens, which mean "wrong answer" or "skill not yet" elsewhere. After a confirmed reset, `Start` moves focus to its `h1` (`tabIndex={-1}`) and the reset line announces through the live region.

**7. TopBar pill through the existing prop.**
`AppRoutes` wraps each route in `AppShell` with `status={persistent ? copy.savedPill : copy.notSavedPill}`. TopBar is not changed. The pill text is the only signal in the pill, so colour carries nothing.

**8. Content files.**
`src/content/start.ts` holds the StartPanel heading, intro, bullets and button, the ResumeCard lines (with a `{module}` slot filled by the component), the reset link, the dialog title, body and buttons, the three messages and the two pill texts. `src/content/modules.ts` holds `MODULE_TITLES: Record<ModuleId, string>` with the D1 titles. It imports the `ModuleId` type from `src/state/learnerState.ts`, so a missing module is a type error. Both files are written by `content-author`, and new wording is flagged in a header comment, as in `src/content/shell.ts`.

## Risks / Trade-offs

- [The hand-built focus trap misses an edge case that the native dialog handles, such as focus arriving from outside by a pointer click] → `inert` on the rest of the page stops pointer and keyboard focus from reaching it. The a11y-checker and the keyboard-only run check this by hand. The native dialog is the fallback once browser tests exist.
- [`inert` is not applied in jsdom, so a test that checks it could pass without the page being inert] → The test checks the `inert` attribute on the banner and page content, which is what browsers act on, and axe runs with the dialog open.
- [Hash URLs look less clean, and the hash also holds the module] → Resume always comes from storage, not the URL. A reload on `#/module/C4` shows C4, which is correct.
- [Copy is new wording beyond the ID] → It is flagged in the content files and in proposal questions 1 and 5 for the user to read before merge.
- [Two tabs: a reset in one tab is not seen by the other until it reloads] → Accepted for the prototype (see Non-Goals). The other tab's next save rewrites its own state.

## Migration Plan

Nothing to migrate. The stored format and keys are unchanged. Rollback means reverting `App.tsx` and `main.tsx` to the placeholder; stored data stays valid.
