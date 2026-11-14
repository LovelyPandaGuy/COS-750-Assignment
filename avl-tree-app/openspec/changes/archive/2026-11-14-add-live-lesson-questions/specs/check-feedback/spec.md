# Spec Delta

## MODIFIED Requirements

### Requirement: Four parts
After a checked answer, feedback SHALL show four parts in order (`conventions.feedback.parts`): a verdict, the reason, a "Review: {concept}" link, and the next step. The verdict SHALL be `verdictCorrect` ("That's right.") for a right answer, "Almost there." when part of the answer is right, and "Not quite." otherwise. The reason SHALL be the content's explanation for the answer (lesson-questions); a right answer SHALL get its brief explanation too. The next step SHALL be "Try again" while tries remain and "Continue" otherwise. (ID 10.1, ID 10.2; supersedes D27's wording)

#### Scenario: Wrong answer
- **WHEN** a wrong option of `chk6-02` with a misconception is checked on the first attempt
- **THEN** feedback reads "Not quite.", then that option's explanation, then "Review: the four cases", then "Try again"

#### Scenario: Right answer
- **WHEN** the right option of `chk2-01` is checked
- **THEN** feedback reads "That's right.", then its explanation, then the review link, then "Continue"

#### Scenario: No misconception recognised
- **WHEN** an `enter-values` answer that matches no `wrongAnswers` entry is checked
- **THEN** feedback shows the question's `feedback.incorrect` and still shows all four parts

#### Scenario: At the cap
- **WHEN** the second wrong answer to a check question is checked
- **THEN** feedback reads "Not quite.", the reason, the review link and "Continue", with `conventions.feedback.afterReattempt`, and no "Try again"

### Requirement: Calm wording and no glyph
Feedback SHALL NOT use a cross, red, or any phrase in `conventions.feedback.neverSay` ("Wrong!", "Incorrect!", "Fail") to judge the student; a verdict SHALL always come with a word and an icon, never colour alone. (The ID's own explanations may describe an outcome, as in "something went wrong here".) Verdict wording SHALL come from `conventions.json`. A tree answer's feedback SHALL name what the student's tree missed, from the content's explanation. (ID 10.2, ID 11.1)

#### Scenario: Wording scan
- **WHEN** the feedback for every question's options, wrong answers and feedback in the content is scanned
- **THEN** none contains a cross glyph or "Wrong!", "Incorrect!" or "Fail"

#### Scenario: Tree divergence named
- **WHEN** `chk6-04` is answered with the plain BST insert and no rotation
- **THEN** feedback gives the question's explanation of the rotation that was missed

### Requirement: Feedback is announced and keeps the answer
Feedback SHALL be a polite live region whose text starts with the verdict. A wrong answer SHALL stay visible until Try again. The review link SHALL open the concept's screen (`conventions.concepts`): within the same lesson it moves to that screen; otherwise it opens that lesson. Following it SHALL leave stored attempts in place. (ID 10.1, FR-LRN-04)

#### Scenario: Live region
- **WHEN** an answer is checked
- **THEN** a polite status region contains the verdict first

#### Scenario: Review keeps work
- **GIVEN** a wrong answer checked on `c3-s11`
- **WHEN** "Review: balance factors" is followed
- **THEN** screen `c3-s05` is shown and the stored attempt is still in the learner state
