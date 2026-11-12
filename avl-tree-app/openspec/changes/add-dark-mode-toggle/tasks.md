# Tasks

## 1. Red tests

- [x] 1.1 Write the non-UI tests for every `display-theme` scenario that needs no rendering, named after the NFR or FR each serves.
  - `tests/display-theme.test.ts`:
    - `parseTheme` and the default
    - the settings storage: save, load, a bad value, a backend that throws, and only `{ theme }` stored
    - the inventory lists the settings key
    - learner reset removes the key
    - `index.html` keeps `data-theme="light"`
  - Extend `tests/tokens.contrast.test.ts`:
    - light and dark colour-token parity
    - the assumed block sets exactly the nine tokens, each reusing an existing dark value
    - the new dark pairs: both feedback panels (text, icon, border), disabled, pressed, tree-neutral

  Verify they fail only because the code and tokens do not exist yet.
- [x] 1.2 Write the UI tests from every UI scenario in `display-theme` and the modified `app-shell` "Aa menu stub" requirement.
  - Update `tests/ui/aa-menu.test.tsx` for the panel's new contents.
  - Add `tests/ui/theme-switch.test.tsx`:
    - turning dark on and off, by click and by Space, with focus kept
    - the theme persisting across screens
    - restored before render (boot with a stored dark theme)
    - the switch working when storage throws
    - nothing stored by opening and closing the menu
    - reset returning to light
    - axe with the switch off and on
  - Add a source scan for `fill="#` and `stroke="#` in `src/**/*.tsx`.

  Verify the new tests fail for the expected reason and every other existing test still passes.

## 2. Tokens and theme module

- [ ] 2.1 Add the assumed dark block to `src/ui/tokens.css` (design decision 2) and update the `prefers-color-scheme` block's comment (decision 3). Add `src/ui/theme.ts` (`THEMES`, `DEFAULT_THEME`, `applyTheme`, `parseTheme`). Verify the parity, assumed-block and contrast tests pass in both themes.

## 3. Storage and boot

- [ ] 3.1 Add `SETTINGS_KEY`, the inventory entry and `createSettingsStorage` to `src/state/storage.ts` (decision 4). Verify the settings storage, inventory and reset tests pass, and that every `learner-storage` test still passes.
- [ ] 3.2 Return `settings` and `initialTheme` from `bootLearner()`, and call `applyTheme` in `src/main.tsx` before render (decision 5). Verify the boot test passes.

## 4. UI

- [ ] 4.1 Add `ThemeProvider` and the optional `settings`/`initialTheme` props to `App`, and `onReset` to `LearnerProvider` (decisions 6 and 7). Verify the reset-to-light test and all existing learner-session and start-screen tests pass.
- [ ] 4.2 Add `src/ui/ThemeSwitch.tsx` and render it in `AaMenu`. The switch label and the new placeholder line come from `src/content/shell.ts`. Style the switch from tokens in `src/ui/shell.css`. Verify the theme-switch and Aa menu tests pass.

## 5. Review

- [ ] 5.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`. Verify:
  - all of them pass
  - there are no new `[OPEN]` markers
  - `localStorage` is still referenced only in `src/state/storage.ts`
- [ ] 5.2 Run the `reviewer` (fresh context) and `a11y-checker` roles. Then check by hand, in both themes:
  - a keyboard-only run of the start screen, a C3 practice step and a C8 practice step
  - a greyscale screenshot
  - the colour-vision emulation (D25)
  - the switch at 360 px by touch
  - a reload in dark with no light flash

  Verify the reports pass or their findings are resolved.

## Workflow follow-up

- Add assumed rows to `.claude/docs/decisions.md` for proposal items 1 to 5 (dark moves from stretch to planned, Light default with two choices, the nine mapped tokens, the settings key, reset to Light). Note under D26 that the dark theme is now built.
- Ask the design owner to confirm or replace the nine assumed dark values. Then run `/design-import`.
- When archiving, update `app-shell`'s Purpose by hand: it still says "the light theme".
- The user merges and archives; agents do not.
