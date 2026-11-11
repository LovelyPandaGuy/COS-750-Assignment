# Proposal

## Open questions

1. **Resolved: SE requirement IDs.** The SE document (read after `poppler` was installed) has no requirement for the shell, the TopBar, the Aa menu or a skip link; the Aa menu and read-aloud are mentioned only in the wireframes. The change therefore serves the non-functional requirements: **NFR-02** (WCAG 2.2 AA for contrast, keyboard operation and target size, at least 44 px; no information by colour alone), **NFR-05** (no network requests after load), **NFR-04** (phone, tablet, desktop) and **FR-VIS-10** (44 px targets; usable on a 360 px wide screen). Tests are named after these. If you want a new FR for Aa or the shell added to the SE document, say so; nothing here depends on it. SE section 9 also says the dark theme is the first thing cut, which matches pinning light.
2. **Resolved: skip link included.** You asked for it. It is a WCAG 2.2 bypass-blocks measure under NFR-02, and it is an addition to the design: a link, hidden until focused, that moves focus to `main`. Its look uses tokens only (focus ring, `--bg-surface`, `--action-primary`). Its label is copy, so it lives in `src/content/shell.ts`. Flagged for you to read in the design source, since it is not in the wireframes.
3. **[OPEN] Text inside the Aa stub panel.** The wireframe gives the Aa button its label ("Aa · Display & read-aloud" on Start, "Aa" elsewhere) and says the menu will hold text size, read-aloud voice and speed, and reduced motion. It shows no panel text. The stub panel needs one line of copy such as "Display and read-aloud settings are coming." That is wording beyond the ID, so it goes in `src/content/` through `content-author` and is flagged for you to read. Not blocking.
4. **Assumed, not blocking: light theme first (D-none, design gap).** `tokens.css` has dark values, but the design index lists dark gaps (disabled, correct panel, not-quite-yet border, neutral tree node, pressed). So the app is pinned to light for now by `data-theme="light"` on `<html>` in `index.html`. The existing `:root:not([data-theme='light'])` selector already supports this. No theme switch, no dark verification. Dark is a later change after the gaps are settled in the design.
5. **Assumed, not blocking: fonts.** The design wants Atkinson Hyperlegible Next and Mono self-hosted. The font files are not in the repo, and I will not fetch them in a planning step. This change keeps `--font-sans` and `--font-mono` as they are (they fall back to `system-ui` and `ui-monospace`). Self-hosting is a separate change.
6. **Assumed, not blocking: no popover shadow.** The design names elevation e2 for menus but gives no value (`tokens.css`: `[OPEN]`). The Aa panel uses `--border-control` and `--bg-surface`, no shadow, and no invented value.
7. **Assumed, not blocking: the Vite starter CSS goes.** `src/index.css` and `src/App.css` still hold the starter's own colours and variables (`--text`, `--accent`, hard-coded hex). These conflict with "tokens only". The shell replaces them with token-based base styles.
8. **Assumed, not blocking: slots, not screens.** The wireframe TopBar differs per screen (breadcrumb, a status pill such as "Saved on this device", buttons such as Sandbox). Those labels are screen content and use unit names (U4) that the design still has to map to C modules. So TopBar takes the breadcrumb, pill and actions as props and renders what it is given. No screen copy is typed here.
9. **Assumed, not blocking: routing.** `react-router-dom` is installed but unused. The shell takes `children` and does not set up routes. Routing arrives with the first real screen.

## Why

Every screen in the wireframes sits inside the same AppShell and TopBar, and every control needs the same focus ring and 44 px targets (D3). Building the shell and tokens wiring first means later screen changes compose them and cannot invent styles. The Aa menu is in every top bar, so a stub now fixes its place and keyboard behaviour before its contents (text size, read-aloud, reduced motion) exist.

## What Changes

- Wire `src/ui/tokens.css` into the app, replace the Vite starter styles with token-based base styles, and pin the light theme.
- Add `AppShell` (skip link, banner, main, reading column) and `TopBar` (title, breadcrumb, status pill and action slots, Aa menu at the end).
- Add `SkipLink`: the first focusable element on every page; it moves focus to `main`.
- Add `AaMenu` as a stub: a 44 px button that opens a small panel with one line of flagged copy; Esc and outside click close it and return focus to the button.
- Confirm the single focus style (2 px ring, 2 px gap) from `tokens.css` and forbid component overrides.
- Replace the placeholder in `App.tsx` with the shell around the existing placeholder heading.

## Capabilities

### New Capabilities
- `app-shell`: tokens wiring, light theme, focus ring, AppShell, TopBar and the Aa menu stub.

### Modified Capabilities
None.

## Out of scope

Dark theme and any theme switch; self-hosted fonts; the contents of the Aa menu (text size, read-aloud, reduced-motion control); routing and any real screen; breadcrumb, pill and action copy; progress storage; elevation values; phone-specific layout beyond not breaking at 360 px width (FR-VIS-10) (no phone frames exist yet, design index item 4).

## Impact

- New: `src/ui/AppShell.tsx`, `src/ui/TopBar.tsx`, `src/ui/AaMenu.tsx`, `src/ui/SkipLink.tsx`, `src/ui/shell.css`, `src/content/shell.ts` (skip link label, stub copy and Aa label).
- Changed: `src/App.tsx`, `src/main.tsx` (import tokens), `src/index.css` and `src/App.css` (starter styles removed), `index.html` (`data-theme="light"`).
- Tests: `tests/ui/shell.test.tsx`, `tests/ui/aa-menu.test.tsx`, `tests/ui/styles.test.ts`. The existing `tests/app.test.tsx` and `tests/tokens.contrast.test.ts` must keep passing.
- No new dependencies. No other change touches the UI; `add-avl-insert-trace` is engine only.
