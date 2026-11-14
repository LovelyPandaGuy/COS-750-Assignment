# Spec Delta

## Purpose

Plays C9 "Am I ready for the lecture?" from `lessons/c9.json` and `questions/readiness.json`: one question per objective and two combined questions, missed questions returning once, a readiness report by the ID's ready rule, the student's own lecture question and a certificate of completion.

## ADDED Requirements

### Requirement: C9 plays its lesson file
`/module/C9` SHALL play the screens of `lessons/c9.json` on the lesson player: the intro, the readiness questions, the report, the student's own question and the certificate. (ID 7.2 C9)

#### Scenario: Screens in order
- **WHEN** C9 is played from the start
- **THEN** its screen headings are "Am I ready for the lecture?", "Readiness questions", "Your readiness report", "Your question for the lecture" and "Certificate of completion"

### Requirement: Readiness questions with returns
The question set SHALL ask `readiness.json` `questionIds` in order, one try each, with immediate four-part feedback and a confidence rating. Each question answered wrongly SHALL come back once, after the first pass, as its return form (`returnIds`), in the order missed. The combined search question (`rdy-09`) SHALL search the tree the combined build question built. (ID 7.2, ID 9.1, ID 10.2)

#### Scenario: A miss returns once
- **WHEN** `rdy-03` is answered wrongly and the first pass ends
- **THEN** `rdy-03-r` is asked once, and the set then ends whatever its answer

#### Scenario: Combined questions
- **WHEN** `rdy-08` and then `rdy-09` are shown
- **THEN** `rdy-09`'s tree is `13(10(7, ·), 24(20(15, ·), 30(25, 36)))`, the engine's result of `rdy-08`'s insert sequence

### Requirement: Ready or Revise per objective
The report SHALL show each of LO1 to LO7 as Ready or Revise by `readyRule`: Ready when the objective's question is right, first time or in its return form; LO5 also needs `rdy-08` and LO3 also needs `rdy-09`. LO7 SHALL be marked optional and SHALL never make the overall result Revise. Each objective SHALL link to its lesson. (ID 7.2, ID 9.1, `readiness.json`)

#### Scenario: Return form counts
- **WHEN** `rdy-02` is missed and `rdy-02-r` is right
- **THEN** LO2 reads Ready

#### Scenario: Combined question counts
- **WHEN** `rdy-05` is right and `rdy-08` is missed twice
- **THEN** LO5 reads Revise

#### Scenario: LO7 optional
- **WHEN** only LO7 reads Revise
- **THEN** the overall result is Ready

### Requirement: The report's flags, title and lists
The report SHALL show at the top the overall title from `rewards.json` for the share of all criteria met across the readiness questions; flag each objective with a wrong answer given as "Sure"; list one lecture question (`misconceptions.json` `lectureQuestion`) for each misconception of a wrong answer not later put right; and list the "listen for" points. (ID 9.2, ID 10.4, `rewards.json` `overallTitle`, `c9-s03`)

#### Scenario: Title
- **WHEN** every readiness question is right
- **THEN** the title is "Structural Savant"

#### Scenario: Confident wrong answer
- **WHEN** `rdy-02` is answered wrongly as Sure
- **THEN** LO2 carries the flag

#### Scenario: Lecture question from a misconception
- **WHEN** `rdy-02` is answered with the sign reversed
- **THEN** "Which sign convention does the lecture use for balance factors, and what does a negative value mean?" is listed

### Requirement: The student's own lecture question
The free-text screen SHALL let the student write one question for the lecture, store it with the lecture questions, and show it in the report's list. (ID 7.2, FR-RDY-02)

#### Scenario: Stored and listed
- **WHEN** a question is written and saved
- **THEN** it is in the learner state and the report lists it

### Requirement: Certificate of completion
The certificate screen SHALL ask for a name and generate a certificate from `rewards.json` `certificateText`: the heading, the body with the name, the lessons completed (n of 9) and the overall title, the footer with today's date, and the bonus note. The name SHALL NOT be stored anywhere. A Print button SHALL print it with the browser's Print. (ID 7.2, ID 10.4)

#### Scenario: Generated
- **GIVEN** eight lessons completed and the title AVL Ace
- **WHEN** "Ada" is typed and the certificate is generated
- **THEN** it reads "Ada completed 8 of 9 lessons of the COS212 AVL tree app and earned the title AVL Ace."

#### Scenario: Name not stored
- **WHEN** a certificate is generated
- **THEN** neither local storage nor the learner state contains the name

### Requirement: The readiness page shows the report
`/readiness` (the TopBar's "Lecture questions") SHALL show the same report as C9's report screen, from the stored attempts. (FR-RDY-01)

#### Scenario: Same report
- **WHEN** `/readiness` is opened after C9's questions
- **THEN** it shows the same Ready or Revise per objective and the same lecture questions
