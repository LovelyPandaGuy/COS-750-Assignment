# Spec Delta

## MODIFIED Requirements

### Requirement: Objectives block
An `objectives` screen SHALL have one heading, "Learning objectives", as its level-2 screen heading in place of the content's own title (such as "Goal"), followed by the screen's `text` and, when present, its `objectives` list; no second heading. It SHALL NOT show the screen's `points` list; the lessons sidebar lists the lessons instead. (ID 3.2 Gagné 2, D158, D168)

#### Scenario: C3 objectives
- **WHEN** `c3-s02` is shown
- **THEN** its only heading in the screen is the level-2 "Learning objectives", no "Goal" heading is shown, and "Calculate heights and balance factors, and decide whether a tree is an AVL tree (LO2)." is shown

#### Scenario: C1 route shows the objectives only
- **WHEN** `c1-s02` is shown
- **THEN** its intro line and its seven objectives are shown, and none of its nine lesson lines ("C2 When BSTs go lopsided", …) is in `main`
