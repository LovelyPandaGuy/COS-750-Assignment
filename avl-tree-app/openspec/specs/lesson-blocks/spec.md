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
An `objectives` screen SHALL show a "Learning objectives" heading and the screen's `text`, and, when present, its `objectives` list and `points` list, each as a list. (ID 3.2 Gagné 2)

#### Scenario: C3 objectives
- **WHEN** `c3-s02` is shown
- **THEN** a "Learning objectives" heading and "Calculate heights and balance factors, and decide whether a tree is an AVL tree (LO2)." are shown

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
An animation with `compareWith` SHALL replay both operations side by side (stacked below 768 px, D118), with one step counter each. (ID 8.1 "step counter on a chain vs a balanced tree")

#### Scenario: Two searches compared
- **WHEN** `c2-s06` is played to its end
- **THEN** the chain's counter shows 5 comparisons and the bushy tree's shows 3

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
