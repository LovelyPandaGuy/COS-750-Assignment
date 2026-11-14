# Tasks

Scope: `src/ui/tree/**` and tests only. Read proposal questions 1 to 11 first; the tasks follow their recommendations.

## 1. Red tests (test-writer)

- [x] 1.1 Extend `tests/ui/tree-layout.test.ts` with fast-check properties over trees of up to 15 nodes: parent strictly between its children with the root on top, a single rotation (`rotateLeft`/`rotateRight` from the engine, at any node) leaves every key's x unchanged, and with slot keys covering both trees an insert or delete leaves every shared key's x unchanged while no-overlap and in-order still hold. Name each test after FR-VIS-01 or D17. Verify that the new cases fail only because `slots` does not exist and that the old cases pass.
- [x] 1.2 Extend `tests/ui/tree-view.test.tsx` and `tests/ui/tree-keyboard.test.tsx` for the modified and added requirements:
  - greyscale role pairs, pill tags (fill and text tokens), the unbalanced annotation mark, and the hover and selected-frame tokens from the stylesheet;
  - keyboard reachability of every node (property);
  - the description and drawn keys after a sequence of up to 10 engine operations (property);
  - the `announce` prop and `overlay` (positions and 4 empty slots);
  - `scrollIntoView` on focus and on the n node (formerly z, D97);
  - the conventions `vi.mock` sign flip, and the source scan of `src/ui/tree/`.

  Name each after FR-VIS-02, 07, 09, 10, NFR-02 or D2. Verify the new cases fail for the expected reason and the old cases still pass.
- [x] 1.3 Write `tests/ui/tree-motion.test.tsx` with fake timers and a stubbed `requestAnimationFrame` and `matchMedia`. Cover: nodes slide (positions at 0, T/2 and T), edges follow nodes, insert and delete with slot keys, insert without them, accessibility and focus following the new tree at once, a change mid-transition starting from drawn positions, and snapping under reduced motion, under `transitionMs={0}` and after the preference turns on. Write `tests/visual/tree-view.spec.ts`: the Sandbox with keys 1 to 15 in order and rebalancing off, at 390, 768 and 1366, with no page scroll, the tree region scrolling sideways, and hit areas of at least 44 × 44 CSS px. Name tests after NFR-03 (confirm the ID, proposal question 10), FR-VIS-10 or NFR-04. Verify that `npm test` fails only in the new cases and that `npm run test:visual` fails only in the new file. Then ask the user before committing the red tests.

## 2. Build (implementer, `src/ui/tree/` only)

- [x] 2.1 Add optional `slots` to `layoutTree` (x from each key's index among the slot keys; the width from their count) and return the empty child slots (design decision 1). The default call must be unchanged. Verify that every `tree-layout` test passes.
- [x] 2.2 Add `src/ui/tree/motion.ts` with `TREE_TRANSITION_MS = 300`, `prefersReducedMotion()` read at each change, and `useTweenedLayout`. The hook eases in and out from the drawn positions, snaps for 0, for reduced motion or when `requestAnimationFrame` is missing, and handles a change mid-transition (design decisions 2 to 4). Verify that the hook-level cases in `tree-motion.test.tsx` pass.
- [x] 2.3 Wire `TreeView.tsx`:
  - draw nodes and edges from the tweened layout;
  - take ARIA, names and description from the target tree;
  - add the optional props `slots`, `transitionMs`, `announce` and `overlay`;
  - add scroll-into-view for focus and the n node (formerly z, D97);
  - add the `data-unbalanced` mark on the metrics line, and the pill-tag `<rect>` (design decisions 5, 6 and 8).

  Verify that every tree test passes and that the whole `npm test` suite still passes with no caller changed (15 callers).
- [x] 2.4 Update `tree-view.css` (tokens only): pill tags with a surface-colour text and the dark-theme text, hover, the selected frame filled with the tint, and the z-coloured bold annotation (design decision 7). Verify that `npm run lint` and the style scan pass, run `npm run test:visual`, and update only the tree baselines that changed (D122). List them in the change's review notes.

## 3. Critique, then polish

- [x] 3.1 Critique (read-only): use the `frontend-design` skill to score the tree view at 390, 768 and 1366 against every line of `.claude/docs/design/quality-bar.md` and screen specs 1f, 1g, 1i and 1m. Write the findings to `openspec/changes/revamp-tree-view/review.md` under "Critique". Do not edit code. Verify the file lists all ten quality-bar lines, each with pass or a finding.
- [ ] 3.2 Polish (ui-polisher, CSS and layout markup in `src/ui/tree/` only, no tokens, logic or tests): fix each critique finding inside the design system. Verify that `npm test`, `npm run lint` and `npm run test:visual` pass and that every quality-bar line in `review.md` now reads pass.

## 4. Review

- [ ] 4.1 Full check: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:visual` and `openspec validate revamp-tree-view --strict` all pass. Then the `reviewer` (fresh context, against the spec, D2 and the quality bar) and the `a11y-checker` report pass, or their findings are resolved. The a11y-checker also runs the keyboard-only pass, the greyscale and three colour-vision simulations (D25), and reduced motion with the OS setting on. Record the results in `review.md`.

## Workflow follow-up

- After the human skim, record in `.claude/docs/decisions.md`: D17 settled as the S1 outcome (in-order layout), D125 transition timing, D126 phone fit (scroll in its own box, scroll into view), D127 role look (design pill tags for "NEW" and "n"; ring styles per D97). (The old role-ring difference for the designer is moot under D97.)
- Follow-up for change A2: the replay passes `slots` (its final tree's keys) so steps keep stable x.
- A human merges (the developer who did not write it) and runs `/opsx:archive`. Agents do not.
