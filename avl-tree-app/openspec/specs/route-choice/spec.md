# route-choice Specification

## Purpose

After a module's check, suggests where to go next and lets the student choose, logging both the suggestion and the choice so the pilot can see whether students follow the guided path.

## Requirements

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

### Requirement: The student chooses the way on
Choosing the recommended module SHALL open its module screen; choosing to look over the module SHALL open this module's screen; Next SHALL go to the path as before. Choosing SHALL NOT change the learner state. All three SHALL work by keyboard and touch. (D20, FR-LRN-04)

#### Scenario: Follow the suggestion
- **GIVEN** the last C2 Check step
- **WHEN** the suggested route is activated by keyboard
- **THEN** the C3 module screen is shown and the learner state is unchanged

#### Scenario: Look over again
- **GIVEN** the last C2 Check step
- **WHEN** "look over this module again" is activated
- **THEN** the C2 module screen is shown and the learner state is unchanged

#### Scenario: Next still goes to the path
- **GIVEN** the last C2 Check step
- **WHEN** Next is activated
- **THEN** the hub is shown

### Requirement: Route events are emitted
Showing the panel SHALL emit one `route_recommended` event with the module, the recommended target and a timestamp. Each choice on that step (suggested, look over, or Next to the path) SHALL emit one `route_chosen` event with the module, the recommended target, the chosen target and a timestamp. Events SHALL go to a replaceable sink that does nothing by default and SHALL NOT be stored or sent over the network. (D28)

#### Scenario: Recommendation logged
- **GIVEN** a test sink
- **WHEN** the last C2 Check step is shown
- **THEN** the sink received exactly one `route_recommended` event from C2 recommending C3

#### Scenario: Choice logged
- **GIVEN** a test sink and the last C2 Check step
- **WHEN** the suggested route, "look over this module again" or Next is activated (one per test)
- **THEN** the sink received one `route_chosen` event from C2 with recommended C3 and chosen C3, C2 or the path respectively

#### Scenario: No event elsewhere
- **GIVEN** a test sink
- **WHEN** the learner steps through C2 Explore and Worked example
- **THEN** the sink received no events

#### Scenario: Default sink does nothing
- **WHEN** route events are emitted with the default sink
- **THEN** nothing is written to storage and no error is thrown
