# Review notes: revamp-tree-view

## Visual baselines (task 2.4, D97)

New: `tests/visual/__screenshots__/tree-chain15-{phone,tablet,desktop}-darwin.png` (15-key chain on the Sandbox, rebalancing off). No existing baseline changed: the gallery draws no tree. `npm run test:visual` passed twice in a row (23 tests).

## Critique (task 3.1, read-only)

Method: `frontend-design` skill as critic only (the design system sets the look; only how tokens are applied is judged). Screenshots from the running app (Sandbox and its insert replay, keys 30, 20, 40, 10, 25, 5):
- phone 390 in light and dark;
- tablet 768 in light;
- desktop 1366 in light and in greyscale;
- states: default, hover, selected, keyboard focus, and the role "new" with its pill.

The z and y roles do not appear in that replay. They are covered by the unit tests (ring style, pill and tag text per role).

| # | Quality-bar line | Result | Finding |
| --- | --- | --- | --- |
| 1 | Matches the screen spec (1f, 1g, 1i, 1m) | **Finding C1, C3** | Nodes, roles, h · bf on every node, Unbalanced flag, selected frame and pill tags match. C1: edges run straight through the h · bf labels under parent nodes (all widths and both themes). C3: labels sit under the node, while the design system's node anatomy and frame 1f put them beside it. This is kept by D17's spacing, so it is recorded, not fixed. |
| 2 | Tokens only | Pass | `npm run lint` (stylelint) clean. Stroke widths and dash patterns are geometry the tokens do not cover (unchanged from the archived tree view). |
| 3 | Every state exists | Pass | Default, hover (tint fill and action ring), focus, and selected (tinted rounded square) are shown. Disabled and "not quite yet" do not apply to the tree; screens own them. |
| 4 | 390, 768, 1366 with no horizontal scroll | Pass | Fixed in this change: `.tree-view { max-width: 100% }`. Before it, the page scrolled at 390 and 768 inside `.screen-stack`'s `align-items: flex-start`. The tree box scrolls itself. |
| 5 | axe clean | Pass | `npm test` (read-only, interactive, hidden-balance). |
| 6 | Keyboard only | **Finding C2** | Every node is reachable (property test); the roving tab stop works and focus survives a rotation. C2: the shared focus outline on an SVG `<g>` is drawn round the group's whole bounding box, label included, as a square. The design system draws focus as a ring 2 px out from the node circle. It is visible and passes 3:1, but the shape does not match and it crosses the label. |
| 7 | Colour never alone; greyscale and colour-vision | Pass (greyscale); simulations for 4.1 | In greyscale the new node reads by its dotted ring and the "new" pill; roles keep five ring styles plus tag text (unit test). The protanopia, deuteranopia and tritanopia simulations are left to the a11y-checker in 4.1 (D25). |
| 8 | Targets of at least 44 px; running text of at least 16 px | Pass | Node hit areas measure 44 × 44 CSS px at all three widths (visual test, after transitions settle; see C4). Node labels are 14 px metadata, which is allowed. |
| 9 | Reduced motion | Pass (tests); OS check for 4.1 | Unit tests: snap under reduced motion and at 0 ms, and when the preference turns on later. Motion answers the student's own step or insert, a single 300 ms move, which is the kind of motion the skill endorses. |
| 10 | Calm, consistent wording | Pass | No wording changed; announcements come from screens. |

### Findings

- **C1 (polish).** Edges cross the h · bf labels and the Unbalanced flag. Fix inside the design system: give label text a halo in the surface colour (`paint-order: stroke` with `stroke: var(--bg-surface)`). The edge then stops short of the text in both themes without moving anything. CSS only.
- **C2 (human decision, not polish).** The focus ring shape on nodes. Matching the design (a ring round the node) needs the tree stylesheet to replace the global outline on treeitems. The `tree-view` spec ("Style comes from tokens": "SHALL NOT override the focus style") and the existing test forbid that. Options:
  - (a) keep the shared outline (consistent everywhere, but square);
  - (b) amend the spec so tree nodes draw the design's ring from `--focus-ring-*` tokens instead of the outline.

  Recommendation: (b), in a follow-up change, because it is a spec change.
- **C3 (recorded).** Labels sit under nodes rather than beside them (D17 spacing). Add it to INDEX.md's design differences with the role-ring difference (proposal question 6).

## Polish (task 3.2)

| Finding | Outcome |
| --- | --- |
| C1 | **Fixed.** `.tree-metrics` and `.tree-flag` get a halo: `paint-order: stroke`, `stroke: var(--bg-surface)`, `stroke-width: var(--space-2)`, round joins. At 4 px the edge still showed between words; at 8 px (4 px a side, about one monospace space at 14 px) the edge stops at the label in light and dark. Tokens only; no markup or logic changed. Tree baselines regenerated. |
| C2 | **Open: human decision.** Out of polish scope (spec change). Quality-bar line 6 stays "finding" until decided. |
| C3 | **Recorded**, not fixed (D17). Goes to INDEX.md's design differences in the workflow follow-up. |

Lines 1 and 6 therefore do not yet read pass, so task 3.2 stays open.

### Found while polishing

- **C4 (outside this change).** `tokens.css` sets `transition-duration: 0.01ms !important` on every element under reduced motion. `transition-property` defaults to `all`, so every style change, including the SVG's size, becomes a real transition lasting one frame. Students see nothing, but anything that measures in that frame gets the old size: the visual test once read node hit areas as 41.1 px at 1366. The test now waits for running animations to finish. A fix such as also setting `transition-property: none` belongs in a base or tokens change, not here.
- **Test fix (test-writer).** `tree-layout.test.ts` "stable slots" also asserted equal widths. That is not in the scenario, and it fails when a delete empties the tree (fast-check counterexample `[[29], 29]`; an empty tree draws no SVG and has size 0). The width check now applies only while the tree is non-empty. Passed 20,000 runs.

## Full check (task 4.1, partial)

| Check | Result |
| --- | --- |
| `npm test` | Pass: 94 files, 1383 tests. `tests/ui/c6-module.test.tsx` "a wrong case leaves the tool hidden" is a known flake that predates this change: it failed 4 of 12 runs on the original code, from the `Date.now()` seed in `src/ui/module/ModulePlayer.tsx:79`. |
| `npm run typecheck`, `npm run lint`, `npm run build` | Pass |
| `npm run test:visual` | Pass: 23 tests, three clean runs in a row |
| `openspec validate revamp-tree-view --strict` | Valid |
| Greyscale and colour vision (D25) | Pass. Chrome vision emulation (protanopia, deuteranopia, tritanopia, achromatopsia) on replay steps showing new, and new + z + y. Under deuteranopia z and y share an olive hue, and under achromatopsia all roles are grey. They stay distinct by ring style (double, dashed, dotted) and the z, y and new tags. |
| Keyboard only | Pass by test: the reachability property, roving tab stop, and focus kept across a rotation. Finding C2 (focus ring shape) is open. |
| Reduced motion | Pass by test, and in Chromium with `prefers-reduced-motion` emulated. **Not yet done:** a run with the macOS setting turned on. |
| Reviewer (fresh context) | **Not yet done.** No reviewer agent is defined in `.claude/agents/`. The implementer's own check is not a fresh-context review. |
| a11y-checker | **Not yet done** as a separate pass (same reason). The axe and keyboard results above come from the test suite. |
