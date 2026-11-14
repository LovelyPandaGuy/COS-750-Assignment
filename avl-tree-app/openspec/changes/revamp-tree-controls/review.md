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

## Full check and review (task 4.1)

**Date:** 14 Nov 2026, at commit `4ae2476` (diff reviewed: `83b71ca..HEAD`).

### Checks

| Command | Result |
| --- | --- |
| `npm test` | Pass: 1458 tests in 100 files. The flaky C6-module test "a wrong case leaves the tool hidden" passed on this run; it is outside this change. |
| `npm run typecheck` | Pass |
| `npm run lint` (ESLint and stylelint) | Pass |
| `npm run build` | Pass (JS 494 kB, 151 kB gzip) |
| `npm run test:visual` | **Not run**: no Playwright browsers in this environment (also blocks task 1.3). |
| `openspec validate revamp-tree-controls --strict` | **Not run**: the `openspec` CLI is not installed here. |

### Who ran the passes

No `reviewer` or `a11y-checker` agent is defined in this repo (`.claude/agents/` does not exist). Each pass was run as a fresh, read-only general-purpose agent. Each was briefed only from the repo (CLAUDE.md, decisions, the change, the design and the diff), not from the build conversation.

### Reviewer: pass with findings (none high)

**Spec conformance:**
- Every requirement in the three delta specs has code behind it, and nearly every scenario has a test named after its ID.
- **Test gaps:**
  - "Text off" has no test that unticks Text and then checks that "Describe tree" remains.
  - In "Focus is never lost", the Replay-at-0 and held cases are in the requirement text but untested.
  - The pseudocode-panel spec says the case text "equals" `caseName`, but the panel shows "Case LL" and the test uses `toContain`. The spec wording is loose; the code is fine.

**D2 and D19:**
- `src/content/replay.ts` and `src/ui/replay/*` are clean.
- See R1 for `src/content/pseudocode.ts`.

**Guardrails:**
- Engine-computed answers, calm wording, no feedback tokens, non-colour signals, 44 px targets, tokens only, no network, write lanes respected.
- One new `[OPEN]` marker: "NFR-03 [OPEN: confirm the ID]" (proposal question 12). It must be settled before archiving (definition of done: no new `[OPEN]` markers).

**Quality bar:** the reviewer agrees with the Polish table above. It adds R3 to line 6 and R2 to line 10.

**Findings:**
- **R1 (low): content does convention arithmetic.** `src/content/pseudocode.ts:14-20` imports `BALANCE_RANGE` and works out the first out-of-range values (`max + 1`, `min − 1`) itself, rather than reading them through `conventionsWording` (D19). The D19 mock test mocks only `num`, so it would not catch a range change.
  - **Fix:** add an out-of-range field to `conventionsWording` and read it from there (content-author, with a test).
- **R2 (low): the keys help is out of step with the strip** (`src/content/replay.ts:35`).
  - It never says "Back", although ← is Back.
  - It leaves out Replay, which task 2.1 asked to add and the build skipped.
  - It does not mention that the arrows scroll inside the tree box (C5).
  - The QB10 test checks only Play, Pause, Step and Speed.
  - **Fix:** content-author rewords the help, and test-writer adds Back to the check. This ties in with C6.
- **R3 (low): Space is taken from buttons inside the player** (`src/ui/replay/ReplayPlayer.tsx:116-136`). This existed before the change and is the same issue as a11y A1.
  - **Scenario:** focus is on the tree view's "Describe tree" button and the student presses Space. Playback toggles and the disclosure does not open.
  - Enter still works, so WCAG 2.1.1 holds.
- **R4 (low): stale comment** (`src/ui/replay/replay.css:6` and the 768 px block). The comment says "one row from 768 px", which C1 replaced, and `space-between` assumes a row the strip rarely gets.
  - **Fix:** the polisher updates the comment and the block.
- **R5 (low): the contextual heading level reads the last heading anywhere before it** (`src/ui/replay/StepExplanation.tsx`).
  - On predict steps, `PredictPrompt`'s `<h3>` comes first, so "The whole tree" becomes an `<h4>` nested under the prediction heading.
  - When the prompt unmounts, the level only updates on the next step, because the effect depends on `[description, level]`.
  - **Fix:** take the level from the step's own heading (for example the nearest ancestor region's heading plus one), or let the host pass it.

**Could not check:**
- **Rendered-page checks:** everything that needs a rendered page.
- **C4 in real browsers:** if a browser fires `focusout` synchronously when `disabled` is set, `onBlur` clears the remembered button before the layout effect runs, and focus would still be lost. This needs a keyboard walk in Chrome, Firefox and Safari.

### A11y-checker: pass with findings (no WCAG 2.2 AA failure found in code, CSS or tokens)

**Checked:**
- The 9 replay test files pass (170 tests: jsdom axe, tab order, reduced-motion snap, one live region, C4, C5).
- **Semantics:** named groups; fieldsets with legends; `aria-pressed`; `aria-current`; native disabled; "main" in the locked box's name; caption as the only live region with text; contextual heading level.
- **C4 and C5 fixes:** verified in code.
- **Focus style:** no `:focus` override.
- **Reduced motion:** no transitions in the replay CSS, a global reduced-motion rule in the tokens, and a snap in `motion.ts`.
- **WCAG 2.2.2:** playback never starts on its own, and Pause is present.

**Contrast:** every token pair the replay CSS uses passes in light and dark. Text is at least 4.5:1 and component edges at least 3:1. Examples:

| Pair | Light | Dark |
| --- | --- | --- |
| Inverted current line | 16.46 | 13.68 |
| Text on tint | 14.24 | 11.36 |
| Secondary button text | 8.82 | 7.21 |
| Control edges | 4.12 | 4.57 |
| Focus ring | 8.43 or more | 7.21 or more |

The tint fill against the surface is 1.16 to 1.20. That is too low to work as a cue (A2).

**Findings:**
- **A1 (medium): Space toggles playback on every button in the player.** This is the same issue as R3.
  - The current spec behaviour ("Space toggles while focus is inside the player") needs a team decision.
  - Suggested rule: Space toggles only on the tree box and the player itself, or skips buttons outside the strip. A scenario and a test come first.
- **A2 (low): selected speed has a weak cue in greyscale** (`replay.css:37`).
  - All replay buttons are already bold, and the tint is invisible.
  - What is left is the 1 px to 2 px border change and the text colour.
  - **Fix:** add a shape cue (for example an inset bar from existing tokens, or a ✓ glyph through content), and correct the CSS comment.
- **A3 (low, advisory): disabled and enabled buttons differ mainly by a faint border** (`replay.css:38`). Disabled controls are exempt from contrast. The design's dashed disabled border would fix it, but it is not a token (already recorded under C3).
- **A4 (low): landmarks repeat if one page shows two replays.** Each replay adds three named regions, so two replays would repeat "The whole tree" and "Pseudocode: …" (axe `landmark-unique`).
  - **Fix:** confirm no screen shows two replays at once, or drop `aria-labelledby` on the whole-tree section.
- **A5 (low): speed labels may be read badly.** "0.5×" may be read as "0.5 multiplication sign".
  - **Fix:** content-author gives the speed buttons a name such as "0.5 times speed".

**Comment:** in dark mode `--action-primary-pressed` equals hover (an assumed token), so a pressed primary button looks the same as a hovered one. Cosmetic.

### Needs a browser (developer machine, before ticking 4.1)

- [ ] `npm run test:visual` at 390, 768 and 1366 (also closes task 1.3); update only the replay baselines (D97).
- [ ] axe DevTools on a module replay step and on the Sandbox, light and dark (real contrast, `landmark-unique`, native control colours).
- [ ] Chrome DevTools, Rendering, Emulate vision deficiencies: achromatopsia, protanopia, deuteranopia, tritanopia (D25). Check that the selected speed (A2), disabled vs enabled (A3), checked boxes, the locked "main" box and the current line still read apart.
- [ ] The locked box's native disabled checkbox must not look "off" in Chrome, Firefox or Safari.
- [ ] Keyboard-only walk in Chrome, Firefox and Safari:
  - the tab order and a visible ring on every stop;
  - Step to the end and Back to 0 with focus on them (C4; confirms the reviewer's `focusout` question);
  - arrows scroll a wide tree in the tree box at 390 (C5);
  - Space on "Describe tree" (A1/R3).
- [ ] OS reduced motion on: nodes snap on every step and on Replay.
- [ ] 200% zoom and Firefox text-only zoom at the three widths: the marker and number columns do not overlap the code; no page scroll.
- [ ] Screen reader (NVDA or VoiceOver): one caption announcement per step and none from the tree; the speed names (A5); "Diagram main, checked, unavailable".

### Status of task 4.1

**Not ticked.** The four commands pass and both passes report pass with findings. Still open:
- **Decisions needed:** A1/R3 (Space, needs a team decision), R1, R2, R5, A2, A4 and A5 (fix or defer), and R4 (comment, polish).
- **Browser checks:** the "Needs a browser" list above.
- **Before archiving:** the NFR-03 `[OPEN]` marker must be settled.

## Round-2 fixes after the 4.1 reviews (14 Nov 2026)

**Commits:** red tests and spec in `5cf140d`, code in `15df742`.

| Finding | Outcome |
| --- | --- |
| A1/R3 (Space on buttons) | **Fixed.** On a focused button or `summary`, Space keeps its native action and does not toggle playback. It still toggles on the tree box and on other places in the player that are not buttons. The keyup handler that blocked the native click was removed. Spec: step-replay "Controls work by keyboard", scenario "Space activates a focused button". |
| R1 (convention arithmetic in content) | **Fixed.** `conventionsWording()` gains `outOfRangeText` ("+2 or −2"), found with the engine's `isOutOfBalance`. Insert pseudocode line 3 reads it. `src/content/replay.ts` and `src/content/pseudocode.ts` no longer import `src/engine/conventions.ts`; the case type is re-exported from `conventionsWording`. |
| R2 (keys help) | **Fixed.** "Keys: Space Play or Pause, ← Back, → Step, [ and ] Speed. The Replay button starts again. Inside the tree box, ← and → scroll the tree." It uses the strip's words; the test checks Back, Play, Pause, Step, Replay and Speed, and the tree-box note. |
| R4 (stale comment and 768 px rule) | **Fixed.** The "one row from 768 px" comment and the `.replay-controls` rule in the 768 px block were removed. The block keeps `.switcher-task { margin-inline-start: auto }`, which puts the task at the end of the switcher bar as in 1f. |
| A2 (weak selected-speed cue) | **Fixed.** The selected speed is bold and the other speed buttons are regular weight. Every replay button used to be bold, so bold on the selected one alone would have changed nothing. |
| Reviewer test gaps | **Added:** Text off keeps the tree view's "Describe tree" button; focus when Replay disables at position 0; focus when the replay becomes held. All three passed on first run: the code already behaved correctly, and the tests now guard it. |

**Checks after the fixes:** `npm test` (1464 passed in 100 files), `npm run typecheck`, `npm run lint` (ESLint and stylelint) and `npm run build` all pass.

### Known follow-ups (deferred, user decision 14 Nov 2026)

- **R5: contextual heading level.** "The whole tree" takes its level from the last heading anywhere before it. On predict steps that is `PredictPrompt`'s `<h3>`, so it becomes an `<h4>` nested under the prediction heading. When the prompt unmounts, the level only updates on the next step. Possible fix: take the level from the step's own heading, or let the host pass it.
- **A4: repeated landmark names.** Two replays on one page would repeat the region names "The whole tree" and "Pseudocode: …" (axe `landmark-unique`). No screen shows two replays today. Possible fix: drop `aria-labelledby` on the whole-tree section.
- **A5: speed labels read aloud.** "0.5×" may be read as "0.5 multiplication sign". Possible fix (content-author): give the speed buttons a name such as "0.5 times speed", keeping the visible "0.5×".
- **C6 (from the critique): two "Back" buttons and three meanings of "Step".** Still a question for the team.

### Status of task 4.1

**Still not ticked.** The checks pass, and every reviewer and a11y finding is fixed or deferred by decision. Still open:
- the "Needs a browser" list above (visual tests, real-browser axe, the vision simulations, the keyboard walk in three browsers including the C4 `focusout` question and Space on buttons, the OS reduced-motion walk, zoom, and a screen reader);
- settling the NFR-03 `[OPEN]` marker before archiving.
