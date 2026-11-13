# check-feedback Specification

## Purpose
The four-part feedback shown after each checked answer: a calm verdict, why, a review link and the next step, with no red, cross or fail wording.

## Requirements

### Requirement: Four parts
After a checked answer, feedback SHALL show four parts in order: a verdict, why, a Review link, and the next step. The verdict SHALL be "That's right" for a correct answer and "Not quite yet" otherwise. Why SHALL be the marker's explanation, which names the misconception where one was recognised; a correct answer SHALL get a brief why too. The next step SHALL be Try again for a wrong answer with attempts left, Next question for a right one or Continue on the last item, and Continue after the retry cap is reached. (FR-ASM-03, FR-SCA-03, D27)

#### Scenario: Wrong answer
- **WHEN** a wrong option with a misconception is checked
- **THEN** feedback reads "Not quite yet", then that option's explanation, then Review, then Try again

#### Scenario: Right answer
- **WHEN** the right option is checked
- **THEN** feedback reads "That's right", then a brief why, then Review, then Next question

#### Scenario: No misconception recognised
- **WHEN** a number answer that matches no known misconception is checked
- **THEN** feedback shows the item's general explanation and still shows all four parts

#### Scenario: At the cap
- **WHEN** the third wrong answer is checked
- **THEN** feedback reads "Not quite yet", the why, Review and Continue, and no Try again

### Requirement: Calm wording and no glyph
Feedback SHALL NOT use a cross, tick-in-circle, red, "wrong", "incorrect" or "fail", and attempt markers in the check header SHALL NOT either. Verdict wording SHALL come from the content files. A tree answer's feedback SHALL name the first trace step the student's tree does not reach. (D27, FR-ASM-04)

#### Scenario: Wording scan
- **WHEN** the feedback text and attempt markers for every bank item and seed 0 to 99 are scanned
- **THEN** none contains a cross glyph or the words wrong, incorrect or fail

#### Scenario: Tree divergence named
- **WHEN** a trace-an-insert answer that skipped the rotation is checked
- **THEN** feedback names the rotation step as the first step not reached

### Requirement: Feedback is announced and keeps the answer
Feedback SHALL be a polite live region whose text starts with the verdict. A wrong answer SHALL stay visible and selected until Try again. The Review link SHALL open the module's Explore activity and leave the stored attempt in place. (FR-LRN-04, D27)

#### Scenario: Live region
- **WHEN** an answer is checked
- **THEN** a polite status region contains the verdict first

#### Scenario: Review keeps work
- **GIVEN** a wrong answer checked
- **WHEN** Review is followed and the learner returns to the check
- **THEN** the stored attempt is still in the learner state and the step is shown for the next attempt
