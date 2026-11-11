# Design

## Context

- The engine has `Tree`, `TreeNode` (`key`, stored `height`, `left`, `right`), `balanceFactorOf`, `analyseTree` and the conventions module. Snapshots in traces can hold stale stored heights.
- The UI has the shell, tokens and focus rule (archived `add-design-tokens-and-shell`). Tokens give `--tree-*` colours, `--type-label` (14 px, for diagram annotations), `--type-mono`, `--target-min` and the focus variables. `tests/ui/styles.test.ts` forbids hex colours outside `tokens.css` and any outline override under `src/`.
- Design source: Design System "TreeView" and "Node anatomy" (key inside, "h · bf" beside it in mono; selected is a rounded square; keys Up, Left, Right, Enter), roles (colour plus ring plus tag), wireframes 1c, 1f, 1h, 1m (TreeView read-only, watch, interactive, editable) and the 1f note 4 description style. The wireframes' heights use the old convention (leaf 1); this change uses D2 (leaf 0).
- Spike S1 is not done (proposal question 1).

## Goals / Non-Goals

**Goals:** one `TreeView` that later screens compose, with correct numbers from the engine, roles that do not rely on colour, a text equivalent, and keyboard, pointer and touch selection.

**Non-Goals:** see proposal "Out of scope".

## Decisions

All three layout decisions are assumed until spike S1 (task 2.1).

1. **In-order layout (assumed, S1).** x = in-order index × spacing, y = depth × level height. It satisfies FR-VIS-01 by construction (distinct x in key order), so no overlap is possible when the spacing is at least the node diameter. Cost: it is wider than a compact layout (a perfect 15-node tree spans 15 slots, not 8). Alternative: a tidy-tree layout (Reingold–Tilford); narrower, but more code and no longer "in-order position" in x. S1 decides.
2. **Node diameter 44 units, spacing 56 × 96 (level spacing raised from 80 to fit the h, bf and Unbalanced lines) (assumed, S1).** 44 matches `--target-min`, so a node is also a valid touch target. The design gives no node size. The constants live in `layout.ts` and the stylesheet gets them as geometry, not as colours.
3. **Natural size with horizontal scroll (assumed, S1).** Shrinking a 15-node tree to 360 px would make nodes about 19 px and text about 7 px, which breaks FR-VIS-10 and NFR-02. So the SVG keeps its width and the container scrolls. On the shell's 66ch column even a perfect 15-node tree scrolls; the screens decide whether the tree pane breaks out of the column. The scroll region is focusable so keyboard users can scroll it.
4. **`TreeView` props.** `tree`, `roles?: Readonly<Record<Key, NodeRole>>`, `interactive?: boolean`, `selectedKey?: Key | null` (controlled) with `onSelect?: (key: Key) => void`, and `label: string` for the accessible name (screens supply it; it is copy). Uncontrolled selection is not supported, to keep one source of truth.
5. **Pure helpers, content apart.** `layoutTree` and `describeTreeParts` are pure and tested with fast-check. `describeTree` joins the parts with templates from `src/content/treeView.ts`, so wording changes touch one file.
6. **The ARIA tree pattern with flat treeitems.** The `tree` role goes on the `<svg>` and each node is a flat `<g role="treeitem">` with `aria-level` from its depth. Roving tabindex puts the single tab stop on the selected node or the root. Left and Right mean children here (the design's keys), not collapse and expand as in a file tree; there is nothing to collapse.
7. **Focus ring from the global rule.** SVG `<g tabindex>` takes the existing `[tabindex]:focus-visible` outline. The risk is that outlines on SVG elements differ between browsers (NFR-04). The review task checks Chrome, Firefox and Safari. If one fails, the fallback is a separate SVG ring drawn from the same focus variables, not an outline override (the style test forbids those).
8. **Ring styles in CSS, not in attributes.** `data-role` on each node, with `stroke-dasharray` (dashed, dotted), a heavier stroke (thick) and a second ring element for z, set in `tree-view.css` from `--tree-*` tokens. The test reads `data-ring` (solid, dotted, double, dashed, thick) so it can compare roles without a layout engine.
9. **Selection frame.** A `<rect>` with rounded corners around the node when selected; its radius uses `--radius-md`.
10. **`isOutOfBalance` in `conventions.ts`.** The UI needs the threshold and may not hard-code it. The three engine copies are not moved here, to keep the change small.
11. **Live region.** One visually hidden `aria-live="polite"` element per `TreeView` holds "Node 30 selected". It is cleared when selection is cleared, and not used for the tree description (that is a disclosure, so a long text never interrupts).
12. **Test limits.** jsdom has no layout or `:focus-visible`. Layout is tested as math, ring style via `data-ring`, flags as text, keyboard through `fireEvent.keyDown` and `document.activeElement`, targets and scroll from stylesheet text and attributes. Real focus rings, greyscale and the 360 px run are in the review task.

## Risks / Trade-offs

- Layout constants may change after S1; the property tests survive that, the "no shrinking" scenario may not if S1 chooses scaling.
- Showing stored heights means a stale snapshot can show a balance factor the real shape does not have. That is intended for trace steps but surprising elsewhere; callers pass only trees with correct heights outside traces.
- Flat treeitems with `aria-level` give less structure to a screen reader than nested groups. The description disclosure gives the full structure in text; a screen-reader pass is in the review task.
- Without a legend, "z" and "y" tags are unexplained until the step explanation exists.
