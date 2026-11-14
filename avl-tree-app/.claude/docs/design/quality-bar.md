# UI quality bar ("10 out of 10")

A UI change is done only when every line passes. The `ui-polisher` works to it, the `reviewer` scores it, and the other developer checks it before merge. Record the result in the change's review notes.

| # | Check | How it is checked |
| --- | --- | --- |
| 1 | Matches the screen spec in `docs/design/screens/` (layout, components, states, notes) | reviewer compares screen and spec; gaps are `[OPEN]`, not guessed |
| 2 | Tokens only: no colour, font, size or radius outside `src/ui/tokens.css` | `npm run lint` (stylelint rule) |
| 3 | Every state exists: default, hover, focus, selected, disabled, not quite yet | reviewer walks the component states |
| 4 | Works at 390, 768 and 1366 px wide with no horizontal scroll | screenshots at the three widths |
| 5 | axe has no violations | `npm test` |
| 6 | Keyboard only: every action reachable, visible focus, logical order | reviewer walks it; a11y-checker reports |
| 7 | Colour is never the only signal; passes greyscale and the three colour-vision simulations | design-system "View as" control or Chrome DevTools, Rendering, Emulate vision deficiencies |
| 8 | Targets at least 44 px; running text at least 16 px | a11y-checker |
| 9 | Reduced motion respected: steps snap, nothing slides | reviewer, with the OS setting on |
| 10 | Wording is calm and consistent: same term everywhere, no red, no "wrong" or "fail" | reviewer against the design system wording |

Screenshots at the three widths are committed as baselines once the foundation change adds the harness; later changes show the diff.
