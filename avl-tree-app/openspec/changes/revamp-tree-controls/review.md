# Review notes: revamp-tree-controls

## Critique (task 3.1, read-only)

**Date:** 14 Nov 2026, at commit `3d62cbb`.

**Scope:** the caption, `StepControls`, `PseudocodePanel`, `RepresentationSwitcher` and the whole-tree text (`StepExplanation`). Scored against `.claude/docs/design/quality-bar.md` and screen specs 1f and 1h.

**Method, and its limits:**
- **No `frontend-design` skill.** The skill is not available in this session, so it was not used. This critique applies the quality bar and the screen specs directly, judging only how tokens are applied, as the skill would.
- **No running browser.** This environment has no Playwright browsers (see task 1.3), so there are no screenshots. Unlike the A1 critique, nothing here was seen rendered.
- **Evidence used instead:**
  - a reading of the committed code (`src/ui/replay/*`, `replay.css`, `tokens.css`, `shell.css`, `module.css`);
  - the jsdom test results (`npm test`: everything in this change passes, including axe, tab order and the reduced-motion snap);
  - width estimates worked out from the tokens.
- **What follows from that:** every line that needs a real browser is marked **not checked here**, with the reason. Those checks move to task 4.1 on a developer machine.

No code, test or content was changed.

| # | Quality-bar line | Result | Notes |
| --- | --- | --- | --- |
| 1 | Matches the screen spec (1f, 1h) | **Finding C1, C7** | Matches 1f: tree; caption directly under it; Back, Play (primary), Step with progress, "Step p / n" and Speed 0.5×, 1×, 2×; current pseudocode line inverted with ▶; five-step C6 outline (D30); case beside the line (D31); Show boxes with one primary (D22). C1: 1f's two-column grid (800 px \| 1fr) cannot happen inside the 66ch page. C7: recorded differences that follow the decision log. |
| 2 | Tokens only | Pass | `npm run lint` (stylelint) and the style scans are clean. Every colour, font, size and radius is a `var(--…)`. The 1 px and 2 px border widths are geometry the tokens do not cover, as in the rest of the app. |
| 3 | Every state exists | **Finding C2, C3** | Present: default, hover, focus (the shared ring), selected (`aria-pressed`, `:has(input:checked)`) and disabled. Missing: a pressed state (C2), a hover on the search-form radios, and a distinct look for the locked primary box (C3). "Not quite yet" does not apply, because these controls give no verdicts. |
| 4 | 390, 768 and 1366 with no horizontal scroll | **Not checked here**; risk C1 | No browser, so no screenshots (`tests/visual/replay.spec.ts` is written but not run). From the code: every row wraps (`flex-wrap`), pseudocode lines wrap, and the caption and whole-tree text are capped at `--reading-column`, so a page-level horizontal scroll is unlikely. The C1 estimate says the visual test's "side by side from 768" assertion will fail on the C6 page. |
| 5 | axe has no violations | Pass (jsdom); browser run for 4.1 | Clean in `npm test` for held, start, imbalance and end with the switcher, the switcher alone with and without Mode, the Sandbox replay and the C6 pages. jsdom does not compute colour contrast. The pairs used are covered by `tests/tokens.contrast.test.ts`, including the inverted line in both themes. A real-browser axe run is left to 4.1. |
| 6 | Keyboard only: every action reachable, visible focus, logical order | **Finding C4, C5** | Tab order is logical and tested: enabled boxes, the tree, Describe tree, Back, Play, Step, Replay, the speeds, then the search form. Shortcuts are scoped to the player and skip inputs (WCAG 2.1.4). Focus uses the shared ring. C4: focus is lost when the focused button disables itself. C5: the arrow shortcuts take the arrows away from the tree's scroll region. |
| 7 | Colour never alone; greyscale and three colour-vision simulations | Pass by inspection; **simulations not checked here** | Every state carries a signal other than colour. Selected speed: `aria-pressed` plus a 2 px border and dark text. Current line: inverted, bold, ▶ and `aria-current`. Locked box: the word "main" plus the native disabled checkbox. Checked options: fill, border, bold and the native mark. Case: text in a pill. Greyscale and the protanopia, deuteranopia and tritanopia simulations (D25) need a browser and go to the a11y-checker in 4.1. |
| 8 | Targets of at least 44 px; running text of at least 16 px | Pass by stylesheet; **measurement not checked here** | Buttons, box labels and radio labels set `min-height` and `min-width: var(--target-min)`. The caption, whole-tree text, help line and labels use `--type-body` (16 px). The "main" tag and the case pill use `--type-label` (14 px), which the design system allows for tags. The listing keeps `--type-mono` (15 px), an exception already flagged in the archived `pseudocode-panel` spec. Measuring at 390 px needs the visual test. |
| 9 | Reduced motion: steps snap, nothing slides | Pass (tests); **OS setting not checked here** | `tests/ui/replay-motion.test.tsx`: under reduced motion every node is at its final place in the same frame, and `replay.css` declares no transition or animation. With motion allowed, a rotation step moves nodes only up or down (D103). Walking it with the real OS setting needs a browser (4.1). |
| 10 | Calm, consistent wording | **Finding C6** | Calm: no "wrong", "fail", "incorrect" or "error" at any position (test), and no feedback tokens. The D19 wording comes from the conventions module (test). C6: two labels each name two different things. |

### Findings

- **C1: The width cap conflicts with 1f and with the strip spec (human decision, base change).**
  - **Cause:** `.app-main` (`src/ui/shell.css`) and `.module-player` (`src/ui/module/module.css`) are both `max-width: var(--reading-column)` (66ch, about 590 px in Atkinson Hyperlegible at 16 px). On a module page the replay is therefore never wider than that, at 768 or at 1366.
  - **Estimate from the tokens (to confirm in a browser):** the navigation group needs about 420 px (four 44 px-high buttons with 16 px side padding, glyph and label, 8 px gaps). The progress and speed group needs about 400 px (64 px minimum progress bar, counter, "Speed" label and three speed buttons). One row needs about 830 px.
  - **Effect:**
    - The strip will wrap into two rows at every width on module pages.
    - The spec scenario "groups side by side at 768 and 1366" and the matching assertion in `tests/visual/replay.spec.ts` are expected to fail.
    - 1f's two columns (tree and controls on the left, pseudocode and text on the right) cannot fit in 590 px.
  - **Options:**
    - (a) A base change (module-framework or app-shell) lets a replay step use a wider frame from 1366, with the 1f grid. 768 then still wraps.
    - (b) Amend the spec and the visual test to "the groups wrap with no horizontal scroll; navigation first". 1f's grid stays a recorded difference.
    - (c) Both: (b) now, (a) as a follow-up.
  - **Recommendation:** (c). This is outside the polisher's lane: it is a spec, test and base-layout decision.
- **C2: No pressed state (polish, CSS only).**
  - `replay.css` has no `:active` rule.
  - D94 gives secondary pressed as `--action-primary-tint` with an `--action-primary` border. Primary pressed is `--action-primary-pressed` (as in `src/ui/base/base.css`).
  - Add `:active:not(:disabled)` rules for `.replay-button` and `.replay-button[data-primary]`, and the same for `.switcher-option` and `.pseudo-option`.
- **C3: Missing hover and a flat locked look (polish, CSS only).**
  - **Search-form radios:** `.pseudo-option` has no `:hover` rule. Add one matching `.switcher-option:hover`.
  - **Locked primary box:** `.switcher-option:has(input:disabled)` changes only the cursor, so it looks like any other checked option apart from the "main" pill. Give it a distinct but still "on" look from existing tokens, for example keeping the tint and border but dropping the hover underline, or styling the "main" pill like the case pill. It must not use the disabled greys, because the box is on.
  - **Disabled replay buttons:** the design draws them with a dashed `#C2C7D2` border. That value is not a token (INDEX "Design-system gaps"), so it is recorded only, not fixed.
- **C4: Focus is lost when the focused control disables itself (code and test; not polish).**
  - **Cases:**
    - pressing Back from position 1 disables Back at 0;
    - pressing Step at position n − 1, or letting playback reach the end, disables Step;
    - Replay disables at 0 when paused.
  - **Effect:** a native disabled button drops focus to the page body, so a keyboard user loses their place (WCAG 2.4.3).
  - **Options:**
    - (a) Use `aria-disabled="true"` with a guarded handler instead of `disabled`. Visual disabled styles move to `[aria-disabled='true']`.
    - (b) Move focus to the nearest enabled control in the group when the focused one disables.
  - This changes behaviour, so it needs a spec scenario and a test-writer test first. Recommendation: (a), as a follow-up task in this change or a small change of its own.
- **C5: Arrow shortcuts on the tree's scroll region (human decision).**
  - The tree region (`.tree-scroll`, `tabIndex=0`) is a horizontal scroll box for wide trees (D17).
  - While it has focus, ← and → step the replay and `preventDefault`, so a keyboard user on a phone cannot scroll a wide tree with the arrows. Tab still reaches every control, so no action is lost.
  - **Options:**
    - (a) Arrows step the replay unless focus is on the tree region.
    - (b) Keep it as it is and add a sentence to the keys help.
  - **Recommendation:** (a). It is a logic change in `ReplayPlayer`, with a test.
- **C6: The same words name different things (content; human decision).**
  - On a module replay step (C4, C6) the page shows two "Back" buttons: the module strip's Back (previous lesson step) and the replay's Back (previous replay step).
  - "Step" is also used three ways: the module position "Step 2 of 5", the replay counter "Step 3 / 9", and the replay's Step button.
  - Quality-bar line 10 asks for one term per thing.
  - **Recommendation:** content-author wording for the replay only, for example "Step back" and "Step forward" for the buttons and a replay counter worded differently from the module position. The tests that pin "Back" and "Step" on the replay would change with it (test-writer), and the module strip stays as it is. It is outside the polisher's lane.
- **C7: Recorded differences from 1f and 1h (no action).** Each follows the decision log:
  - **Switcher not on any real screen yet.** No real screen passes `representations`, `mode` or a task, so the switcher, the 1f task title and the 1h Mode group appear only in tests until the two follow-ups land: `supporting` on `Step` (question 5) and `ModeSwitch` hosting the switcher (question 6).
  - **Visible whole-tree text.** 1f's "Describe the whole tree ▾" link is a visible "The whole tree" paragraph (D105).
  - **Other 1f items:**
    - Read aloud is hidden (D26).
    - "Add to lecture questions" is out of scope.
    - The pseudocode is the five-step outline, not line-level code (D30).
    - Heights follow D2.

### Decisions on the critique (user, 14 Nov 2026)

| Finding | Decision | Where it is handled |
| --- | --- | --- |
| C1 | **Accepted as an assumption.** The strip wraps with no horizontal scroll, navigation first. On module pages the replay is at most `--reading-column` (66ch) wide, so the two groups wrap at every width. 1f's two-column grid remains a recorded difference. A wider frame for replay steps would be a separate base-layout change. | Spec "Replay control strip" and QB4; `tests/ui/step-controls.test.tsx`; `tests/visual/replay.spec.ts`. |
| C2, C3 | Polish, styling only. | Task 3.2. |
| C4 | **Fix.** A scenario and a red test come first, then the code. When the focused strip button disables itself, focus moves to the next enabled strip button, else the previous. Buttons keep native `disabled` (design, "Review fixes"). | Spec "Focus is never lost in the strip"; `tests/ui/replay-player.test.tsx`. |
| C5 | **Fix.** A scenario and a red test come first, then the code. ← and → step only when focus is not inside the tree's scroll box. Space and the brackets still work there. | Spec step-replay "Controls work by keyboard"; `tests/ui/replay-player.test.tsx`, `tests/ui/replay-quality.test.tsx`. |
| C6 | **Deferred: a question for the team.** On module replay steps there are two "Back" buttons (lesson step and replay step), and "Step" means the module position, the replay counter and the replay's Step button. Should the replay's buttons and counter be worded apart from the module strip (for example "Step back", "Step forward", and a different counter wording)? No change in this change. | This file. |

### What the polisher (task 3.2) may fix

C2 and C3 (the pressed, hover and locked looks). Both are CSS only, inside `src/ui/replay/replay.css`.

C1, C4, C5 and C6 need a decision or a spec, test or content change first. They are not polish. Until they are settled, quality-bar lines 1, 4 (expected), 6 and 10 cannot all read pass.

## Polish (task 3.2)

**Date:** 14 Nov 2026. CSS only, in `src/ui/replay/replay.css`. No tokens, logic, tests or content changed. The `frontend-design` skill is not available in this session (see Critique); the changes reuse the patterns already in `src/ui/base/base.css`.

**Changes:**
- **C2, pressed states:**
  - `.replay-button:active` uses the tint fill with an `--action-primary` border (D94, as `.btn-secondary`).
  - `.replay-button[data-primary]:active` uses `--action-primary-pressed` (as `.btn-primary`).
  - `.switcher-option:active` (not on the locked box) and `.pseudo-option:active` match the secondary pressed look.
- **C3, hover and locked look:**
  - `.pseudo-option:hover` (the search-form radios) now has the tint fill and underline, matching `.switcher-option:hover`.
  - The locked primary box keeps the "on" look (tint, border, bold) with a 2 px border and the word "main". It never uses the disabled greys and has no hover.
  - The design's dashed disabled border for buttons stays recorded only: the value is not a token.

**Code fixes made before the polish** (not polish; tests first in `51903b7`, code in `c325ba4`):
- C4: focus moves to the next enabled strip button when the focused one disables.
- C5: ← and → scroll the tree box instead of stepping.

**Checks:** `npm test` (1458 passed), `npm run typecheck` and `npm run lint` (stylelint included) are clean. `npm run test:visual` was **not run**: there are no Playwright browsers here.

**Quality bar after the polish:**

| # | Line | Status |
| --- | --- | --- |
| 1 | Screen spec | Pass with recorded assumptions: C1 (wraps, no 1f grid in a 66ch page) and C7. |
| 2 | Tokens only | Pass. |
| 3 | Every state | Pass: default, hover, focus, pressed, selected and disabled for buttons, boxes and radios. "Not quite yet" does not apply. |
| 4 | Three widths | **Not checked here** (needs `npm run test:visual` on a developer machine). |
| 5 | axe | Pass in jsdom; a browser run is for 4.1. |
| 6 | Keyboard only | Pass (C4 and C5 fixed and tested). |
| 7 | Colour never alone | Pass by inspection; **greyscale and colour-vision simulations not checked here** (browser, a11y-checker in 4.1). |
| 8 | Targets and text | Pass by stylesheet; **measurement not checked here** (visual test). |
| 9 | Reduced motion | Pass by tests; **OS setting not checked here**. |
| 10 | Wording | Calm: pass. Consistency: **open**, C6 deferred to the team. |

**Task 3.2 stays unticked.** Its check needs `npm run test:visual` to pass and every line to read pass. Lines 4, 7, 8 and 9 need a browser, and line 10 waits on the team's answer to C6.
