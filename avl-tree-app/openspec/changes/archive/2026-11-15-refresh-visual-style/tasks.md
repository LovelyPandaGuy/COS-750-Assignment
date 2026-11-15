# Tasks

Roles as in `.claude/CLAUDE.md`. No task commits; the user commits. Change 1 of 3 (15 Nov list).

## 1. Red tests

- [x] 1.1 (test-writer) Extend `tests/tokens.contrast.test.ts` for the new values and pairs in light and dark, including the two new tokens and the unchanged node colours, and add a stylesheet scan that every `--accent-highlight` rule carries a non-colour signal. Extend the tree-view tests for the header strip: the button before the drawing, "ℹ Describe" with the name "Describe tree", the description inside the box, and the 44 px rule. Verify they fail only because the old values and placement are still there (D165, D166).

## 2. Build

- [x] 2.1 (content-author) Add the short visible label and the icon to `src/content/treeView.ts`. Verify `npm run typecheck` passes.
- [x] 2.2 (implementer, then ui-polisher) Set the D165 values and add the two tokens in `tokens.css` (light and both dark blocks), and use the accent in the sidebar, the sandbox section rules and the replay progress (design 1). Verify the contrast and accent tests pass and `npm run lint` passes.
- [x] 2.3 (implementer, then ui-polisher) Build the tree box header strip in `TreeView` and `tree-view.css` (design 2). Verify every tree-view, editor and sandbox test passes.
- [ ] 2.4 Regenerate the visual baselines with `npm run test:visual -- --update-snapshots`, then look at a sample of light and dark at 390, 768 and 1366 px. Verify `npm run test:visual` passes.

## 3. Records and review

- [x] 3.1 Add D165 and D166 to `.claude/docs/decisions.md` and note the palette in `.claude/docs/design/INDEX.md`. Verify `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `openspec validate --all` pass.
- [ ] 3.2 Run the reviewer and a11y-checker roles, including colour-vision emulation (protanopia, deuteranopia, tritanopia, achromatopsia) on a lesson, the sandbox and the editor. Verify the reports pass or findings are resolved.
