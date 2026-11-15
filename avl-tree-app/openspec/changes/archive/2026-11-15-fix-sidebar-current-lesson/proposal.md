# Proposal

## Open questions

No `[OPEN]` item blocks the specs (D18). Please read these before `/opsx:apply`.

1. **Settled (user, 15 Nov): the sidebar must follow the lesson being viewed.** Opening another lesson left the strong highlight (thick border, tint, "You are here") on the student's current lesson, usually C1, so the sidebar looked stuck. The viewed lesson only had a bold, underlined title.
2. **Settled (user, 15 Nov): the current-module fix is part of this change.** When a lesson is completed, the current module becomes the first lesson in C1 to C9 order that is not completed. Before this change it moved on only when the completed lesson was the current one, so completing C2 to C4 while C1 was current left C1 as "You are here" for good.
3. **Assumed, not blocking (D164): the word "Up next" replaces "You are here" in the sidebar.** "You are here" is wrong once the student is viewing another lesson. "Up next" with ▶ is the existing design vocabulary (`screens.ts` uses "Up next"). One entry: `shellCopy.sidebar.words.current`. Amends D155's wording only. Flagged for the user to read.
4. **Assumed, not blocking (D164): C7 counts like any lesson for the current module.** If every other lesson is done and C7 is not, the current module is C7 ("Up next"). C7 still never blocks C8 or Ready (D20, ID 5.1); this only chooses which lesson the sidebar and "Resume" point to. With all nine done, the current module does not change.
5. **Assumed, not blocking: the "current" style in the sidebar becomes a 2px solid border** when it is not the viewed lesson, so only one item is filled. Tokens only; the `ui-polisher` may refine within the design system.

Serves ID 8.2 (lesson list), ID 8.3, ID 11.1 (not colour alone), FR-LRN-03, FR-LRN-05, D155, D20.

## Why

The Lessons sidebar is the student's map (D155). It gives the strongest visual weight to the learner's current lesson, not the lesson on screen, and the current lesson rarely moves when the student goes out of order. So on every lesson after C1 the sidebar still looks like it is on C1.

## What Changes

- **Sidebar, viewed lesson (changed):** the lesson being viewed (`aria-current="page"`) gets the strong highlight: thick `--action-primary` border and `--action-primary-tint` background, plus the bold, underlined title it has now (not colour alone).
- **Sidebar, current lesson (changed):** when it is not the viewed lesson, it keeps its ▶ symbol and word but has a 2px solid border and no tint.
- **Sidebar wording (changed):** "You are here" becomes "Up next" (D164, assumed).
- **Completing a lesson (changed):** the current module becomes the first not-completed lesson in C1 to C9 order; unchanged when all nine are done.
- ARIA stays as it is: `aria-current="page"` on the viewed lesson, `aria-current="step"` on the current lesson otherwise.

## Out of scope

- The progress components in the gallery (`ProgressMap`, `LessonMenu` wording outside the sidebar, `screens.ts` states).
- Locking lessons (D20 stands). The Start screen's Resume behaviour, beyond following the new current module.
- Migrating stored learner data: a stored `currentModule` is corrected the next time a lesson is completed.
- The user's uncommitted `appTitle` edit in `src/content/shell.ts`.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `lesson-sidebar`: "The sidebar marks progress and the page" ("Up next", and the viewed lesson is the one highlighted).
- `lesson-checks`: "Finishing the check completes the lesson" (the current module becomes the first not-completed lesson).

## Impact

- `src/ui/navigation/sidebar.css` (viewed and current styles, tokens only).
- `src/content/shell.ts` (`sidebar.words.current`, one string).
- `src/state/learnerReducer.ts` (`module-completed`).
- Tests: `tests/ui/lesson-sidebar.test.tsx`, `tests/state/learner-results.test.tsx` ("leaves currentModule alone when it was another module" is replaced by the new rule).
- `.claude/docs/decisions.md`: new assumed row D164.
