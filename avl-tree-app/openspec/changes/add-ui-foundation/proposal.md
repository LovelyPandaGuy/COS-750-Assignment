# Proposal

## Open questions

Each is tied to a row in `.claude/docs/decisions.md`. Items marked **[OPEN]** are places where the design is silent; each one has an assumed default kept in one place (D18), so none of them blocks the change.

1. **[OPEN] The TopBar's "revealed-structure progress area" (D20, D23; design index item 2).** Neither the design system nor the wireframes show a progress area in the TopBar. Frame 1e has a ProgressMap on the hub, and the wireframes still use units U0 to U5, not C1 to C9. This change adds an empty, labelled slot to the TopBar and leaves what goes in it to a screen change. Assumed default: the slot takes any content, is absent when not given, and sits between the breadcrumb and the status pill. Question for the design: what the area shows (modules revealed so far, the current step, or both) and whether it shows on Start.
2. **[OPEN] Breakpoints (D3, NFR-04, FR-VIS-10).** The design gives no breakpoints. The wireframes are 1366×768 only, and the phone frames are still missing (design index item 4). The widths 390, 768 and 1366 come from `docs/design/quality-bar.md` (line 4). Assumed default: mobile first, with two `min-width` queries at 768 px and 1366 px. CSS custom properties cannot be used inside `@media`, so the widths live in one TypeScript constant and in a lint allow-list, and `tokens.css` documents them in a comment.
3. **[OPEN] Pressed and hover for secondary and quiet buttons, and hover for OutcomeChip (D25).** The design system shows Default, Hover, Focus, Pressed and Disabled for all three buttons, but `tokens.css` has a pressed value only for primary. It says only "Hover adds an underline" for quiet. Assumed default (D18): secondary pressed uses `--action-primary-tint`, and quiet and interactive OutcomeChip hover add an underline. Each value is one rule in `src/ui/base/base.css`.
4. **[OPEN] Elevation e1 and e2 (design-system gap).** Still not specified. No base component in this change uses elevation, so nothing is invented.
5. **[OPEN] The two lanes (D18).** The brief says two developers will build in parallel but does not say how the work splits. Assumed default: by wireframe frame. Lane A is tree and learning (1f, 1g, 1h, 1m, 1n). Lane B is flow and assessment (1b to 1e, 1i to 1l, 1o). The contracts cover every component named in frames 1b to 1o, so the split can change without changing this change.
6. **[OPEN] The operating system for the screenshot baselines.** Pixel baselines differ between macOS, Windows and Linux. Assumed default: baselines are made on macOS and committed, and visual tests run through their own script (`npm run test:visual`), not in `npm test`. The team should confirm which OS each developer uses. If the OSes differ, the follow-up is to run Playwright in its Docker image.
7. **Resolved: SE IDs.** The SE document has no FR for the shell or the base components. The change serves:
   - **NFR-02:** WCAG 2.2 AA (contrast, keyboard, targets, nothing by colour alone).
   - **NFR-04:** phone, tablet and desktop.
   - **NFR-05:** no network after load.
   - **FR-VIS-10:** 44 px targets; usable at 360 px.
   - **D3:** touch, pointer and keyboard; phones get the full experience.
   - **D25:** palette and colour-vision checks.
   - **D27:** calm wording.
   - `docs/design/quality-bar.md`.

## Assumed, not blocking

- **Fonts (design index, "Design-system gaps").**
  - Atkinson Hyperlegible Next (400 and 700) and Atkinson Hyperlegible Mono (400) are added as woff2 files under `src/ui/fonts/`, with their SIL Open Font License, and wired up by `@font-face` rules using `font-display: swap`.
  - These are the only weights the type tokens use. No italic is added, because the design shows none.
  - The files are downloaded once during development. The built app fetches nothing from outside its own origin (NFR-05).
- **There was no stylelint rule before this change.** The brief calls it "existing", but the repo has no stylelint. The existing guard is a Vitest text scan (`tests/ui/styles.test.ts`, which forbids hex, `rgb(` and `hsl(` outside `tokens.css`).
  - This change adds stylelint to `npm run lint` with the same colour rule, plus rules for font sizes, radii and media-query widths. The text scan stays.
  - Three existing literals break the new rules, and this change fixes them: `module.css` `border-radius: 8px`, `readiness.css` `font-size: 0.9em`, and the print `10.5pt`. The print stylesheet's point size is allowed by a scoped exception.
- **AppShell, TopBar and the Aa menu already exist** (`app-shell`, archived 10 Nov), and `tokens.css` is already imported first in `main.tsx`. This change keeps them. It adds only the progress slot (open question 1), and a test that tokens and fonts load before any other stylesheet.
- **Contracts reuse what is built.** 19 of the 45 components in frames 1b to 1o already exist, with real props:
  - TreeView, StepControls, FeedbackPanel, ScaffoldLadder, InsertControl, ProgressMap, ConfirmDialog and others.
  - The contracts module re-exports their props unchanged.
  - Stubs exist only for the 26 components not built yet. A stub renders a labelled placeholder with no student-facing content.
  - Each contract's props come from what its frame shows. A prop the frame does not show is not added.
- **Base-component wording is content.** The mastery words (Secure, Developing, Not yet), the Bloom words (Remember, Understand, Apply) and "since your last try" come from the design system. They go in `src/content/base.ts`, written by the content-author, and are flagged beyond ID for you to read. The Bloom level and outcome text passed to OutcomeChip come from `src/content/questions/outcomes.ts`, as they do today.
- **The existing button classes stay for now.** `.button-primary`, `.module-button-primary`, `.practice-button` and others duplicate the new Button. Moving each screen onto `Button` is left to the screens' own changes, so this change touches no screen.
- **Gallery page.** Playwright needs a page to photograph, and no screen is in scope. This change adds a development-only gallery (`gallery.html`, not part of the production build). It shows every base component in every state, in light and dark.

## Why

Two developers are about to build screens in parallel. Without a shared base, each one would reinvent buttons, chips, badges, breakpoints and component props. The quality bar (`docs/design/quality-bar.md`) also needs things that do not exist yet: screenshot baselines at three widths, a lint rule for tokens, and self-hosted fonts. This change builds that base once, before the lanes split.

## What Changes

- Self-host Atkinson Hyperlegible Next and Mono, with `@font-face` rules loaded right after `tokens.css`. Nothing is fetched from another origin.
- Breakpoints at 390, 768 and 1366 px: one TypeScript constant, documented in `tokens.css`, and enforced by a stylelint allow-list on `@media` widths.
- TopBar gains an optional progress area slot. AppShell and the Aa menu are otherwise unchanged.
- New base components in `src/ui/base/`:
  - `Button` (primary, secondary, quiet), with default, hover, focus, pressed and disabled states.
  - `OutcomeChip` (Bloom word plus shape glyph plus outcome text). It is static by default and becomes a link or button when it has a target.
  - `MasteryBadge` (secure, developing or not yet: word plus fill-level icon, with an optional change line since the last try).
  - All three use the one shared focus style from `tokens.css`.
- `src/ui/contracts.ts`: TypeScript prop contracts for every component named in wireframe frames 1b to 1o, with the 26 not built yet stubbed in `src/ui/stubs/`.
- Test harness:
  - axe on every base component in every state.
  - Playwright screenshots of the gallery at 390, 768 and 1366 px, in light and dark, committed as baselines.
  - stylelint added to `npm run lint`.

## Capabilities

### New Capabilities
- `ui-foundation`: self-hosted fonts, breakpoints, the base components and their states, the component contracts and stubs, and the visual and style test harness.

### Modified Capabilities
- `app-shell`: the requirement "TopBar content comes from its props" gains an optional progress area slot.

## Out of scope

- Any screen.
- Any tree rendering, including changes to TreeView.
- Any instructional content.
- Moving existing screens onto `Button`.
- What the progress area shows.
- Elevation values.
- Phone frames in the design.
- The Aa menu's settings (change 24).
- A Docker image for screenshots.
- Visual baselines of real screens (each screen change adds its own).

## Impact

- **New source:**
  - `src/ui/fonts/` (woff2 files, `fonts.css`, `OFL.txt`)
  - `src/ui/breakpoints.ts`
  - `src/ui/base/` (`Button.tsx`, `OutcomeChip.tsx`, `MasteryBadge.tsx`, `base.css`, `index.ts`)
  - `src/ui/contracts.ts`
  - `src/ui/stubs/` (26 stubs)
  - `src/content/base.ts`
  - `gallery.html` and `src/gallery/` (development only)
- **Changed source:**
  - `src/main.tsx` (imports the fonts)
  - `src/ui/TopBar.tsx` and `shell.css` (progress slot)
  - `src/ui/tokens.css` (breakpoint comment)
  - `src/ui/module/module.css` and `src/ui/readiness.css` (literals replaced)
  - `package.json` (scripts `lint`, `test:visual`)
- **New dev dependencies:** `stylelint`, `@playwright/test`. Playwright downloads its browser once during development. The app's runtime dependencies do not change.
- **Tests:**
  - New: `tests/ui/base/*.test.tsx`, `tests/ui/fonts.test.ts`, `tests/ui/breakpoints.test.ts`, `tests/ui/contracts.test.tsx` and `tests/visual/*.spec.ts` (Playwright).
  - Changed: `tests/ui/shell.test.tsx` (progress slot).
  - Must still pass: `tests/ui/styles.test.ts` and all existing tests.
- **Decisions:** new assumed rows D92 onwards, one for each assumption above.
