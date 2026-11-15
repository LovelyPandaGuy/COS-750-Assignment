# lesson-celebration Specification

## Purpose
Marks the completion of a lesson as ID 10.4 describes: a short burst of confetti the student can turn off, and the lesson's title from the rewards content, as encouragement without points or scores.

## Requirements

### Requirement: Confetti when a lesson is completed
When a lesson becomes completed (it is added to the completed modules), confetti SHALL fire once from two side cannons (bottom-left and bottom-right, towards the middle) for `rewards.json` `confetti.durationMs` (1500 ms), drawn on a canvas that is decorative, hidden from assistive technology, not catching pointer input, in the palette and tree colours, and removed at most 4 s after completion. It SHALL NOT play when the Confetti setting is off or the system asks for reduced motion, nor when a lesson already completed is visited again. (ID 10.4, `rewards.json` confetti, D169, D173, quality bar 9)

#### Scenario: Plays on completion
- **GIVEN** the Confetti setting on and no reduced motion
- **WHEN** the last C3 check question is finished and C3 becomes completed
- **THEN** a confetti canvas with `aria-hidden="true"` and `pointer-events: none` is shown, both cannons fire (one from each bottom corner) for 1500 ms with the palette and tree colours, and the canvas is gone within 4 s

#### Scenario: Setting off
- **GIVEN** the Confetti setting off
- **WHEN** C3 becomes completed
- **THEN** no confetti element is shown

#### Scenario: Reduced motion
- **GIVEN** `prefers-reduced-motion: reduce`
- **WHEN** C3 becomes completed
- **THEN** no confetti element is shown

#### Scenario: Once only
- **GIVEN** C3 already completed
- **WHEN** its check and summary are visited again
- **THEN** no confetti element is shown

### Requirement: The lesson's title on its summary
The summary screen of each lesson with a check (C2 to C8) SHALL show "Your title for this lesson" with the `rewards.json` title and message for the share of that lesson's check criteria met, once its check is finished; before then it SHALL show no title. The words SHALL be encouragement only: no points, score, rank or comparison. (ID 10.4, ID 9.3, FR-MOT-04, D169)

#### Scenario: Every criterion met
- **GIVEN** every C3 check question answered right
- **WHEN** `c3-s13` is shown
- **THEN** it shows "Your title for this lesson", "Structural Savant" and that title's message

#### Scenario: Part met
- **GIVEN** half of C3's check criteria met and the check finished
- **WHEN** the summary is shown
- **THEN** it shows the title whose `minShare` is the highest at or below one half

#### Scenario: Not finished
- **GIVEN** C3's check not finished
- **WHEN** the summary is shown
- **THEN** no title is shown

#### Scenario: No scores
- **WHEN** the title panel's text is read
- **THEN** it contains none of "score", "points", "rank", "grade", "pass" or "fail"
