# Tasks

## 1. Red tests

- [x] 1.1 Write `tests/ui/tree-layout.test.ts` (property tests: key order by x, parents above children, no overlap over perfect trees, chains and random AVL and BST trees up to 15 nodes; purity; empty tree) and add the `isOutOfBalance` cases to `tests/conventions.test.ts` (range and agreement with `analyseTree`), named after FR-VIS-01 and FR-ENG-10; verify they fail only because `layoutTree` and `isOutOfBalance` do not exist.
- [x] 1.2 Write `tests/ui/tree-view.test.tsx` from the "Node roles", "Height and balance factor", "Text description", "Read-only and interactive modes", "Wide trees" and "Style comes from tokens" scenarios (ring styles, tags, contrast of tag colours, h and bf against the engine, "Unbalanced" as text, stale heights, description order and wording from content, disclosure, roles and axe, no shrinking, scroll region), named after FR-VIS-02, FR-VIS-07, FR-VIS-09, NFR-02; verify it fails only because `TreeView` and `describe` do not exist and that `styles.test.ts` still passes.
- [x] 1.3 Write `tests/ui/tree-keyboard.test.tsx` from the "Keyboard navigation and selection" scenarios (one tab stop, arrows, silent missing targets, Enter and live region, frame shape, click, roving tabindex, read-only ignores keys, 44 unit hit area), named after FR-VIS-10 and NFR-02; verify it fails only because `TreeView` does not exist.

## 2. Build

- [x] 2.1 Run spike S1 with the user: show the in-order layout at 15-node perfect and chain trees and at 360 px, then confirm or replace design decisions 1 to 3 and the node-key size (proposal question 2); record the result in `docs/decisions.md` and update `design.md` and the "Wide trees" requirement if scaling or a compact layout is chosen; verify the user has signed off before 2.3.
- [x] 2.2 Add `isOutOfBalance` to `src/engine/conventions.ts`; verify the conventions tests and `npm run typecheck` pass and that the single-source test still passes.
- [x] 2.3 Add `src/ui/tree/layout.ts` with the S1 constants; verify `tree-layout.test.ts` passes.
- [x] 2.4 Add `src/content/treeView.ts` (sentence templates and the words "Unbalanced", "new", "z", "y", "balanced", flagged for the user) with `content-author`, then `src/ui/tree/describe.ts`, `TreeView.tsx` (nodes, roles, h and bf, flag, description disclosure, both modes, scroll region) and `tree-view.css`; verify `tree-view.test.tsx` passes.
- [x] 2.5 Add roving tabindex, arrow keys, Enter, click, selected frame and the live region to `TreeView`; verify `tree-keyboard.test.tsx` passes.

## 3. Review

- [x] 3.1 Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all`; verify all pass with no new `[OPEN]` markers in `src/`.
- [ ] 3.2 Run the `reviewer` (fresh context) and `a11y-checker` subagents; then by hand: keyboard-only run, greyscale screenshot (roles and flag still distinguishable), focus ring on SVG nodes in Chrome, Firefox and Safari, a screen-reader pass over the interactive tree and the description, and a 360 px width run; verify the reports pass or findings are resolved.

## Workflow follow-up

- Answer the `[OPEN]` questions (S1 results, key size, description wording) and record decisions in `docs/decisions.md`.
- Next UI changes: step controls and replay (roles from trace steps, step narration, FR-VIS-03, 04, 07), then the editing change (FR-VIS-06, 08, 10).
- The user merges and archives; agents do not.
