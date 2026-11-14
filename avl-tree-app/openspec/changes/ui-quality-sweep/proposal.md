# Proposal: ui-quality-sweep

Capabilities touched, with additive requirements only:
- `ui-foundation`, `ui-question`, `ui-feedback`, `ui-progress`, `ui-readiness`;
- `tree-view`, `tree-controls`, `tree-editor`. The brief's `ui-tree-*` names are these existing capabilities (question 2).

## Open questions

Each question has a recommendation, and the specs and tasks follow it. Decision numbers start at D149, because D125 to D148 are proposed by earlier changes and not yet recorded.

1. **The precondition (user, 14 Nov, settled: "Gate: outline first").** The brief requires that no other UI change be in flight. Today that isn't true:
   - seven applied changes are merged but not archived: `add-ui-foundation`, `revamp-tree-view`, `revamp-sandbox-layout`, `revamp-question-and-feedback`, `revamp-progress-and-hub`, `revamp-readiness` and `add-narration`. So the `ui-*` capabilities exist only inside those changes, not in `openspec/specs/`;
   - `add-lesson-outline` is proposed but not built (0 of 5 tasks), and it changes the lesson layout.

   Task 1.1 is therefore a gate: a human archives the seven, one at a time on main, and `add-lesson-outline` is built and merged as its own change. Only then does the audit run, so it sees the final layout and adds to real specs.
   - **Flagged for that change:** its design puts the outline beside the lesson "from 960 px". D118 and the stylelint rule allow only `min-width: 768px` and `1366px` queries, so the outline change has to settle that before it merges.
2. **Capability names (proposed D149, assumed).** There are no `ui-tree-view`, `ui-tree-controls` or `ui-tree-editor` capabilities. The tree capabilities are `tree-view`, `tree-controls` and `tree-editor`. The deltas use those exact paths, so nothing is renamed (cheapest to change later).
3. **Items in the brief that don't exist yet.**
   - **The side rail:** there isn't one in the design (`INDEX.md`, screens 1a to 1p) or in `src/`. The nearest thing is the lesson outline's side panel (question 1). The audit checks that panel's behaviour at each width once it exists, and calls it "the lesson outline panel".
   - **sqlite-wasm and its JSON fallback:** D16 settles a SQLite event log, but there is no SQLite code in `src/` (the sandbox's EventLog is a UI list). There is nothing to fail over, so that state is recorded as "not built" in `findings.md`, not invented. The storage-unavailable state (session-only learner storage) does exist and is audited.
4. **The size of the matrix (proposed D150, assumed).** "Every screen and every component state" across three widths, two themes and two motion settings would be about 1,300 screenshots for roughly 110 lesson screens. **Recommendation:**
   - **Pages:** every route, plus the first screen of each of the 21 lesson screen types and their states (for example a question before an answer, after "Not quite", after "That's right", and at the cap).
   - **Components:** every component state from the gallery.
   - **Coverage:** all three widths and both themes.
   - **Motion:** "Reduced motion on and off" is checked by behaviour rather than by screenshots: computed transition and animation durations are zero with reduced motion on, and non-zero with it off where the design animates. Screenshots taken mid-motion are flaky, and settled frames are identical either way.
   - **Where the list lives:** one manifest file (`tests/visual/matrix/states.ts`), so adding a screen is one line.
5. **The audit agents (proposed D151, assumed).** `.claude/agents/` defines only `ui-polisher`. The brief also uses the `reviewer` and `a11y-checker` agents.
   - **Recommendation:** a human adds those two agent files from the CLAUDE.md role table before the audit (task 2.1).
   - Until then, the main agent cannot play a fresh-context reviewer, so those two passes stay open rather than being simulated.
6. **Committing the baselines.** The brief says the matrix is "committed as baselines". Agents commit only when the user asks (CLAUDE.md), so each baseline task ends by asking. Baselines are macOS-named (D122 [OPEN]), like the existing ones.
7. **What becomes a requirement, and what stays an audit check (proposed D152, assumed).** Each quality-bar line becomes one requirement with checks a test or baseline can run. The brief's "easy to miss" items attach to the nearest line as scenarios:
   - 200% text and the Aa larger text, and landscape phone → line 4;
   - focus traps, focus after a step or route change → line 6;
   - forced colours → line 7;
   - page titles and landmarks, and live-region noise → line 5.

   **Whitespace that pushes Next, the hint button or the tree below the fold** stays an audit check, not a requirement. Fixing it may need a layout or design change, which is the triage's call, not this spec's (rule: no behaviour change).
8. **What the polisher may touch.** The brief's rule stands: only existing tokens, CSS and layout markup. A finding that needs a new token, component or design change is `[OPEN]` and goes to the design (`INDEX.md` "What must change"), not to a fix task. Behaviour, logic, tests, content and wording are not changed by fixes. A finding about wording (line 10) is recorded and goes to the content-author as a separate change.
9. **The lanes for fixes (proposed D153, assumed; D121 is [OPEN]).**
   - **Shared:** `src/ui/base`, the shell (TopBar, Aa menu, skip link), the lesson player frame and the outline panel, `screens.css`.
   - **Lane A:** `src/ui/tree/**`, `editor`, `controls`, `replay`, `sandbox`.
   - **Lane B:** `src/ui/learn/**`, `lesson/questions`, `progress`, `readiness`, `narration`.

   Shared goes first; lanes A and B then run in parallel on separate branches.
10. **Requirement IDs.**
    - NFR-02 (WCAG 2.2 AA: contrast, keyboard, target size; no colour-only signals);
    - NFR-04 (browsers; phone, tablet and desktop);
    - FR-VIS-10 (touch, 44 px);
    - D3, D18, D25, D27, D118, and the quality bar lines 1 to 10.

## Why

Each UI change met the quality bar for its own components, inside the gallery. Nobody has checked the screens as a whole: pages, states between components, the dark theme across every screen, larger text, forced colours, focus between routes. The last two changes each found a page-level problem only by looking at the real app (a blank print page; a stale "later update" line). A sweep finds those gaps once, a human chooses which to fix, and new requirements keep the bar enforced afterwards.

## What Changes

- **A state matrix (new harness).**
  - Playwright visits every route and the listed lesson screen states with seeded storage, at the three widths and in both themes. It screenshots them as baselines.
  - Check runners: axe on every state, the greyscale and three colour-vision simulations, forced colours, 200% text with the Aa larger text, landscape phone, print, a keyboard walk, a live-region recorder, a scan for hover-only CSS, and page titles and landmarks.
- **An audit (read-only)** writes `findings.md`: one row per finding with ID, screen, state, width, theme, severity, the bar line it breaks, the proposed fix, whether it needs a new token, and the owning lane.
- **A triage stop.** A developer marks each finding accept, defer or reject. Only accepted findings become fix tasks.
- **Fixes** in three groups (shared, then lane A and lane B in parallel). Each cites its finding ID, and works inside the existing tokens.
- **New requirements:** one per quality-bar line in `ui-foundation` (screen-wide), and a matrix requirement in each component capability, so the bar is enforced by tests and baselines after this change.
- **Close:** re-run the matrix, update the baselines, and score every screen against the bar at the end of `findings.md`.

## Out of scope

- New tokens, components or design changes (`[OPEN]`, to the design).
- Wording changes (to the content-author).
- Behaviour or logic changes.
- The SQLite event log (not built).
- The lesson outline itself (its own change; this one only audits it).
- Screenshots of every one of the roughly 110 lesson screens (question 4).

## Capabilities

### New Capabilities

None. The brief allows additive requirements only.

### Modified Capabilities

- `ui-foundation`: one requirement per quality-bar line, checked across the whole state matrix, and the matrix itself.
- `ui-question`, `ui-feedback`, `ui-progress`, `ui-readiness`, `tree-view`, `tree-controls`, `tree-editor`: each component capability's states are in the matrix and meet the bar.

## Impact

- **New:**
  - `tests/visual/matrix/` (the manifest, the seeding helpers, the runners) and `tests/visual/matrix.spec.ts`;
  - `tests/ui/quality/` (the source scans: hover-only CSS, red or "wrong" wording in answer states, titles and landmarks per route);
  - `openspec/changes/ui-quality-sweep/findings.md`.
- **Changed by fixes only:** CSS and layout markup under `src/ui/`, by lane, after triage.
- **New baselines:** about 400 matrix screenshots (pages and states, three widths, two themes). That is about 60 MB of PNGs in git, a cost the user should know before the first commit.
- No new dependencies. Playwright's `emulateMedia` (`forcedColors`, `media: 'print'`) and the Chromium CDP vision-deficiency emulation are already available.
