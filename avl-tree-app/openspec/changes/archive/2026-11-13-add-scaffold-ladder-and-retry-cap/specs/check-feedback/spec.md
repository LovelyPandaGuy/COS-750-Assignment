# check-feedback Delta

## MODIFIED Requirements

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
