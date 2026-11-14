# ui-question (delta)

## ADDED Requirements

### Requirement: Question states are in the state matrix and meet the quality bar
Each state of QuestionItem, ConfidenceRating and the lesson question card SHALL have a state-matrix entry, and each entry SHALL pass the ui-foundation quality-bar requirements: three widths in light and dark, axe, the keyboard walk, the colour simulations and forced colours, targets and text size, reduced motion, and calm wording. (Quality bar 1 to 10, ui-quality-sweep)

#### Scenario: States listed
- **WHEN** the state-matrix manifest is read
- **THEN** it has an entry for each of these states: unanswered, an option selected, confidence chosen, disabled Check answer, after "Not quite", after "Almost there", after "That's right", at the attempt cap with the answer shown

#### Scenario: Entries pass
- **WHEN** the matrix spec and the quality checks run on those entries
- **THEN** each has a matching baseline at 390, 768 and 1366 px in light and dark, and each quality-bar check passes or is recorded as a deferred finding in the change that deferred it
