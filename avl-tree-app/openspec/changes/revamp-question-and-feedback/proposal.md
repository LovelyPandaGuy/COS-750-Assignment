# Proposal: revamp-question-and-feedback

Owner: Dev B (lane B, D96). Capabilities: `ui-question`, `ui-feedback`.

## Open questions

None blocks the work. Questions 1 and 2 were settled by the user on 14 Nov, before drafting. The others have a recommendation that the specs follow; each one is isolated in a prop or a single file (D18). Decision numbers start at D103 because `revamp-tree-view` proposes D100 to D102.

1. **Scope beyond `src/ui/learn/**` (settled, proposed D103).** `QuestionItem`, `ConfidenceRating`, `FullAnswer` and `LectureQuestionDraft` are stubs in `src/ui/contracts.ts`. `tests/ui/contracts.test.tsx` fails once a real component with a stubbed name exists, and it pins 19 built and 26 stubbed. Their contracts also lack props this change needs.
   **User's choice:** this change may also:
   - edit `src/ui/contracts.ts`: move the four names to BUILT and widen their props;
   - delete their four stubs and their entries in `src/ui/stubs/index.ts`;
   - have the test-writer change the counts to 23 and 22.

   No stub has a caller, so widening breaks nothing.
2. **Panel name (settled, proposed D104).** The contract name `FeedbackPanel` points at the rotation feedback in `src/ui/practice/FeedbackPanel.tsx` (frame 1h). The design's check panel (correct, not quite yet, retry cap) is built as `src/ui/learn/FeedbackPanel.tsx`. The contract keeps pointing at the practice panel until a later change moves practice and checks onto the new one. For a while two components share the name.
3. **Answer on a first miss (INDEX conflict 20, D27, proposed D105).** Frame 1j shows the correct reasoning after attempt 1; the design system reveals the correct option only at the cap. The brief follows the design system.
   **Recommendation:** the not-quite-yet variant cannot take an answer (type and test), and QuestionItem marks the correct option only when told to at the cap. The "why" text is content: the content-author must write first-miss reasons that do not state the answer. Flagged for the user at G3.
4. **Confidence levels (D89; frames 1c, 1i).** The design draws three (Guessing, Fairly sure, Certain); the learner state stores two (`CONFIDENCE_LEVELS = ['sure', 'unsure']`), and D89 counts "sure" wrong answers.
   **Recommendation:** `ConfidenceRating` renders the ordered levels it is given (value and label each), with bars filling 1 to n. The stored type stays as it is.
   [OPEN] for the team: store three levels? That is a learner-state change, outside this one.
5. **Stepper vs a text field (`module-checks`).** The brief asks for a minus/plus stepper with no free typing; the `module-checks` spec gives number items "a text field that accepts the forms the marker accepts".
   **Recommendation:**
   - the stepper takes `min`, `max` and `step` as props;
   - it starts empty, and the first press goes to the nearest value to 0 within the range;
   - its response is the value as a signed string the marker accepts (`+2`, `0`, `-1`).

   Using it in checks is a later wiring change that modifies `module-checks`. Nothing here changes check screens.
6. **Ladder levels (D21, D76, proposed D106).** The brief lists four levels (nudge, fuller hint, worked example, guided step-through). Practice uses two (D21) and checks three (D76). The design's ScaffoldPanel draws rungs as open, available or waiting, and frame 1k adds "seen".
   **Recommendation:** `ScaffoldPanel` takes an ordered list of rungs from the caller. Each rung has a kind (one of the four), a state (open, seen, available, waiting), a title and a body. The hints left and the Hint action are props. `PRACTICE_HINTS` and `SCAFFOLD_LADDER` stay in config, and the caller decides which rungs a practice or a check gets.
7. **Hint button at zero.** **Recommendation:** it stays in place with `aria-disabled="true"` and shows 0, so its place in the control strip (D23) never shifts.
8. **Focus and announcements.** Focus moves to the feedback heading, and the live region also announces the verdict and the reason, so a screen reader may read the verdict twice.
   **Recommendation:**
   - keep both, as the brief asks;
   - the live region holds "verdict. why" only, never the buttons;
   - the a11y-checker confirms the reading order in task 4.1.
9. **Where the states are shown (D97, quality bar 4).** Checks at three widths need a browser page. The gallery is `src/gallery/` (outside the scope).
   **Recommendation, assumed:** the states live in `src/ui/learn/LearnGallery.tsx`, and one import line mounts it in `src/gallery/Gallery.tsx`. Please confirm at the skim. Without that line there are no baselines, and the widths are checked only by hand.
10. **Option letters (frame 1c note).** **Recommendation:** each option shows its letter (A, B, C, D). Arrow keys move within the radio group (native). Pressing a letter selects that option only while focus is inside the group, so letters never act as page-wide shortcuts.
11. **Requirement IDs.** The SE document (Google Doc) was not opened, so the IDs come from the screen specs and existing specs:
    - FR-ASM-01: answer types;
    - FR-ASM-03: the reason names the misconception;
    - FR-ASM-07: attempts and cap, shown only;
    - FR-SCA-02: the ladder;
    - FR-SCA-03: cap and lecture question;
    - FR-VIS-07: tree text description, through TreeView;
    - FR-VIS-10: keyboard, targets, Hint with count;
    - NFR-02: axe, keyboard, colour.

    Learning outcomes: the components serve the LO3 and LO7 check screens (1i to 1l) and PRE (1c); none is an outcome on its own.
    [OPEN] Does the SE document have an FR of its own for the confidence rating? Today only FR-RDY-01 (confident errors) uses it.
12. **Order.** `add-ui-foundation` is not archived yet (task 7.2 open), and this change edits its contracts. Merge after it is archived.

## Why

A student answers every check, the diagnostic and practice through a question, an optional confidence rating, feedback and a support ladder. Today these are drawn inline in `CheckItem`, with a text field for numbers, two confidence buttons and plain feedback text. Four of the design's components are still placeholders. Lane B needs them built once, in every state and at every width, before the check, diagnostic and readiness screens are rebuilt on them.

## What Changes

- New folder `src/ui/learn/` with presentational components. They show what they are given and import no content; every word arrives as a prop.
  - **QuestionItem:**
    - a stem, an optional read-only tree (`TreeViewProps`), and an optional editor slot (change A3);
    - multiple choice and identify-the-case as a lettered radio group, and compute-a-value as a minus/plus stepper;
    - states: default, hover, focus, selected, disabled, and submitted (your answer, correct, not quite yet);
    - the correct option is marked only when the caller reveals it.
  - **ConfidenceRating:** a radio group of the levels given, each with a text label and a bar count, operable by keyboard.
  - **FeedbackPanel** (correct, not quite yet, retry cap):
    - verdict heading, why, concept link and next step;
    - no red and no cross;
    - focus moves to the heading;
    - a polite live region holds the verdict and why;
    - the cap variant adds a full-answer slot and a lecture-question slot.
  - **FullAnswer:** a disclosure, collapsed by default, showing the engine's answer and explanation.
  - **LectureQuestionDraft:** an editable draft with Add and No thanks callbacks. Nothing is saved.
  - **ScaffoldPanel:** rungs as presentation states, and a Hint button that shows how many hints are left.
- `src/ui/contracts.ts`: the four names move to BUILT and their props widen. Their stubs are deleted.
- `src/ui/learn/LearnGallery.tsx`, plus one line in the gallery, and new visual baselines.
- **Out of scope:**
  - marking and correct answers (engine and assessment layer), the question bank, seeded variants and retry counting;
  - routing and storage;
  - the tree editor (A3; a slot only);
  - the interactive GuidedStepThrough (its stub stays);
  - CheckHeader;
  - all wording: fixtures say "Example verdict", and the content-author writes the real text later;
  - rewiring `CheckItem`, `CheckFeedback`, `ScaffoldLadder`, practice or the diagnostic onto the new components (a later change, which modifies `module-checks`, `check-feedback`, `scaffold-ladder` and `retry-cap`).

## Capabilities

### New Capabilities

- `ui-question`: QuestionItem and ConfidenceRating, in every state, answer type and width.
- `ui-feedback`: FeedbackPanel (three variants), FullAnswer, LectureQuestionDraft and ScaffoldPanel, plus focus and announcements.

### Modified Capabilities

None. The `ui-foundation` contract requirement does not pin the counts; only its test does. Existing check behaviour is unchanged until the wiring change.

## Impact

- New: `src/ui/learn/*` and tests under `tests/ui/learn/`, plus `tests/visual/learn.spec.ts`.
- Changed: `src/ui/contracts.ts`, `src/ui/stubs/index.ts` (four stubs removed), the counts in `tests/ui/contracts.test.tsx`, and one line in `src/gallery/Gallery.tsx`.
- No engine, content, storage or route change. One new dev dependency, `@testing-library/user-event`, so the keyboard-only scenarios run real Tab and radio-arrow behaviour (user's choice, 14 Nov). It is never shipped.
