# Spec Delta

## ADDED Requirements

### Requirement: A brighter palette beside the tree colours
The interface colours SHALL be the D165 palette in `src/ui/tokens.css`, in light and dark: a vivid violet action colour with its hover, pressed and tint values, a warm magenta highlight accent with its tint, and a light violet-white page background. The tree-node colours of ID 11.1 SHALL be unchanged. Every text and control pair SHALL meet WCAG AA, and no new colour SHALL be the only signal of a state. (ID 11.1, NFR-02, D165)

#### Scenario: Tree colours unchanged
- **WHEN** the tokens are read
- **THEN** `--node-balanced`, `--node-unbalanced`, `--node-rotating` and `--node-new` are #0072B2, #E69F00, #F0E442 and #56B4E9 in light and dark

#### Scenario: Contrast in both themes
- **WHEN** the contrast of each pair is computed in light and dark: the action colour on the surface and on the page, the surface text on the action colour, the action colour on its tint, the highlight accent on the surface and on the page, body text on each tint, and the focus ring on both backgrounds
- **THEN** each text pair is at least 4.5:1 and each control and focus pair at least 3:1

#### Scenario: Values
- **WHEN** the light tokens are read
- **THEN** `--action-primary` is #5B3FD6, `--accent-highlight` is #B02E78 and `--bg-page` is #F8F7FD

#### Scenario: Accent is never alone
- **WHEN** every stylesheet rule that uses `--accent-highlight` is read
- **THEN** each also sets a non-colour signal (a border style or width, a weight, an underline or a symbol) on the same element or names one that already exists there
