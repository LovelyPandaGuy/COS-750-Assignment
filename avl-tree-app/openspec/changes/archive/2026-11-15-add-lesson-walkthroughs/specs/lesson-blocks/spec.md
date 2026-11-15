# Spec Delta

## ADDED Requirements

### Requirement: How the app works is a walkthrough
C1's "How the app works" screen (`c1-s03`) SHALL show a small drawn lesson screen and step through its points with the replay step controls: at step n the caption is the n-th point, word for word, and the part that point is about is lit. The mapping of points to parts SHALL come from one content record. The points SHALL also be available as a plain list. (ID 7.2 C1, ID 8.1, ID 8.2, ID 11, D170)

#### Scenario: Steps follow the points
- **WHEN** `c1-s03` is shown and Step is pressed seven times
- **THEN** the captions are the screen's seven points in order (Back, Play or Pause, Step and the speeds work as in a tree replay), and at step 4 the lit part is the Sure and Not sure answer row of a mini-screen that also draws a sidebar strip, a title, a tiny tree, the control strip and a title badge

#### Scenario: Mapping matches the content
- **WHEN** the walkthrough mapping and `c1-s03` are read
- **THEN** the mapping has exactly one entry per point, and each names a part the mini-screen draws

#### Scenario: Not colour alone
- **WHEN** a part is lit
- **THEN** it carries the "▶ here" label and a ring style different from the other parts

#### Scenario: The list on demand
- **WHEN** "Show all as a list" is activated
- **THEN** the seven points are shown as a list, in order

#### Scenario: Accessible
- **WHEN** the screen is rendered, played to its end, and the list opened
- **THEN** axe reports no violations, the drawing is one image with the name "A lesson screen with its controls", and the caption region is a polite live region

#### Scenario: Reduced motion
- **GIVEN** `prefers-reduced-motion: reduce`
- **WHEN** the walkthrough steps
- **THEN** the highlight changes with no transition

## MODIFIED Requirements

### Requirement: Animation comparison
An animation with `compareWith` SHALL replay both operations side by side (stacked below 768 px, D118), with one step counter each. In every search animation, on each diagram, the node being compared at the current step SHALL be framed (the rounded frame of a highlighted node), and on the last step the node found, or the last node compared when the key is not found; position 0 frames nothing. (ID 8.1 "step counter on a chain vs a balanced tree", ID 8.3, D171)

#### Scenario: Two searches compared
- **WHEN** `c2-s06` is played to its end
- **THEN** the chain's counter shows 5 comparisons and the bushy tree's shows 3

#### Scenario: Where each search is, on both diagrams
- **WHEN** `c2-s06`'s chain is stepped twice with Next step, and the bushy tree once
- **THEN** the chain frames D (the second node compared) and the bushy tree frames E, each with the highlight frame, and stepping back once on the chain frames A

#### Scenario: Found
- **WHEN** both diagrams of `c2-s06` are played to their end
- **THEN** each frames Z

#### Scenario: Start frames nothing
- **WHEN** `c2-s06` is shown before any step
- **THEN** neither diagram has a framed node
