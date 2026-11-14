# ui-feedback (delta)

## ADDED Requirements

### Requirement: Feedback states are in the state matrix and meet the quality bar
Each state of FeedbackPanel, FullAnswer, LectureQuestionDraft, ScaffoldPanel and the Hint button SHALL have a state-matrix entry, and each entry SHALL pass the ui-foundation quality-bar requirements: three widths in light and dark, axe, the keyboard walk, the colour simulations and forced colours, targets and text size, reduced motion, and calm wording. (Quality bar 1 to 10, ui-quality-sweep)

#### Scenario: States listed
- **WHEN** the state-matrix manifest is read
- **THEN** it has an entry for each of these states: each FeedbackPanel variant, FullAnswer, LectureQuestionDraft empty and saved, ScaffoldPanel at each rung, the Hint button with hints left and with none

#### Scenario: Entries pass
- **WHEN** the matrix spec and the quality checks run on those entries
- **THEN** each has a matching baseline at 390, 768 and 1366 px in light and dark, and each quality-bar check passes or is recorded as a deferred finding in the change that deferred it
