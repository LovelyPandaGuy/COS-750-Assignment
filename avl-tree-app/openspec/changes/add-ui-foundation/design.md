# Design

## Context

This is what is already in place. For the motivation, see proposal.md, "Why".

- **Tokens.** `src/main.tsx` already imports `./ui/tokens.css` first. `tokens.css` holds the light values and the dark values (stated and assumed), the single `:focus-visible` rule and a reduced-motion rule. The `app-shell` spec (archived 10 Nov) owns AppShell, TopBar, SkipLink and the Aa menu.
- **Style guard.** The only guard today is a Vitest text scan, `tests/ui/styles.test.ts`, for hex, `rgb(` and `hsl(`. There is no stylelint and no Playwright. `vitest-axe` is installed.
- **Literals the new lint will catch.** The repo's stylesheets hold three: `module.css:154` `border-radius: 8px`, `readiness.css:4` `font-size: 0.9em`, and `readiness.css:14` `font-size: 10.5pt` (print).
- **Duplicated button styles.** These classes all style buttons: `.button-primary`, `.button-secondary`, `.module-button-*`, `.practice-button`, `.replay-button`, `.link-button` and `.tree-describe-button`.
- **Built components.** 19 of the 45 components named in frames 1b to 1o exist, spread across `src/components/` and `src/ui/`. Their props are what screens already pass, so the contracts must not change them.
- **Types to reuse.** `ItemState` (`src/assessment/report.ts`) already gives `'secure' | 'developing' | 'not-yet' | 'unassessed'`. `BloomLevel` (`src/assessment/ids.ts`) gives the three Bloom levels.

## Goals / Non-Goals

**Goals:**
- One import path, `src/ui/base`, for Button, OutcomeChip and MasteryBadge.
- One import path, `src/ui/contracts`, for every wireframe component's props.
- Each lane can render a whole screen today, with stubs where a component is missing, and swap in a real component later without touching callers.
- The quality bar's automated checks (2, 4, 5, 7 and part of 9) run from npm scripts.

**Non-Goals:**
- A component library beyond the three base components.
- Theming beyond the existing light and dark tokens.
- Visual tests of real screens.
- Moving existing screens onto `Button`.

## Decisions

1. **Fonts are imported as a stylesheet with relative `url()`s, so Vite bundles them.** The woff2 files are processed through Vite, which gives them hashed names in `dist/assets/`, is cache-safe, and keeps everything same-origin. They are not placed in `public/`. `fonts.css` is imported second in `main.tsx`.
   - Alternative: the `@fontsource` packages. They work offline once installed, but they cover only some versions of the "Next" family, and they add a runtime dependency for what is three files.
   - The files are downloaded once from the font's upstream release, and the licence is kept beside them.
   - Only the weights the type tokens use are shipped: Next 400 and 700, Mono 400.

2. **Breakpoints: a TypeScript constant plus a lint allow-list, not CSS variables.** `var()` is not allowed inside `@media`. Custom media (`@custom-media`) would need a PostCSS plugin.
   - `src/ui/breakpoints.ts` exports `BREAKPOINTS = { phone: 390, tablet: 768, desktop: 1366 }` for scripts and tests.
   - The stylelint rule `media-feature-name-value-allowed-list` allows `min-width` with only `768px` and `1366px`. Phone is the default, so it needs no query.
   - A comment in `tokens.css` names the three widths and points to the module.
   - If the design later supplies breakpoints, the constant, the allow-list and the comment change together. A test asserts that the constant and the allow-list agree.

3. **Button is a thin wrapper over the native `<button>`.**
   - Props: `variant: 'primary' | 'secondary' | 'quiet'` (default `secondary`), `disabledReason?: string`, and the rest of the native button props passed through, with `type` defaulting to `"button"`.
   - Hover and pressed are CSS only (`:hover:not(:disabled)` and `:active:not(:disabled)`), so they need no React state and the gallery can force them (decision 7).
   - `disabledReason` renders as a sibling `<span id>`, referenced from `aria-describedby`, because the design system says a disabled button "is paired with a reason on screen".
   - Alternative: a polymorphic `as` prop for links. It was rejected: links stay `<a>`, with the existing TopBar action pattern as the precedent, so semantics are never mixed.

4. **OutcomeChip and MasteryBadge take typed values, not strings.**
   - OutcomeChip takes `level: BloomLevel`, `text: string` and an optional `href` or `onSelect`.
   - MasteryBadge takes `state: Exclude<ItemState, 'unassessed'>`, an optional `before`, and `compact?: boolean`.
   - The words come from `src/content/base.ts`, keyed by these types, so a missing word is a type error.
   - Glyphs and fill levels are inline SVG on a 24 grid with a 2 px stroke and round joins (design system section 03), using `currentColor` and `aria-hidden`.
   - The arrow in the change line is `aria-hidden`. A visually hidden phrase carries the change in words, for example "was Not yet, now Developing since your last try". That phrase is content, assembled by a content function.

5. **Contracts are one module of types, and stubs are generated from one list.**
   - `src/ui/contracts.ts` re-exports `ComponentProps<typeof X>` for the 19 built components, so the types stay identical by construction.
   - For the 26 missing components, it declares an interface whose fields come from the frame's visible parts, using the existing domain types (`Tree`, `Key`, `Instance`, `ItemState`, `OutcomeTag`, `LectureQuestion`), never `any`.
   - `src/ui/stubs/` holds one file per stub. Each renders `<div role="group" data-stub="Name" aria-label="Name (placeholder)">Name</div>`.
   - `src/ui/contracts.ts` exports `STUBBED`, the list of the 26 names. A test checks it against the real exports under `src/`, so building a real component makes the test fail until it leaves the list. That keeps the list honest.
   - A two-way type equality check, `expectTypeOf`, proves the built components' contracts are unchanged.
   - Alternative: stubs that render a fake tree or fake question. They were rejected because they would be content, and tree rendering is out of scope.

6. **Stylelint has a small config, and no shared preset.** The config uses only these rules, so existing stylesheets do not suddenly fail on formatting:
   - `color-no-hex`
   - `color-named: never`
   - `function-disallowed-list: [rgb, rgba, hsl, hsla]`
   - `declaration-property-value-allowed-list` for `font`, `font-size`, `line-height` and `border-radius`, requiring `var(`, `inherit` or `0`
   - `media-feature-name-value-allowed-list`

   Further details:
   - `ignoreFiles` covers `src/ui/tokens.css`.
   - An override for `@media print` blocks allows `pt` font sizes (`readiness.css`).
   - `npm run lint` becomes `eslint . && stylelint "src/**/*.css"`.
   - Fixture stylesheets in `tests/fixtures/stylelint/` are linted through stylelint's Node API inside Vitest, to prove each rule fires.
   - The Vitest hex scan stays, as a second guard that runs in `npm test`.

7. **The gallery is a second Vite HTML entry that is served in development only.**
   - Vite's dev server serves `gallery.html` at the repo root.
   - The production build's `rollupOptions.input` stays `index.html` only, and a test asserts that `dist/` has no gallery.
   - The gallery imports `tokens.css`, `fonts.css` and `src/ui/base`, and renders each component state in a labelled grid, in both themes side by side (`data-theme` on two wrappers).
   - Hover, focus and pressed are forced with a `data-force` attribute that the base stylesheet matches only in the gallery (`.gallery [data-force='hover']`). It has the same declarations as the real pseudo-class, in a separate gallery stylesheet that is not shipped.
   - Alternative: Storybook. It is a large dependency for three components.

8. **Playwright runs as its own script.**
   - `playwright.config.ts` defines three projects: 390×844, 768×1024 and 1366×768.
   - `webServer` runs `vite --port 5174 --strictPort`, and the baseURL is localhost.
   - A route handler fails any request to another origin. That is the no-network assertion.
   - `toHaveScreenshot` uses `maxDiffPixelRatio: 0.001` (0.1%; 1% let a changed chip radius pass unnoticed) and `animations: 'disabled'`.
   - The light and dark shots are taken per width, plus one greyscale shot at 1366 px, using a `filter: grayscale(1)` style injected for that run.
   - Baselines live in `tests/visual/__screenshots__/` and are committed.
   - `vitest.config` excludes `tests/visual/**`, so `npm test` stays fast and needs no browser.
   - Playwright snapshots include the platform in their names, so a developer on another OS gets a missing-baseline failure, not a silent pass (open question 6).

9. **The TopBar progress slot is a `ReactNode` inside a labelled `nav`.**
   - Props: `progress?: ReactNode` and `progressLabel?: string`. The label is required when `progress` is given; a type union enforces this.
   - The slot sits after the breadcrumb.
   - Below 768 px it takes `flex-basis: 100%` on a wrapped row, and from 768 px it sits inline. This is the first use of the breakpoint allow-list.

## Risks / Trade-offs

- **Pixel baselines are brittle across OS and font hinting.** Mitigations:
  - self-hosted fonts
  - one OS for baselines (open question 6)
  - a 0.1% tolerance
  - a separate script, so a flaky visual test never blocks `npm test`
  - If the developers' OSes differ, the follow-up is the Playwright Docker image.
- **Contracts for 26 unbuilt components fix props before those components' own specs exist.** Mitigation: each contract holds only what its frame shows. A later change may widen a contract, which is a type change caught at every caller. The stub list test forces each real component to replace its stub.
- **New lint rules could flag stylesheets written by the other lane mid-flight.** Mitigations: only three literals exist today, and they are fixed here. The rules are few and match "tokens only", which is already the rule (CLAUDE.md).
- **Forcing states in the gallery duplicates the hover and pressed declarations.** Mitigation: both rules come from one CSS custom-property set per variant (`--btn-bg`, `--btn-fg` and so on, set per state). The real and forced selectors then only assign the same variables, so they cannot drift.
- **The font download is a one-time network step during development.** It is not done during planning. The implementer fetches the files once, and the app itself never does (NFR-05). The test scans the CSS and the built output.

## Migration Plan

Additive only. Existing screens keep their classes. The TopBar prop is optional, so every current caller is unaffected. Rollback means reverting the commit. The new dev dependencies do not reach the app bundle.

## Open Questions

None of these changes what gets built. Each has an assumed default (proposal, open questions 1 to 6):
- What the progress area shows.
- Secondary and quiet pressed values, and the chip hover.
- Elevation values.
- How the lanes split.
- The baseline OS.
- Breakpoints, if the design ever states them.
