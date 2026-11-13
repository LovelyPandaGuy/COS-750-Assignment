# route-choice Delta

## MODIFIED Requirements

### Requirement: A route is recommended after a check
For a module whose Check activity is played step by step, the recommended route SHALL be the next module in the guided order C1 to C9, including the optional C7, when every required item of that check was answered correctly on its first attempt. When any required item was not, the recommended route SHALL be looking over this module again. The number of first-attempt misses that triggers this SHALL be one value in the config. The student still chooses. (D20, D28, assumed; routing cut-offs wait on the team)

#### Scenario: Next module
- **GIVEN** every item of each check answered correctly on attempt 0
- **WHEN** the routes after the C2, C3, C5, C6 and C8 checks are recommended
- **THEN** they are C3, C4, C6, C7 and C9

#### Scenario: All first time
- **GIVEN** every C2 item answered correctly on attempt 0
- **WHEN** the route after the C2 check is recommended
- **THEN** it is C3

#### Scenario: A miss
- **GIVEN** one C2 item answered wrongly first and then correctly
- **WHEN** the route after the C2 check is recommended
- **THEN** it is looking over C2 again

#### Scenario: Optional C7
- **GIVEN** C6 answered correctly first time
- **WHEN** the route after C6 is recommended
- **THEN** it is C7

### Requirement: Where next panel
On the last step of a module's Check activity, a "Where next?" panel SHALL show below the step text and above the control strip, with a level-3 heading and two buttons: the next module (its ID and D1 title) and "look over this module again". The word "Suggested" SHALL go with whichever the recommendation names. The control strip SHALL keep Back and Next unchanged, and Next SHALL stay the only primary button. No other step SHALL show the panel. Wording SHALL come from the content files. (D20, D23)

#### Scenario: Panel on the last check step
- **WHEN** the C2 Check activity reaches its last step after every item was right first time
- **THEN** a "Where next?" panel names "C3 The AVL property" with the word "Suggested", offers looking over C2 again, and the control strip still has Back and Next

#### Scenario: Suggested follows the result
- **WHEN** the same step is reached after a first-attempt miss
- **THEN** "Suggested" sits with looking over C2 again and not with C3

#### Scenario: Not on other steps
- **WHEN** any C2 Explore or Worked example step, or a question step of the C2 check, is shown
- **THEN** no "Where next?" panel is present

#### Scenario: One primary action
- **WHEN** the last C2 Check step is shown
- **THEN** exactly one element is styled as the primary button, and it is Next

#### Scenario: Accessible panel
- **WHEN** the last C2 and C3 Check steps are rendered
- **THEN** axe reports no violations and each panel button is at least 44 by 44 px
