# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Each item below is an assumption kept in one place. Please read them before `/opsx:apply`.

1. **Note: dark theme moves from stretch to planned (user request, 12 Nov).** The plan, the SE document and D26 all make the dark theme the first thing cut if time is short. You have asked for it now, so this change builds it. If time gets short later, reverting this one change is still the cut. An assumed row in `decisions.md` records this.
2. **Assumed, not blocking: two choices, Light by default (user choice, 12 Nov).** The Aa menu gets one switch, "Dark theme", which is off by default. There is no "match my device" option, so the operating-system setting never changes the theme. Nobody's screen changes until they flip the switch. The two theme names and the default are one constant each.
3. **Flagged for the design to confirm: the 9 missing dark tokens (user choice, 12 Nov).** The design system gives no dark value for these 9 tokens:
   - `--disabled-text` and `--disabled-bg`
   - `--feedback-correct-bg`, `--feedback-correct-border` and `--feedback-correct-icon`
   - `--feedback-notyet-border` and `--feedback-notyet-icon`
   - `--tree-neutral`
   - `--action-primary-pressed`

   Each one is mapped to an existing dark token, copying the relationship the light theme already has. For example, light `--feedback-correct-bg` equals `--mastery-secure-tint`, and light `--tree-neutral` equals `--text-secondary`. No new colour is introduced. The mappings sit in one marked block in `tokens.css`, contrast tests cover every pair (the lowest is 4.57:1), and a `/design-import` with real values replaces the block. See design decision 2 for the table.
4. **Assumed, not blocking: the choice is stored as a setting (D16).** `localStorage` already holds "progress and settings" behind the storage adapter. The theme gets its own key, `avl-primer:settings`, read and written only by the storage adapter module, and listed in the stored-data inventory. It holds only the theme, so it adds nothing personal.
5. **Assumed, not blocking: reset returns to Light (FR-ONB-04).** "Reset clears all stored data" already removes every app-prefixed key, so the setting goes too. The app switches back to Light at once instead of waiting for a reload.
6. **Assumed, not blocking: the Aa menu keeps its read-aloud placeholder.** The panel gains the switch, and the "coming" line stays for the read-aloud and text-size controls that change 24 adds (D26).

## Why

Some students study in the evening or have light sensitivity, and the design system already defines a dark palette. Today the app is pinned to light (`app-shell`, "Light theme is pinned"), and the Aa menu is a stub with no controls.

## What Changes

- **Theme switch in the Aa menu.** A "Dark theme" switch (on or off), reachable by keyboard, pointer and touch, with a 44 px target. Flipping it changes the whole app at once.
- **Theme applied before the first paint.** The stored choice is read before React renders, so a reload in dark mode never flashes light.
- **Theme stored as a setting.** One new app-prefixed key, read and written only through the storage adapter, validated on load (an unreadable value means Light), listed in the inventory, and cleared by reset. If storage is unavailable, the switch still works for the session.
- **Dark tokens complete.** The 9 missing dark tokens get assumed values (item 3). A test checks that every colour token the light theme defines also has a dark value. The dark contrast pairs grow to match the light ones.
- **BREAKING (spec only):** `app-shell`'s "Light theme is pinned" requirement is removed. Light stays the default.
- Serves NFR-02 (contrast in both themes), NFR-05 (the stored key is inventoried, and there are no network calls), FR-VIS-10 (the control strip and Aa targets in both themes), D3, D16, D25 and D26.

## Capabilities

### New Capabilities
- `display-theme`: the theme choice (light or dark), where it is shown, how it is applied before the first paint, stored, validated and reset, and the completeness and contrast of the dark tokens.

### Modified Capabilities
- `app-shell`:
  - "Light theme is pinned" is removed and replaced by `display-theme`.
  - "Aa menu stub" is modified: the panel now holds the theme switch as well as the placeholder line.

## Out of scope

- A "match my device" option and any reaction to `prefers-color-scheme` (item 2).
- Text size, read-aloud, reduced motion and the rest of the Aa menu (change 24).
- New colours or a dark redesign. Only the 9 gaps are filled, by mapping (item 3).
- Elevation tokens (still `[OPEN]` in the design).
- Per-module or per-screen themes.

## Impact

- New:
  - `src/ui/theme.ts`: theme names, the default, and applying a theme to `<html>`.
  - `src/ui/ThemeSwitch.tsx`.
- Changed:
  - `src/ui/tokens.css`: the assumed dark block.
  - `src/state/storage.ts`: the settings key, load and save, and the inventory entry.
  - `src/main.tsx`: the theme is applied before render.
  - `src/ui/AaMenu.tsx`: the switch.
  - The reset path in learner state: back to Light.
  - `src/content/shell.ts`: the switch label.
  - `tests/tokens.contrast.test.ts` and `tests/ui/aa-menu.test.tsx`, updated by the test-writer.
- `index.html` keeps `data-theme="light"`, so the default holds even before scripts run.
- No new dependencies and no network calls.
