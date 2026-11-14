# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18): each one below can be isolated in one constant, one prop or one CSS rule. Please read them before `/opsx:apply`. Each has a recommendation; the specs and design follow it.

1. **Spike S1 has not run (D17).** The layout algorithm is the D17 default: x by in-order position, y by depth, nodes 44 across, slot spacing 56, level spacing 96. **Recommendation:** keep it and treat this change as the S1 decision; record it by updating D17 from "default" to "assumed, revamp-tree-view". In-order layout has a property that helps teaching: a rotation never changes the in-order sequence, so under this layout a rotation moves nodes **only up or down**, never sideways (the InOrderStrip idea of 1h, note 2). Reingold–Tilford or another tidy layout would centre parents but would move nodes sideways during a rotation.
2. **"Parent centred over children" conflicts with in-order x (D17).** With equal slots, a parent sits between its children but is centred only when both subtrees have the same size. **Recommendation:** require "parent strictly between its children" (your acceptance wording) and not "centred". Changing this would mean a different algorithm (question 1). Assumed, not blocking.
3. **Stable positions between steps.** Under in-order layout an insert moves every larger key one slot to the right, and a delete moves them one slot left. **Recommendation:** an optional `slots` prop (a set of keys). When a screen passes it, every tree is laid out over those keys, so a key keeps its x when another arrives or leaves; the absent key's place is left as a gap. The replay knows its final tree and would pass its keys. Without `slots` (the sandbox, where the next key is unknown), larger keys slide one slot smoothly. The tree view cannot pick the union by itself: the old tree is already on screen without a gap, so opening one would be a jump. Assumed, not blocking.
4. **Transition timing (NFR-03, D32).** D32 says sliding is "a later change to `tree-view` (NFR-03)", and this is that change. Neither the design nor `tokens.css` gives a duration or easing. **Recommendation:** 300 ms, ease-in-out, in one constant `TREE_TRANSITION_MS` in `src/ui/tree/motion.ts`. That is a quarter of the 1× replay step (D29, 1200 ms), so a node settles well before the next step. Reduced motion, or a duration of 0, snaps. Assumed, not blocking; add as D100.
5. **How a 15-node tree fits a phone (D17, D93, INDEX "Breakpoints").** At natural size a 15-node tree is 892 px wide (2 × 32 + 44 + 14 × 56). Options:
   - (a) Scale to fit. At 358 px that is about 0.4×, so nodes would be about 18 px and labels about 6 px. That breaks the 44 px targets and the 14 px minimum.
   - (b) Scroll inside the tree's own box. This is what D17 already does.
   - (c) A minimum node size with scaling down to it. Because 44 px is both the node size and the minimum, this gives the same result as (b).

   **Recommendation:** (b), keeping D17. Add one behaviour: the tree box scrolls the **focused node** into view and, on a change, the **z node** if there is one, so the part being taught is never off-screen. The page itself never scrolls sideways at 390, 768 or 1366. Assumed, not blocking; a design answer can change it in `tree-view.css` and one effect.
6. **Role look: design system vs the current tree view.** The design system (section 01 D, and 04B for dark) draws:
   - `new` as a **solid 3 px** ring;
   - `balanced` as a 2.5 px ring;
   - the tags as **filled pills** with surface-coloured text (dark text in the dark theme).

   The current tree view draws `new` **dotted**, `balanced` **thick**, and the tags as coloured text. **Recommendation:** adopt the design's filled pill tags. Their contrast pairs are already in the token test (`bg-surface` on `tree-new`, `tree-z` and `tree-y`, 4.5:1; `bg-page` on `tree-z` in dark). Keep `new` dotted and `balanced` thick, so the five roles keep five different ring styles and still read apart in greyscale even if a tag is clipped. List this as a design difference in INDEX.md for the designer. Assumed, not blocking.
7. **Live-region announcements need wording, and content is out of scope.** Today the live region announces only "Node 30 selected". The screens that show a changing tree (1f, 1n) already have their own aria-live region (StepExplanation, EventLog), so a second announcement from the tree would be read twice. **Recommendation:** add an optional `announce` prop. The screen passes the sentence, and the tree view puts it in its own polite region only when the screen has no live region of its own. Selection stays announced by the tree view. No new content strings. Assumed, not blocking.
8. **Capability name.** You asked for `ui-tree-view`, but the existing capability is `tree-view` (`openspec/specs/tree-view/spec.md`, eight requirements). A new name would duplicate it. **Recommendation:** make this change a delta on `tree-view`. Not blocking.
9. **Editing extension point (change A3) and the existing TraceEditor.** `src/ui/module/check/TraceEditor.tsx` already edits trees around `TreeView`. **Recommendation:** add one optional `overlay` render prop that receives the layout (node and empty-slot positions) and draws inside the SVG. A3 (slots, place key) and the 1h RotationMenu can then attach to nodes without TreeView knowing about editing. `interactive` is kept, so no caller changes (scope: `src/ui/tree/**` only).
10. **Requirement IDs.** I could not open the SE document from here. The IDs below come from the archived `tree-view` spec and D32: FR-VIS-01, 02, 07, 09, 10, NFR-02, 03, 04. [OPEN] Please confirm that **NFR-03** is the motion and transition requirement, and whether an FR-VIS ID covers stable positions between steps. **LO:** TreeView assesses no outcome; it is the drawing behind LO1 (1n), LO3 (1j), LO6 (1h) and LO7 (1f, 1g, 1i, 1m). The unit-to-module mapping is still open (INDEX item 2).
11. **Node annotation weight (design system "Node anatomy").** "The unbalanced node's annotation takes the z colour and weight". Today only the "Unbalanced" flag is z-coloured. **Recommendation:** colour and bold the h · bf line of an out-of-balance node with `--tree-z` as well. `tree-z` on `bg-surface` passes 4.5:1. Assumed, not blocking.

## Why

Every tree screen (1c, 1f, 1g, 1h, 1i, 1j, 1k, 1m, 1n) draws through `TreeView`, but today it redraws each new tree in place. During a replay, a rotation or an insert, nodes jump, and a student cannot see what moved. FR-VIS-01 and D32 ask for a tree a student can follow, and the design system's node anatomy (hover, selected frame, pill tags, z-coloured annotation, "nodes snap" under reduced motion) is only partly built. This change brings the base component up to the design before more screens build on it.

## What Changes

- **Transitions between two tree states.** When the `tree` prop changes, nodes that stay slide from their old to their new position, and their edges follow. New nodes appear in place and removed nodes leave. Rotations move nodes only vertically (in-order layout). Under `prefers-reduced-motion`, or with a duration of 0, everything snaps (NFR-03, D32).
- **Stable slots.** A screen can pass slot keys so that no node moves sideways because a different key arrived or left. Without them, larger keys slide one slot smoothly (question 3). No caller passes slot keys yet; the replay can, in change A2.
- **Layout invariants as property tests**, extending the archived ones: no overlap, keys in in-order x order, each parent strictly between its children, the root at the top, and the result depends only on the tree (FR-VIS-01).
- **Design-system node anatomy:**
  - filled pill role tags;
  - a hover state (`--action-primary-tint` fill, `--action-primary` ring);
  - a selected frame filled with `--action-primary-tint`;
  - the z-coloured, bold annotation on out-of-balance nodes;
  - the focus ring kept from the shared style.

  All values are tokens (FR-VIS-02, FR-VIS-09).
- **Fit.** The tree box keeps natural size and scrolls itself (D17). It now scrolls the focused node, and on change the z node, into view. There is no horizontal page scroll at 390, 768 or 1366 with 15 nodes (FR-VIS-10, NFR-04).
- **Announcements.** An optional `announce` prop for screens that have no live region of their own. Selection is still announced as "Node 30 selected" (NFR-02).
- **Extension point.** An optional `overlay` render prop with the layout, for editing (A3) and menus (1h). No editing behaviour here.
- **Conventions follow-through.** A test proves the shown balance factor and its sign follow `src/engine/conventions.ts` when it changes (D2, D19).
- Serves FR-VIS-01, FR-VIS-02, FR-VIS-07, FR-VIS-09, FR-VIS-10, NFR-02, NFR-03 ([OPEN] question 10), NFR-04; decisions D2, D3, D17, D19, D25, D32.

## Out of scope

- Step controls, caption, pseudocode panel, representation switcher (change A2 and others).
- Tree editing: placing keys, empty slots as targets, drag (change A3). Only the `overlay` hook is added.
- Any engine change, and any content string. `src/content/treeView.ts` is unchanged; the announcement sentence comes from the screen.
- Changes to callers outside `src/ui/tree/**`. Every new prop is optional, so existing screens keep working as they are.
- New tokens (a motion token would be a base change through a separate change; question 4 keeps the duration in one constant meanwhile).

## Capabilities

### New Capabilities
- None. (Requested name `ui-tree-view` maps to the existing `tree-view`, question 8.)

### Modified Capabilities
- `tree-view`: layout gains the parent-between and stable-slot rules. Roles gain pill tags. Node display gains the z-coloured annotation, hover and a filled selected frame. Wide trees gain scroll-into-view. New requirements: transitions with reduced-motion snap, screen-supplied announcements, the overlay extension point, and conventions follow-through.

## Impact

- Code: `src/ui/tree/TreeView.tsx`, `layout.ts`, `tree-view.css`; new `src/ui/tree/motion.ts` (tween hook and `TREE_TRANSITION_MS`). `describe.ts` is unchanged.
- Contract: `TreeViewProps` in `src/ui/contracts.ts` re-exports the component's props, so it picks up the optional `announce`, `overlay`, `slots` and `transitionMs` with no edit.
- Callers (15 files across `src/ui/` and `src/pages/`): no change needed. Every caller gets the slide automatically when its `tree` prop changes. That is intended for the replay and sandbox; if any screen should not animate, it passes `transitionMs={0}`.
- Tests: `tests/ui/tree-layout.test.ts`, `tree-view.test.tsx` and `tree-keyboard.test.tsx` extended; new `tests/ui/tree-motion.test.tsx`; one visual test file `tests/visual/tree-view.spec.ts` that builds the widest 15-node tree (keys 1 to 15 in order with rebalancing off) on the existing Sandbox page at the three widths. It uses the Sandbox rather than the gallery, so nothing outside `src/ui/tree/**` changes. The baselines follow D97.
- Decisions to record after the human skim: D17 (S1 settled as in-order), D100 (transition timing), D101 (fit: scroll in its own box, scroll into view), D102 (role look: design pills, current ring styles).
