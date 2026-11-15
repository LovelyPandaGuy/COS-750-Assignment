# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Please read these before `/opsx:apply`. This is change 1 of 3 from the user's list of 15 Nov (with `revamp-lesson-frame` and `add-lesson-walkthroughs`).

1. **Settled (user, 15 Nov): a brighter interface, the tree colours unchanged.** The app looks bland. The interface gets a more vibrant palette, while the four tree-node colours of ID 11.1 (Okabe–Ito: #0072B2, #E69F00, #F0E442, #56B4E9) stay exactly as they are.
2. **Assumed, not blocking: the palette (D165).** It is chosen to sit beside the tree colours without being confused with them, and never to carry right or wrong. The proposed values, with their WCAG contrast:

   | Token | Light | Dark |
   | --- | --- | --- |
   | `--action-primary` | vivid violet #5B3FD6 (6.7:1 on white) | #B7A6FF (7.8:1 on the dark surface) |
   | `--action-primary-hover` | #4A2FC2 | #C8BBFF |
   | `--action-primary-pressed` | #3B229F | #C8BBFF (equal to the dark hover: assumed dark values reuse a stated one) |
   | `--action-primary-tint` | #EEEAFE (primary text on it 5.7:1) | #2D2652 |
   | `--accent-highlight` (new) | warm magenta #B02E78 (6.0:1) | #F28BC4 (7.3:1) |
   | `--accent-highlight-tint` (new) | #FBEAF3 | #3A2233 |
   | `--bg-page` | a light violet-white #F8F7FD (body text 15:1) | unchanged |

   - Violet is a hue no tree state uses. Magenta is from the same colour-blind-safe family as Okabe–Ito's reddish purple, and is kept for emphasis only: the current lesson, section rules, the active step. The red and green pair is still never used (ID 11.1).
   - The focus ring follows `--action-primary` (at least 3:1 against both backgrounds).
   - Every value is one token in `src/ui/tokens.css`, so a different choice later changes one place.
3. **Settled (user, 15 Nov): "ℹ Describe" moves into a header strip at the top-right of the tree box (D166).** On every tree, a thin strip across the top of the tree box holds a small quiet "ℹ Describe" button on the right, with a 44 px target. It never covers a node, because it sits above the drawing. The description opens inside the box, under the strip. It is named "Describe tree" for assistive technology.
4. **Flagged for the user to read:** the visible label "ℹ Describe" (the full name stays "Describe tree"), and the colour values above.

Serves ID 11.1 and 11.2, ID 8.3 (low load), NFR-02 (WCAG AA), FR-VIS-07 and FR-VIS-09, the design system's colour section, and D3.

## Why

The user found the prototype bland. The interface uses a muted navy (#3340A0) on near-white and grey, and the full-width "Describe tree" button under every tree looks out of place.

## What Changes

- **Palette (changed):** the action colours, a new highlight accent, and the page background, in light and dark. The tree colours are untouched.
- **Highlight accent (new use):** the sidebar's viewed lesson, the sandbox section rules and the lesson's title panel use the magenta accent as well as their existing non-colour signals.
- **"Describe tree" (changed):** a small "ℹ Describe" in a header strip at the top-right of every tree box.
- **Visual baselines (refreshed):** the Playwright baselines are regenerated for the new palette.

## Out of scope

- The tree node colours and their non-colour backups (ID 11.1).
- The text and layout of content (the user, 15 Nov: "the text is fine the way it is").
- Fonts and spacing.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `app-shell`: a new requirement, "A brighter palette beside the tree colours".
- `tree-view`: "Text description" (the describe control's place and look).

## Impact

- Changed:
  - `src/ui/tokens.css`, the light and dark values, plus two new tokens;
  - `src/ui/tree/TreeView.tsx` and `tree-view.css`, the header strip;
  - `src/content/treeView.ts`, the short label;
  - small accent uses in `sidebar.css`, `sandbox.css` and `lesson.css`.
- Tests: the token contrast test (new pairs), tree-view tests (the strip and its position), and the visual baselines.
- Decisions: D165 and D166.
- There are no new dependencies, no storage change and no network calls.
