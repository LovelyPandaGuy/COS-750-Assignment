## ADDED Requirements

### Requirement: The report renders the readiness summary
C9's report screen and `/readiness` SHALL render the readiness summary (`ui-readiness`) from `readinessReport` and the learner state, with level tags from ID 5.1, the title without its rank, no change notes yet, read-only suggested questions and editable own questions. (FR-RDY-01, FR-RDY-02, FR-RDY-03, ID 5.1, ID 10.4, revamp-readiness questions 13 to 15)

#### Scenario: Report screen
- **GIVEN** every readiness question answered, `rdy-02` wrongly as Sure with the sign reversed and its return form also wrong
- **WHEN** C9's report screen is shown
- **THEN** the table has seven rows, LO2's row reads Revise, the confidence flags name LO2, LO1's row reads Ready, LO7's row shows the optional word, and the lecture list holds the balance-factor sign question

#### Scenario: Same report on /readiness
- **WHEN** `/readiness` is opened after every readiness question is right
- **THEN** the title "Structural Savant" is shown without a rank letter, and the seven rows read Ready

#### Scenario: Levels from ID 5.1
- **WHEN** the report is shown
- **THEN** LO3's row has the Apply and Understand tags, and LO6's row has the Evaluate tag

#### Scenario: Export on the report
- **WHEN** Copy is activated on `/readiness` with a working clipboard
- **THEN** the clipboard text holds all seven objectives and every listed lecture question, and the live region confirms

#### Scenario: Editing an own question
- **GIVEN** an own question "Why is one rotation enough?"
- **WHEN** it is edited to "Why is one rotation always enough?" and saved on `/readiness`
- **THEN** the stored own question reads the new text and the list shows it

#### Scenario: Suggested questions are read-only
- **WHEN** the report lists a suggested question from a misconception
- **THEN** it has no Edit or Remove button
