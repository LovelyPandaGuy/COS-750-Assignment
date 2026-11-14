# Design

## Context

`src/ui/tree/` already holds a working tree view from the archived `tree-view` capability (see `openspec/specs/tree-view/spec.md`):

- `layout.ts`: in-order x, depth y, D17 sizes.
- `describe.ts`: per-node parts, description and names, all through the conventions module.
- `TreeView.tsx`: SVG, roles, ARIA tree pattern, roving tabindex, live region for selection.
- `tree-view.css`: tokens only.

It redraws each tree in place, which is why nodes jump; it has no hover; its tags are coloured text, not the design's pills. Fifteen callers render it, and `TreeViewProps` in `src/ui/contracts.ts` re-exports its props. This change may touch only `src/ui/tree/**` and tests (see proposal, Out of scope), so every new prop is optional and every current call keeps working. The proposal's open questions 1 to 11 are taken as answered by their recommendations; this design follows them.

## Goals / Non-Goals

**Goals:**
- Geometry can animate while everything a screen reader or test reads (names, levels, description, focus) switches to the new tree at once.
- One place for motion timing and the reduced-motion check.
- Layout stays a pure function and stays property-testable.

**Non-Goals:**
- No animation library, no CSS keyframes for geometry.
- No change to `describe.ts` wording or `src/content/treeView.ts`.
- No new tokens.

## Decisions

### 1. Keep the in-order layout, add optional slot keys
`layoutTree(tree, opts?: { slots?: readonly Key[] })`. Without `slots`, behaviour is exactly as today. With `slots` (a sorted superset of the tree's keys), x is computed from each key's index among `slots`, and the width from `slots.length`. The output also gains `slots: { parentKey, side, x, y }[]` (empty child positions, one slot width out and one level down) for the overlay. Nothing draws them yet.
- *Why in-order:* a rotation keeps the in-order sequence, so x is unchanged for every key. Rotations, the most important change students watch, become pure vertical moves. This is checked by property test.
- *Alternatives:*
  - Reingold–Tilford (centred parents, compact). This moves nodes sideways in rotations, is harder to keep stable, and needs spike S1.
  - Animating without union slots. Nodes would slide sideways one slot whenever an unrelated key arrives or leaves.

### 2. Tween in JavaScript, not CSS transitions
A hook `useTweenedLayout(target: Layout, ms: number)` in `motion.ts` returns the positions to draw. On a target change it records the positions drawn at that moment (so a change mid-transition starts from where nodes are) and interpolates with ease-in-out over `ms` using `requestAnimationFrame`. It returns the target directly when `ms === 0` or reduced motion is on.
- *Why JS:* edges are `<line>` elements whose `x1..y2` attributes are not CSS-animatable. Sliding nodes with CSS `transform` would leave edges snapping, which looks broken. One tween drives nodes and edges from the same numbers, which is what the "edges follow nodes" scenario checks. It is also testable in jsdom with fake timers and a stubbed `requestAnimationFrame`, which CSS transitions are not.
- *Alternatives:*
  - CSS `transform` on the node groups plus the CSS `d` property on edge paths. `d` is not animatable in Safari.
  - The Web Animations API. It has no jsdom support.

### 3. Stable slots come from the screen
A transition always starts from what is drawn at that moment and ends at the new tree's layout. If the tree view chose the union of old and new keys by itself, the old tree (already drawn without a gap) would have to open a gap at frame 0, which is a jump. So stability is opt-in: a screen that knows the keys in advance passes `slots`, and every frame uses them.
- The replay passes the keys of its final tree, and a module example passes its key list. Every step then shares one x per key: inserts fill a gap that was already there, and deletes leave one.
- Without `slots` (the sandbox, where the next key is unknown), an insert makes larger keys **slide** one slot right and a delete makes them slide one slot left. That is smooth, never a jump.
- New keys are drawn at their final position from frame 0. Removed keys are dropped at frame 0 (spec: "removed at once"). A fade would need opacity animation, which the design does not draw.
- The SVG width during a transition is the larger of the two widths, so nothing is clipped.
- *Alternative:* automatic union with a pre-opened gap. This was rejected because of the frame-0 jump described above.
- No caller passes `slots` in this change (scope). Wiring the replay to pass them is a one-line follow-up for change A2.

### 4. Reduced motion read once per change
`motion.ts` exports `TREE_TRANSITION_MS = 300` and `prefersReducedMotion()`, which reads `matchMedia('(prefers-reduced-motion: reduce)')` at the moment of each tree change, so a preference switched on later applies to the next change. A `transitionMs` prop overrides the constant (0 snaps). The existing global rule in `tokens.css` still kills CSS transitions such as hover.

### 5. DOM identity keyed by node key
Node groups stay keyed by `key` (they already are). Focus therefore survives a rotation, because React moves the same element. Edges are keyed by child key. ARIA attributes, names and description are computed from the **target** tree each render; only `x`/`y` come from the tween.

### 6. Scroll into view
An effect calls `scrollIntoView({ block: 'nearest', inline: 'nearest' })`:
- on the focused node group after keyboard focus moves;
- on the z node after a tree change.

Under reduced motion `behavior` is `'auto'`, otherwise `'smooth'`. `nearest` stops the page itself jumping vertically.

### 7. Look changes, all in `tree-view.css`
- **Pill tags.** A `<rect rx>` with `fill: var(--role-color)` behind the tag text with `fill: var(--bg-surface)`. Dark theme: `var(--bg-page)`, matching the design's "filled tags switch to dark text". That is set in CSS with `:root[data-theme='dark']`, which is allowed because it reads tokens only.
- **Hover.** `[role='treeitem']:hover .tree-node-fill { fill: var(--action-primary-tint) }` and `.tree-ring { stroke: var(--action-primary) }`.
- **Selected frame.** `fill: var(--action-primary-tint)`, drawn before the node fill so the node stays white inside it, as in the design. Stroke `var(--action-primary)`.
- **Out-of-balance annotation.** `.tree-metrics[data-unbalanced]` gets `fill: var(--tree-z); font-weight: 700`.
- The ring styles (dotted new, thick balanced) are kept (proposal question 6).

### 8. Announcements and overlay
- `announce?: string` is rendered in the existing `.tree-live` region, taking priority over the selection sentence for that render.
- `overlay?: (layout: DrawnLayout) => ReactNode` is rendered as the last child of the SVG with the tweened positions, so overlays move with the nodes.

### 9. Conventions follow-through
`describe.ts` already gets the balance factor via `balanceFactorOf` and the conventions module, and the flag via `isOutOfBalance`, so no code change is expected. The new test replaces `src/engine/conventions.ts` with `vi.mock` and checks the drawing, name and description. A source scan in the test guards `src/ui/tree/` against `- right`-style arithmetic and numeric comparisons with heights or balance factors.

## Risks / Trade-offs

- [Every caller now animates] → This is intended for replay, sandbox and do-it-yourself. A screen that should not animate passes `transitionMs={0}`; no caller is changed here, and the reviewer checks the 15 callers by running the existing UI tests, which must still pass with fake timers off. Tests that read positions right after a re-render could see frame-0 positions. Mitigation: under jsdom with no `requestAnimationFrame` progress, the drawn positions at frame 0 are the old ones, so the hook snaps when `requestAnimationFrame` is unavailable (`typeof requestAnimationFrame !== 'function'`). The red tests stub `requestAnimationFrame` explicitly when they test motion.
- [300 ms is assumed (proposal question 4)] → One constant; D100 records it; the pilot can tune it.
- [The union layout makes a tree briefly wider during an insert] → At most one slot (56 units). Inside the scroll region, so the page never scrolls.
- [Pill tags change the look of 15 screens at once] → Visual baselines are updated in this change (D97), and the reviewer compares them against design system section 01 D.
- [`scrollIntoView` moving the page] → `block: 'nearest'` and only on keyboard focus or a tree change, never on mount.
- [jsdom cannot measure page width] → The three-width scenario is a Playwright test on the Sandbox (`npm run test:visual`), not part of `npm test`.

## Migration Plan

None needed. Every new prop is optional and the layout's default call is unchanged. To roll back, revert the change; no data or storage is touched.

## Open Questions

- Whether NFR-03 is the SE document's motion requirement (proposal question 10). It changes only the ID in the test names.
