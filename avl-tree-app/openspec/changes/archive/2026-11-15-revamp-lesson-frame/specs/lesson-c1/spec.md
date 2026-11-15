# Spec Delta

## MODIFIED Requirements

### Requirement: C1 plays its lesson file
`/module/C1` SHALL play the screens of `lessons/c1.json` on the lesson player, in order: the welcome, the route with the learning objectives, how the app works, the conventions card (its tree and points), the settings, the readiness questions and the result. The lessons themselves are listed by the sidebar, not on the route screen. (ID 7.2 C1, D158, D168)

#### Scenario: Screens in order
- **WHEN** C1 is played from the start
- **THEN** its screen headings are "Welcome", "Learning objectives", "How the app works", "The conventions card", "Settings", "Quick readiness check" and "Your result"

#### Scenario: Conventions card
- **WHEN** "The conventions card" is shown
- **THEN** its tree from 20, 10, 40, 30, 50 shows heights and balance factors and its five points are listed

#### Scenario: No lesson outline
- **WHEN** any C1 screen is shown
- **THEN** there is no outline of C1's screens, only the "Lessons" sidebar
