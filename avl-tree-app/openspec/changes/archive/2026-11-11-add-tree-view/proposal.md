# Proposal

## Open questions

1. **[OPEN] Spike S1 has not been run.** You asked for the layout "from spike S1", but `.claude/docs/next-steps.md` lists S1 as still to do and no result exists in the repo. As agreed, the layout requirement is written from FR-VIS-01 only (up to 15 nodes, no overlaps, keys in in-order position) and task 2.1 runs S1 with you before the layout is built. Everything S1 would settle is listed in `design.md` decisions 1 to 3 and is marked as assumed: node size, spacing, in-order versus compact layout, and what happens on a 360 px screen. The red tests check properties (order, no overlap, parents above children), not constants, so S1 can change the numbers without changing the tests.
2. **[OPEN] Node key size.** The design says "Key inside (17px bold)". `tokens.css` has no 17 px size and CLAUDE.md says do not invent tokens. Default here: node keys use `--type-body` bold (16 px). Say if you want a `--type-node-key` token added to `tokens.css`.
3. **[OPEN] Description wording.** The wireframe (1f note 4) gives the style: "Root 40 (height 4, bf +1). Left child 20 (height 3, bf +2, unbalanced)…". It does not say how deeper nodes name their parent. I propose "Left child 10 of 20 (height 2, balance factor +1)", and "balance factor" in full rather than "bf" for screen-reader users with no assumed knowledge. This is wording beyond the ID, so it goes in `src/content/` and is flagged for you to read.
4. **Assumed, not blocking: the unbalanced test.** The engine already tests `Math.abs(bf) > 1` in three places, but `conventions.ts` has no function for it, and the UI may not hard-code it (D2, FR-ENG-10). This change adds `isOutOfBalance(bf)` to `conventions.ts` (a small delta on the `conventions` capability). The three existing engine uses are left alone; moving them is a separate clean-up.
5. **Assumed, not blocking: which numbers are shown.** Each node shows its stored height and the balance factor computed from its children's stored heights. In an insert trace the snapshots can hold stale heights (add-avl-insert-trace, question 2), and the view then shows what the step shows. For a finished tree these equal the real values.
6. **Assumed, not blocking: roles come from props.** `TreeView` takes a `roles` map (new, z, y, balanced) and draws it. Working out roles from a trace step belongs to the replay change. A node with no role is neutral. Any node whose balance factor is out of range also gets the text "Unbalanced", whether or not it has a role, so FR-VIS-09 holds on its own.
7. **Assumed, not blocking: read-only versus interactive.** The wireframe says "role=img + live description". An image cannot contain focusable nodes, so: read-only trees are `role="img"` with a short label and the description; interactive trees use the ARIA tree pattern with roving tabindex. The keys are the design's: Up parent, Left and Right children, Enter selects.
8. **Assumed, not blocking: keyboard edge cases.** A move with no target (Up at the root, Left on a node with no left child) does nothing and says nothing. Enter selects and does not deselect. No Home or End, because the design does not list them.
9. **Assumed, not blocking: no legend.** Beginners will not know "z" and "y". The design shows a legend in the design system but not on the screens; the step explanation (a later change) explains them. Not built here.
10. **Assumed, not blocking: step narration is later.** FR-VIS-07 also asks for a live region on every step. This change gives the tree description and the "Node 30 selected" announcement. The per-step text arrives with the step controls.

No `[OPEN]` item blocks the specs; 1 blocks only the layout constants, 2 and 3 only wording and size.

## Why

Every screen from Explore to Sandbox draws a tree. FR-VIS-01, 02, 07 and 09 are Must requirements, and the design's colour-never-alone rule means the roles, heights and balance factors need a shared component before any screen uses them. Building it once, with its keyboard behaviour, keeps the later screens from inventing their own.

## What Changes

- Add a pure layout function: in-order x positions, depth y positions, a size, no overlaps.
- Add `TreeView` (SVG): nodes with key, height and balance factor; roles shown by ring style, text tag and colour; an "Unbalanced" text flag; selected state; a short label and a full description.
- Add the text description (`describeTree`) and a disclosure to show it.
- Add keyboard navigation and selection (interactive mode), with a live region for "Node 30 selected".
- Add `isOutOfBalance` to the conventions module.
- Serves FR-VIS-01, FR-VIS-02, FR-VIS-07 (tree description and selection only), FR-VIS-09, FR-VIS-10 (44 px targets, keyboard and pointer selection; touch placement is a later change), NFR-02, FR-ENG-10. Learning outcome: none owned; it enables C2, C3 and C6 screens.

## Capabilities

### New Capabilities
- `tree-view`: layout, node rendering, roles, height and balance factor, text description, keyboard navigation and selection.

### Modified Capabilities
- `conventions`: adds the out-of-balance test to the conventions module.

## Out of scope

Step controls, replay, animation and "step back"; working out roles from a trace; step narration (FR-VIS-03, 04, 05, 07 step part, 11); editing (insert, delete, rotate, drag, tap-to-place; FR-VIS-06, 08, 10 editing part); the pseudocode panel; a legend; dark theme; routing and screens; moving the three existing `Math.abs(bf) > 1` uses into the conventions module.

## Impact

- New: `src/ui/tree/layout.ts`, `src/ui/tree/describe.ts`, `src/ui/tree/TreeView.tsx`, `src/ui/tree/tree-view.css`, `src/content/treeView.ts`.
- Changed: `src/engine/conventions.ts` (one function).
- Tests: `tests/ui/tree-layout.test.ts`, `tests/ui/tree-view.test.tsx`, `tests/ui/tree-keyboard.test.tsx`, `tests/conventions.test.ts` (one case). Existing tests, including `styles.test.ts` (no hex outside `tokens.css`, no outline overrides), must keep passing.
- No new dependencies. `add-avl-insert-trace` is engine-only and does not touch these files.
