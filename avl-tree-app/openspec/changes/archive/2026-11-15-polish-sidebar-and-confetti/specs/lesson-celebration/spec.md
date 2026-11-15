# Spec Delta

## MODIFIED Requirements

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
