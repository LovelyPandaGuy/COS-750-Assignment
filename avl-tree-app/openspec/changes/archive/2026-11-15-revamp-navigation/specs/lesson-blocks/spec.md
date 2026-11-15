# Spec Delta

## MODIFIED Requirements

### Requirement: Objectives block
An `objectives` screen SHALL show a "Learning objectives" heading and the screen's `text`, and, when present, its `objectives` list. It SHALL NOT show the screen's `points` list; the lessons sidebar lists the lessons instead. (ID 3.2 Gagné 2, D158)

#### Scenario: C3 objectives
- **WHEN** `c3-s02` is shown
- **THEN** a "Learning objectives" heading and "Calculate heights and balance factors, and decide whether a tree is an AVL tree (LO2)." are shown

#### Scenario: C1 route shows the objectives only
- **WHEN** `c1-s02` "Your route" is shown
- **THEN** its intro line and its seven objectives are shown, and none of its nine lesson lines ("C2 When BSTs go lopsided", …) is in `main`
