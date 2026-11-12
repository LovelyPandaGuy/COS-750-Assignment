# Design

## Context

`src/ui/tokens.css` defines the light palette on `:root`. It defines the dark palette twice: in a `prefers-color-scheme: dark` block scoped to `:root:not([data-theme='light'])`, and in `:root[data-theme='dark']`. Nine colour tokens have no dark value (a comment lists them). `index.html` pins `data-theme="light"`, which is what `app-shell`'s "Light theme is pinned" requires.

Storage goes through `src/state/storage.ts`. It is the only module allowed to touch `localStorage` (`learner-storage`, "Single storage access point"). It already publishes `STORAGE_INVENTORY`, and its `reset()` removes every `avl-primer:` key. `main.tsx` boots the learner once, before render (`bootLearner`), and passes `storage` and `initial` to `App`. `App` falls back to its own boot when they are absent, which is how the UI tests render.

`AaMenu.tsx` is a stub: a button and a panel with one line of copy from `src/content/shell.ts`. Every component's colours come from tokens, and a test bans hex colours outside `tokens.css`, so switching the `data-theme` attribute restyles the whole app with no component changes.

## Goals / Non-Goals

**Goals:**
- One attribute on `<html>` decides the theme. One constant module holds the theme names and the default.
- No flash of the wrong theme on reload.
- Dark is complete and contrast-tested without inventing colours.

**Non-Goals:**
- Following `prefers-color-scheme` (proposal item 2). The media block stays in `tokens.css` but can never match, because `<html>` always carries `data-theme`.
- A general settings framework. The settings record holds only `theme` for now. Change 24 extends it.

## Decisions

### 1. Theme constants and applying them: `src/ui/theme.ts`
- `THEMES = ['light', 'dark'] as const` and `DEFAULT_THEME: Theme = 'light'`.
- `applyTheme(t)` sets `document.documentElement.dataset.theme`.
- `parseTheme(x: unknown): Theme` returns the default for anything that is not a known theme.

This is the one place a change to the default or the names happens (D18).

### 2. The nine gap tokens map to existing dark values
They go in one block after `:root[data-theme='dark']`, headed `/* ASSUMED dark values (add-dark-mode-toggle, D18): the design system states none. Replace on /design-import. */`. Each mapping copies a relationship the light theme already has:

| Token | Dark value from | Why (light relationship) | Lowest contrast |
| --- | --- | --- | --- |
| `--feedback-correct-bg` | `--mastery-secure-tint` (#16312F) | light correct-bg equals mastery-secure-tint | text 11.5:1 |
| `--feedback-correct-icon` | `--mastery-secure` (#4FC3B5) | light correct-icon equals mastery-secure | 6.5:1 on its panel |
| `--feedback-correct-border` | `--mastery-secure` (#4FC3B5) | the correct family's strong colour | 7.7:1 on surface |
| `--feedback-notyet-border` | `--border-control` (#7F879A) | the neutral control border | 4.57:1 on surface |
| `--feedback-notyet-icon` | `--mastery-notyet` (#A3AEC2) | light notyet-icon is close to mastery-notyet | 6.5:1 on its panel |
| `--tree-neutral` | `--text-secondary` (#A9B0C0) | light tree-neutral equals text-secondary | 7.6:1 on surface |
| `--disabled-text` | `--text-secondary` (#A9B0C0) | muted text | 8.4:1 on disabled-bg |
| `--disabled-bg` | `--bg-page` (#12151C) | a step back from the surface | n/a |
| `--action-primary-pressed` | `--action-primary-hover` (#B3BBFF) | the nearest stated state | surface text 9.0:1 |

The values are written as literals, not `var()`. This keeps the block self-contained for `/design-import`, and lets the parity and "reuses the palette" tests read plain values.

*Alternative:* derive new shades, such as a darker green for the correct border. This was rejected because CLAUDE.md says not to invent styles. Reusing stated values keeps every colour one the design system already chose.

### 3. The dark rules are not duplicated
The two existing dark blocks must stay identical (the comment says so). The assumed block is added only for `:root[data-theme='dark']`. The `prefers-color-scheme` block can no longer apply, so it gets no copy. Its comment is updated to say it is unused while the app pins `data-theme`. The parity test reads `[data-theme='dark']` plus the assumed block.

### 4. Settings storage in the storage module
`storage.ts` gains:
- `SETTINGS_KEY = 'avl-primer:settings'` and an inventory entry ("Your display choice: light or dark theme. It stays in this browser.").
- `createSettingsStorage(backend): { load(): Settings; save(s: Settings): void }`.

Every backend call is wrapped in try/catch. A failure switches to an in-memory value for the session and never throws (the same policy as the learner adapter). `load` parses JSON and passes `theme` through `parseTheme`, and it saves only `{ theme }`. The learner adapter's `reset()` already removes every app key, so the settings key goes with it without any change there.

### 5. Applied before the first render
`bootLearner()` also creates the settings storage and returns `settings` and `initialTheme`. `main.tsx` calls `applyTheme(initialTheme)` before `createRoot(...).render`, so the first paint already has the right theme. `index.html` keeps `data-theme="light"` for the moment before scripts run. With a stored dark theme there is a brief light frame only if the script is slow, and the bundle is a single local file.

### 6. `ThemeProvider` and the switch
`App` gains optional `settings` and `initialTheme` props, falling back to `bootLearner()` as it does now. A small `ThemeProvider` holds `theme` in state, calls `applyTheme` in an effect, and exposes `setTheme(t)`, which saves through the settings storage.

`ThemeSwitch.tsx` is a native `<button role="switch" aria-checked>` labelled from `shellCopy.darkTheme`, with a 44 px target from `--target-min`. A native button means Space and Enter work without extra code.

`AaMenu` renders the switch above the existing placeholder line. The line's copy moves to "Read-aloud and text size are coming." in `src/content/shell.ts`.

### 7. Reset returns to Light at once
`LearnerProvider` gains an optional `onReset` callback, called after `storage.reset()`. `App` passes `() => setTheme(DEFAULT_THEME, { save: false })`; the key is already gone, so there is nothing to save. This keeps the theme out of learner state and the learner state out of the theme.

## Risks / Trade-offs

- [The assumed tokens may not match the designer's intent.] → One marked block, a decisions row, and a `/design-import` replaces it. Contrast tests guard readability meanwhile.
- [The SVG tree or a component might use a light-only literal.] → The existing "no hex outside tokens" test covers CSS. The task list adds a check for `fill="#` and `stroke="#` in `.tsx` files. The manual greyscale and colour-vision checks (D25) run in dark too.
- [The not-quite-yet border at 4.57:1 is the tightest pair.] → It is above 3:1 for a non-text border. Its dashed style also carries meaning, so it is not colour alone.
- [The jsdom axe run does not compute real colours.] → Contrast is checked from the token values by the existing contrast test, extended to dark.

## Migration Plan

Additive for users: Light stays the default and stored learner data is untouched. Rollback is reverting the change. A stored settings key is then simply ignored, and reset or the inventory cleans it up.
