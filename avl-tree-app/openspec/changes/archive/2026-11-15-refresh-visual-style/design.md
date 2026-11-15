# Design

## Context

See proposal.md for why. All colours are tokens in `src/ui/tokens.css`: light under `:root`, and dark both under `prefers-color-scheme` and `[data-theme='dark']`. `tests/tokens.contrast.test.ts` checks the pairs. The node colours (`--node-*`) follow ID 11.1.

`TreeView` renders `.tree-view` as follows: a `.tree-scroll` region with the SVG, then the "Describe tree" button, then the hidden description. The Playwright baselines (`tests/visual`) capture every state at three widths in two themes.

## Goals / Non-Goals

**Goals:**
- A livelier interface by changing token values, with no component restyled by hand.
- One consistent, unobtrusive place for "Describe" on every tree.

**Non-Goals:**
- Changing node colours or their shape and text backups.
- New layout or typography.

## Decisions

### 1. Values only, plus two tokens (D165)

The existing action tokens get the new values in both themes, and `--bg-page` moves to #F8F7FD in light. Two new tokens, `--accent-highlight` and `--accent-highlight-tint`, are used in three places only:
- the sidebar's viewed lesson, as a magenta left edge (with its existing thick border and bold, underlined title, D164);
- the top rule of each sandbox section, thicker (with the heading);
- the left edge of the lesson's title panel (with its bold title and heading, D169).

The replay's progress bar was the first choice, but a `<progress>` element cannot carry a non-colour cue in the same rule, so the title panel replaced it. The dark pressed value equals the dark hover (#C8BBFF), because the dark-tokens test requires assumed values to reuse a stated one.

So the new hue always comes with an existing non-colour signal. The dark block gets matching values, and the "dark tokens are complete" test covers the two new ones.

*Alternative:* a teal accent. This was rejected because teal sits close to the tree's sky blue (#56B4E9) and to the checked badge (`--tree-balanced`).

### 2. A header strip in the tree box (D166)

`.tree-view` becomes a bordered box holding:
1. `.tree-view-header`, a thin flex row with `justify-content: flex-end` and the quiet describe button: an aria-hidden "ℹ", the visible word "Describe", and the accessible name "Describe tree" via `aria-label`, so the name contains the visible word (WCAG 2.5.3);
2. `.tree-scroll`;
3. the description panel.

The scroll region's own border moves to the box. The button keeps `aria-expanded`, `aria-controls` and a 44 px target, with small text, so it reads as light while staying easy to hit. Editor overlays and layers are unaffected, because they live inside `.tree-scroll`.

*Alternative:* overlaying the button on the drawing's corner. This was rejected because with in-order layout the root can sit in any corner, so a node could be covered.

### 3. Baselines

Every visual baseline changes with the palette. Regenerating them is a task with a human look at a sample (light and dark, three widths) before they are committed.

### Decision rows

| ID | Topic | Decision |
| --- | --- | --- |
| D165 | Interface palette | Vivid violet action colour (#5B3FD6 light, #B7A6FF dark), warm magenta highlight accent (#B02E78, #F28BC4) for emphasis only, page #F8F7FD; all pairs WCAG AA; the ID 11.1 tree colours unchanged; the accent always comes with a non-colour signal. User request (15 Nov). |
| D166 | Describe tree placement | A small "ℹ Describe" (named "Describe tree") in a header strip at the top-right of every tree box, above the drawing; the description opens inside the box. User choice (15 Nov). |

## Risks / Trade-offs

- [Violet buttons next to the blue balanced nodes] → They differ in hue (about 260° against 200°) and in lightness. The design-system review in task 3.3 checks them side by side.
- [Every screenshot baseline changes] → They are regenerated and the change is reviewed visually. No logic changes.

## Migration Plan

No data migration. Rollback is reverting the token values.
