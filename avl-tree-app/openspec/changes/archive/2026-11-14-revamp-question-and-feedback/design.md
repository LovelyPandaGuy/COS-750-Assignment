# Design: revamp-question-and-feedback

## Context

Check questions are drawn inline today:
- `src/ui/module/check/CheckItem.tsx` holds the radio options, a text field for numbers and two confidence buttons;
- `CheckFeedback.tsx` holds the verdict, why, Review and next step;
- `ScaffoldLadder.tsx` holds the three rungs.

The design (screens 1c and 1i to 1l, plus the design system's QuestionItem, ConfidenceRating, ScaffoldPanel and FeedbackPanel) asks for components with explicit states. `src/ui/contracts.ts` has stubs for QuestionItem, ConfidenceRating, FullAnswer and LectureQuestionDraft (lane B, D96). This change builds them as presentation only. Rewiring the screens onto them is a later change.

## Goals and non-goals

**Goals:**
- every state of every component, at three widths, keyboard only, with axe clean;
- wording only through props;
- the answer is never revealed before the cap.

**Non-goals:**
- marking, banks, seeds, retry counting, storage, routing and wording;
- the tree editor (slot only);
- the interactive GuidedStepThrough;
- changing any existing check, practice or diagnostic screen.

## Decisions

1. **Contracts widen; their callers are only stubs.** Each built component takes its contract from `contracts.ts`, so `QuestionItemProps` is the component's own prop type. Added props:
   - QuestionItem: `labels`, `tree?: TreeViewProps`, `editor?: ReactNode`, `revealCorrect?: string` (the engine's correct option ID; changed from a boolean at the merge with main), `range?: { min; max; step }`;
   - ConfidenceRating: `levels`, `optionalNote?`;
   - FullAnswer: `labels`;
   - LectureQuestionDraft: `labels`, `onChange` and `onDecline`.

   The names move to BUILT and the stubs are deleted, so the contracts test's counts become 23 and 22. Alternative considered: a separate base change first. Rejected by the user, because both changes would have to touch `contracts.ts`.
2. **Labels object, no content import.** Each component takes a `labels` object; functions are allowed where a number is woven in (`hint: (left) => string`). A source scan forbids `src/content/` imports under `src/ui/learn/`. Fixtures use neutral text ("Example verdict"). The content-author later adds `src/content/learn.ts`, and screens pass it in.
3. **The answer at the cap is guaranteed by types and by the caller.** `FeedbackPanel` props are a discriminated union on `variant`: only `cap` has `fullAnswer` and `lectureDraft`. QuestionItem marks the correct option only with `revealCorrect`. The component cannot know the attempt count (out of scope), so the cap is the caller's decision. Tests prove the component never reveals on its own.
4. **Stepper as a spin button.** The value is a `role="spinbutton"` with `aria-valuenow`, `aria-valuemin` and `aria-valuemax`, and `aria-valuetext` set to the signed string or the empty label. It has no text input; ArrowUp and ArrowDown match the buttons. Signed strings use the existing `signed()` from `src/ui/tree/describe.ts`, which is formatting only. Empty start avoids suggesting an answer. The first press goes to the in-range value nearest 0.
5. **Radio groups are native.** Options and confidence levels are `<input type="radio">` inside a `<fieldset>`/`<legend>`, so arrows, Space and form semantics come from the browser. Letter keys are a `keydown` on the fieldset (only while focus is inside it). Bars are an `aria-hidden` SVG, and the level's text label names the radio.
6. **Focus rules live in the components, keyed on prop changes.**
   - QuestionItem focuses its first input when `disabled` goes true to false (Try again).
   - FeedbackPanel focuses its heading when `variant` goes from none to set or changes.
   - Neither takes focus on mount.

   The previous value of each prop is kept in state and compared during render (the same pattern as `useTweenedLayout`); the focus call itself runs in an effect.
7. **Always-present live region.** FeedbackPanel renders `role="status"` even with no variant (the `CheckFeedback` pattern), so the first feedback is announced. Its text is `${verdict}. ${why}`; buttons stay outside it.
8. **ScaffoldPanel is data driven.** `rungs: { kind, state, title, body: ReactNode }[]`, `hintsLeft`, `onHint` and `labels`. The rung order, the count and the practice-versus-check policy come from the caller (`PRACTICE_HINTS`, `SCAFFOLD_LADDER` stay in config). The Hint button uses `aria-disabled` rather than `disabled`, so it stays focusable and explains itself at 0.
9. **Styling.** One stylesheet, `src/ui/learn/learn.css`, built from tokens:
   - `--feedback-*` for the panels;
   - `--action-primary*` for selection;
   - borders: solid default, thick selected, dashed not quite yet and waiting, grey seen;
   - the shared focus ring from tokens.css;
   - layout mobile first with the two allowed width queries (D93).

   The not-quite-yet glyph is a neutral bulb, a text character with `aria-hidden`, from labels so content owns it. No red tokens are referenced (scanned).
10. **Gallery and baselines.** `LearnGallery.tsx` renders every state with fixtures, plus a composed keyboard flow. `src/gallery/Gallery.tsx` gets one import and one element. `tests/visual/learn.spec.ts` screenshots that section at three widths. Existing baselines change only if the gallery page grows, so the gallery baseline is regenerated and listed in `review.md`.

## Risks and trade-offs

- **Two FeedbackPanels (D129).** This is confusing until the wiring change. Mitigation: a file header comment in each, and the contract comment names the practice one.
- **Double announcement (proposal question 8).** The a11y-checker listens in task 4.1; if it reads badly, drop the heading's announcement by keeping focus but trimming the live region to the why.
- **Stepper vs `module-checks`.** The current spec requires a text field. Adoption must modify that spec; flagged as [OPEN].
- **Confidence levels.** Rendering three levels while two are stored is possible only once the team decides. The component is ready either way.
- **The gallery line is outside `src/ui/learn/`.** It needs the user's OK at the skim (proposal question 9).

## Migration plan

Nothing migrates in this change. The follow-up wiring change replaces the inline inputs in `CheckItem`, `CheckFeedback` and `ScaffoldLadder` with these components and modifies `module-checks`, `check-feedback`, `scaffold-ladder` and `retry-cap`. It then points the `FeedbackPanel` contract at the new panel and retires the old ones.

## Open questions

See the proposal: questions 4 (confidence levels), 5 (stepper in checks), 9 (gallery line) and 11 (confidence FR ID) remain for the human skim. None blocks the tests or the build.

## Notes from apply

- **Ownership of props.** The built components own their props types in `src/ui/learn/*`. `src/ui/contracts.ts` re-exports them as `ComponentProps<typeof X>`. This reverses the wording of decision 1 (contracts define, components implement), so the contract cannot drift from the code.
- **ConfidenceRating `value` is a `string`,** not the stored `Confidence` type: the stored type has two values and the design shows three levels. The caller maps levels to what it stores.
- **FeedbackPanel focus.** It focuses the heading only when the variant changes after the first render. The spec line was updated (a page that opens with feedback shown must not steal focus).
- **Dev dependency:** `@testing-library/user-event` (user's decision, 14 Nov).
- **Polish (3.2)** was CSS only: critique items K1 to K3 in `review.md`. K4 (a ✓ on "your answer") needs a label prop and is left `[OPEN]`.

## Merge with main (14 Nov): live content types

Main replaced the old assessment layer (`src/assessment`) with the live content (`src/live`, D94 to D116). This change follows:

- **QuestionItem** takes `question: Question` (was `instance: Instance`). It emits the live `Response` (`{ kind: 'option', id }`; the stepper gives `{ kind: 'values', values: [n] }`) and reads `Mark.verdict`, where `partial` looks like not quite yet. Options give a radio group; no options give the stepper.
- **revealCorrect** is now the engine's correct option ID, because live options carry no `correct` flag and the shown answer must come from the engine (D95).
- **FullAnswer** takes the engine's answer (`{ kind: 'option', text } | { kind: 'value', value } | { kind: 'tree', tree }`) and an `explanation`, instead of a `WorkedExample`.
- **FeedbackPanel:** the old practice panel that D129 kept separate was removed on main, which left a stub. The `FeedbackPanel` contract is now this change's `src/ui/learn/FeedbackPanel.tsx` and its stub is deleted. Contracts are 19 built and 26 stubbed.
- **Decisions** renumbered from D103–D106 to D128–D131. Main uses D1 to D124, and `revamp-tree-view` proposes D125 to D127.
- The gallery's example tree now draws in the D97 look, so six learn and gallery phone and tablet baselines were refreshed.
