# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/ui/styles.test.ts` from the "Tokens are the only source of style", "Light theme is pinned" and "One focus style" scenarios (no hex or `rgb(` outside `tokens.css`, starter variables gone, tokens imported first, `data-theme="light"`, single focus rule, no outline overrides, 44 px and gutter rules); verify it fails only for the reasons the spec says.
- [x] 1.2 Write `tests/ui/shell.test.tsx` (named after NFR-02, NFR-04, FR-VIS-10 and NFR-05 as in the spec) from the "Skip link", "AppShell landmarks" and "TopBar content" scenarios (skip link first in tab order and moves focus to `main`, landmark order, slot order, absent optional parts, title not a heading, axe); verify it fails only because `AppShell`, `TopBar` and `SkipLink` do not exist, and that `tests/app.test.tsx` and `tests/tokens.contrast.test.ts` still pass.
- [x] 1.3 Write `tests/ui/aa-menu.test.tsx` from the "Aa menu stub" scenarios (name, `aria-expanded`, click, Enter, Space, Escape returns focus, outside click, no storage or network, copy from content, axe open); verify it fails only because `AaMenu` does not exist.

## 2. Build

- [x] 2.1 Add `src/content/shell.ts` (skip link label, Aa button name and the stub panel line) with `content-author`; flag the wording for the user to read.
- [x] 2.2 Replace `src/index.css` and `src/App.css` with token-based base styles, import `tokens.css` first in `src/main.tsx`, and add `data-theme="light"` to `index.html`; verify the style tests pass.
- [x] 2.3 Add `src/ui/AaMenu.tsx` and its rules in `src/ui/shell.css`; verify `aa-menu.test.tsx` passes.
- [x] 2.4 Add `src/ui/SkipLink.tsx`, `src/ui/TopBar.tsx` and `src/ui/AppShell.tsx`, and use them in `src/App.tsx` around the existing placeholder heading; verify `shell.test.tsx` and `app.test.tsx` pass.

## 3. Review

- [x] 3.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; verify all pass with no new `[OPEN]` markers in `src/`.
- [ ] 3.2 Run the `reviewer` (fresh context) and `a11y-checker` subagents; do the keyboard-only run, a greyscale check and a 360 px width check by hand; verify the reports pass or findings are resolved.

## Workflow follow-up

- Answer the remaining `[OPEN]` question (Aa panel copy) and read the skip link label, then record any decision in `docs/decisions.md`.
- Next UI changes: self-hosted fonts, the dark theme once the token gaps are settled, then the Start screen.
- The user merges and archives; agents do not.
