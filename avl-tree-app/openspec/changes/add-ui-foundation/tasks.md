# Tasks

Roles follow CLAUDE.md. Test-writer works in `tests/` only. Implementer works in `src/` except `src/content/`, plus config files. Content-author works in `src/content/` only. Twelve tasks, which is slightly over the ten-task guide. A split along group 5 (contracts and stubs) into `add-ui-contracts` is possible if you prefer.

## 1. Failing tests (test-writer; commit as red)

- [x] 1.1 Write the Vitest tests for every `ui-foundation` scenario and the changed `app-shell` scenarios. The files:
  - `tests/ui/base/button.test.tsx`
  - `tests/ui/base/outcome-chip.test.tsx`
  - `tests/ui/base/mastery-badge.test.tsx`
  - `tests/ui/base/base-css.test.ts`
  - `tests/ui/fonts.test.ts`
  - `tests/ui/breakpoints.test.ts`
  - `tests/ui/contracts.test.tsx` (including the `expectTypeOf` two-way checks and the stub-list check)
  - `tests/ui/stylelint.test.ts` (with fixtures in `tests/fixtures/stylelint/`)
  - the new progress-slot cases in `tests/ui/shell.test.tsx`

  Name the tests after NFR-02, NFR-04, NFR-05, FR-VIS-10, D3 and D25. Verify: `npx vitest run tests/ui` fails only on the new tests, for missing modules or behaviour, and every existing test still passes.
- [x] 1.2 Write the Playwright specs in `tests/visual/` for widths and themes, greyscale, no horizontal scroll, fonts loaded, no off-origin request, and the gallery not being in the build. Exclude `tests/visual/**` from Vitest. Verify: `npm test` is unaffected, and the specs fail because there is no gallery and no config yet. Commit groups 1.1 and 1.2 as the red tests.

## 2. Fonts and breakpoints

- [x] 2.1 Add `src/ui/fonts/`: the Atkinson Hyperlegible Next 400 and 700 and Mono 400 woff2 files, `OFL.txt`, and `fonts.css` with `@font-face` rules using `font-display: swap`. Import it second in `src/main.tsx`. Verify: `tests/ui/fonts.test.ts` passes, and `npm run build` output references only same-origin font URLs.
- [x] 2.2 Add `src/ui/breakpoints.ts` with phone 390, tablet 768 and desktop 1366, and the matching comment in `tokens.css`. Verify: `tests/ui/breakpoints.test.ts` passes.

## 3. TopBar progress area

- [x] 3.1 Add the optional `progress` and `progressLabel` props to `TopBar` (a labelled `nav`, placed after the breadcrumb), and the phone wrap rule in `shell.css` with `(min-width: 768px)`. Verify: `tests/ui/shell.test.tsx` and `tests/ui/aa-menu.test.tsx` pass, and every existing caller compiles unchanged (`npm run typecheck`).

## 4. Base components

- [x] 4.1 Content-author: write `src/content/base.ts` with the Bloom words, the mastery words, "since your last try", and the change phrase for screen readers. Flag each beyond ID for G3. Verify: the content tests in `tests/ui/base/mastery-badge.test.tsx` pass, and `npm run validate:content` passes (if it exists).
- [x] 4.2 Implementer: add `src/ui/base/Button.tsx`, `OutcomeChip.tsx`, `MasteryBadge.tsx`, `base.css` and `index.ts`. Use per-state custom properties, with the assumed pressed and hover values for secondary, quiet and chip (proposal, open question 3). Use no outline rules. Put any transitions under `prefers-reduced-motion: no-preference`. Verify: `tests/ui/base/*` pass, including axe for every state.

## 5. Contracts and stubs

- [x] 5.1 Add `src/ui/contracts.ts` (19 re-exported prop types, 26 new interfaces from the frames, and the `STUBBED` list) and `src/ui/stubs/` (26 placeholder components). Verify: `tests/ui/contracts.test.tsx` passes and `npm run typecheck` is clean.

## 6. Test harness

- [x] 6.1 Add stylelint (dev dependency) and `.stylelintrc.json` per design decision 6. Set `lint` to `eslint . && stylelint "src/**/*.css"`. Replace the three existing literals: `module.css` radius uses `var(--radius-md)`, and `readiness.css` `0.9em` uses the label type token, with print `pt` allowed by the override. Verify: `tests/ui/stylelint.test.ts` passes and `npm run lint` exits 0.
- [x] 6.2 Add the development-only `gallery.html` and `src/gallery/`, with every base-component state in both themes and forced states per design decision 7. Add `@playwright/test`, `playwright.config.ts` (three projects, localhost web server, off-origin requests fail) and the `test:visual` script. Generate and commit the baselines for the 6 width-and-theme pairs plus greyscale. Verify: `npm run test:visual` passes on a second run, and `npm run build` has no gallery in `dist/`.

## 7. Record and verify

- [x] 7.1 Add assumed rows D92 onwards to `.claude/docs/decisions.md`, one for each of these:
  - the progress slot
  - breakpoints
  - the pressed and hover defaults
  - the lane split
  - the baseline OS
  - fonts
  - stylelint replacing the "existing rule"
  - contracts only for frames 1b to 1o

  Also update `.claude/docs/design/INDEX.md` "Design-system gaps", since the fonts are done. Verify: each assumption in the proposal has a row.
- [ ] 7.2 Full check: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:visual` and `openspec validate add-ui-foundation --strict` all pass. Then the reviewer and a11y-checker pass, and you do the manual checks:
  - a keyboard-only run of the gallery
  - the colour-vision emulation check (D25), in protanopia, deuteranopia, tritanopia and achromatopsia

  Record the quality-bar results in the review notes.

## Workflow follow-up

- You merge, then run `/opsx:archive add-ui-foundation`. Agents do not archive.
- Later changes move existing screens from the old button classes onto `Button`, and replace stubs as each component is built.
