# lesson-blocks Specification

## Purpose
Gives each content screen type one reusable component, so every lesson shows the same kind of content the same way and no JSON field of a content screen is dropped.

## Requirements

### Requirement: One component per content screen type
Each content screen type (`objectives`, `rule`, `diagram`, `worked-example`, `animation`, `pseudocode`, `summary`) SHALL be drawn by one shared component, used by every lesson. Every field the type carries in the shipped JSON SHALL be shown or used by that component; the validator SHALL report a field it does not know. (User request 13 Nov "do not drop any content field", ID 8.1)

#### Scenario: Same component everywhere
- **WHEN** the rule screens `c2-s07`, `c3-s05` and `c8-s04` are rendered
- **THEN** all three use the same rule component and the same markup structure

#### Scenario: Unknown field
- **GIVEN** a diagram screen with a field `zoom`
- **WHEN** the content is validated
- **THEN** there is a content error naming the screen and `zoom`

### Requirement: The screen's representation is the main region
The component SHALL put the screen's `representation` (static diagram, animated tree, written rule, worked example, pseudocode or text) in the main region and any other material as at most one supporting element, so each screen has one main representation. (ID 8.1, ID 8.2, D22)

#### Scenario: Written rule with a tree
- **WHEN** `c3-s05` (representation `written-rule`, with a tree) is shown
- **THEN** the main region holds the rule text and its points, and the tree is the one supporting element

#### Scenario: Diagram with text
- **WHEN** `c3-s04` (representation `static-diagram`) is shown
- **THEN** the main region holds the tree and the caption is directly under it

### Requirement: Objectives block
An `objectives` screen SHALL have one heading, "Learning objectives", as its level-2 screen heading in place of the content's own title (such as "Goal"), followed by the screen's `text` and, when present, its `objectives` list; no second heading. It SHALL NOT show the screen's `points` list; the lessons sidebar lists the lessons instead. (ID 3.2 Gagné 2, D158, D168)

#### Scenario: C3 objectives
- **WHEN** `c3-s02` is shown
- **THEN** its only heading in the screen is the level-2 "Learning objectives", no "Goal" heading is shown, and "Calculate heights and balance factors, and decide whether a tree is an AVL tree (LO2)." is shown

#### Scenario: C1 route shows the objectives only
- **WHEN** `c1-s02` is shown
- **THEN** its intro line and its seven objectives are shown, and none of its nine lesson lines ("C2 When BSTs go lopsided", …) is in `main`

### Requirement: Rule block
A `rule` screen SHALL show its `text` and its `points` as a list, its tree (when present) with the values its `show` list names and its caption under the tree, and its `showRule` text through Show the rule. A rule with `chart: "cases"` SHALL show the four-case chart built from `conventions.json` (case label, where the new key went, outside or inside, and the fix), as a table with headers. (ID 7.3, ID 8.1 "Case chart")

#### Scenario: Case chart
- **WHEN** `c5-s06` is shown
- **THEN** a table with four rows lists Case 1 (LL), Case 2 (LR), Case 3 (RL) and Case 4 (RR) with their fixes from `conventions.json`, followed by the five points

### Requirement: Diagram block
A `diagram` screen SHALL draw its tree read-only with the values its `show` list names, its caption under it and its `text` as supporting text. With `compareWith`, it SHALL draw both trees side by side (stacked below 768 px, D118), each with its own accessible name, and the first tree SHALL be labelled first. (ID 8.1 "Static labelled diagram")

#### Scenario: Two trees
- **WHEN** `c3-s08` is shown
- **THEN** two trees are drawn, from 5, 2, 8, 1, 4, 7, 3 and from 7, 2, 8, 1, 4, 3, 5 as plain BSTs, with balance factors shown, and node 7 of the second tree is marked unbalanced

### Requirement: Worked example block
A `worked-example` screen SHALL show its `text`, its tree (when present) with the values its `show` list names, and its `steps` as an ordered list revealed one step at a time with a "Next step" control and a "Show all steps" control. With `order: "post-order"`, each step that names a node SHALL highlight that node in the tree. Its `hint` SHALL open through the Hint control. (ID 6 social cognitive theory, ID 8.2 "chunking")

#### Scenario: Steps one at a time
- **WHEN** `c3-s07` is shown and "Next step" is activated twice
- **THEN** the first two of its eight steps are visible and the node named in the second step (10) is highlighted

#### Scenario: Example without a tree
- **WHEN** `c8-s06` is shown
- **THEN** its five steps are shown as a list and no tree is drawn

### Requirement: Animation block
An `animation` screen SHALL replay its `operation` on its tree step by step through the step replay, with the current step's caption under the tree, the step counter and Replay step. (ID 7.2, ID 8.1, ID 8.2)

#### Scenario: Search captions
- **WHEN** `c4-s04` is played to its end
- **THEN** the captions shown are "30 > 20: go right.", "30 < 40: go left." and "30 = 30: found."

#### Scenario: Leaf delete
- **WHEN** `c7-s04` is played to its end
- **THEN** 50 is removed, the captions update node 40 and then node 20, and no rotation happens

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

### Requirement: Animation supports
An animation with `roleSteps` SHALL list them beside the replay; with `inorderCheck` it SHALL show the in-order key sequence before and after, worded by `captions.inorderCheck`; with `pseudocode` it SHALL show that listing with the current step's line lit. (ID 7.2 C5, ID 8.1)

#### Scenario: Rotation with roles and in-order check
- **WHEN** `c5-s04` is played to its end
- **THEN** its three role steps are listed, the result tree is `80(30(20, 50(40, 60)), 90)`, and the in-order sequence before and after is the same

#### Scenario: Search with pseudocode
- **WHEN** `c4-s04` is played
- **THEN** the lit line of the loop listing follows each step, as `lineForStep.search-loop` says

### Requirement: What changed? after an animation
When an animation reaches its last step, the block SHALL show the prompt "What changed?" with the screen's caption as the answer revealed on request, as the ID's reflective-observation step. The prompt SHALL never be marked. (ID 8.1 Kolb "A 'what changed?' prompt after the animation")

#### Scenario: Prompt at the end
- **WHEN** `c5-s08` reaches its last step
- **THEN** "What changed?" is shown, and revealing it shows "The single rotation only moves the problem: C now has balance factor +2."

### Requirement: Pseudocode block
A `pseudocode` screen SHALL show each listing it names from `conventions.json`, side by side when there is room and stacked (loop first) below that width, each with its name as a heading and its lines numbered, and its `text` as supporting text. (ID 7.4, D45)

#### Scenario: Loop and recursive
- **WHEN** `c4-s06` is shown
- **THEN** the nine-line loop listing and the nine-line recursive listing from `conventions.json` are shown with headings

### Requirement: Summary block
A `summary` screen SHALL show its `points` in one short box (`format: "short-box"`), then the objectives recap (lesson-player). (ID 3.2 Gagné 9, ID 7.2)

#### Scenario: Short box
- **WHEN** `c3-s13` is shown
- **THEN** its three points are shown as a list inside one bordered box, followed by the objectives recap

#### Scenario: C2's full summary
- **WHEN** `c2-s13` (no `format`; ID 3.2: C2 uses every event in full) is shown
- **THEN** its four points are shown without the box, followed by the objectives recap

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
