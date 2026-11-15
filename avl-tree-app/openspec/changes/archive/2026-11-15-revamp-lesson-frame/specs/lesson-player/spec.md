# Spec Delta

## MODIFIED Requirements

### Requirement: The lesson frame
Every lesson screen SHALL show, from top to bottom: a top region with the lesson title as the level-1 heading and no position line (no "Lesson n of 9", "Screen n of m" or phase word; user decision overriding ID 8.2, D167); the screen title as a level-2 heading; the screen's main representation; its caption directly under it; its supporting text; and the control strip. The regions SHALL keep the same order and position on every screen of every lesson. (ID 8.2, ID 8.3, D23, D167)

#### Scenario: Top region
- **WHEN** the fourth screen of C3 is shown
- **THEN** the level-1 heading is "The AVL property", the top region holds no "Lesson 3 of 9", "Screen 4 of 13" or phase word, and the level-2 heading is "Height"

#### Scenario: Same regions everywhere
- **WHEN** every screen of C2 to C8 is rendered
- **THEN** each has, in document order, the top region, the screen heading, the main region, the caption region (empty when the screen has no caption) and the control strip

## REMOVED Requirements

### Requirement: The screen's phase is shown in words
**Reason**: The user asked to remove the line under every lesson title, including the phase word (15 Nov, D167), overriding ID 8.2's progress indicator.
**Migration**: The Lessons sidebar shows the current lesson in words (D155); each screen keeps its own level-2 heading.
