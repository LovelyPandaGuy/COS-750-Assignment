# Design

## Context

Change 19 built the bank (`src/content/questions/checks.ts`, 15 items), `instantiate(item, seed, attempt)`, `mark`, `attemptPolicy` and `attemptRecord`. Each module's check step in `src/content/modules/c*.ts` is a placeholder showing `screenCopy.coming`. `ModulePlayer` already has the "Where next?" panel (`RouteChoice`, `recommendRoute`, no-op route events). `learnerReducer` only handles `reset` and `persistence`; nothing can add an attempt or complete a module. `PracticeFeedback` already renders D27's four parts for practice. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Show, mark, store and complete checks from the existing bank with no new question text in content.
- One feedback shape shared with practice.
- Result-based routing from stored attempts.

**Non-Goals:**
- Retry cap, ladder, mastery, sub-skill status, diagnostic, readiness, event log (changes 21 to 26).

## Decisions

1. **Steps come from the bank.** `ModulePlayer` expands a module's Check activity into: the content intro step, one `check-item` step per `bankFor(module)` item, then the summary. Content keeps one intro step with the placeholder line removed. Alternative, listing item IDs in content, was rejected: the bank already keys items by module, and two lists would drift.
2. **Seed and attempt.** `seed = hash(profileId + itemId)` (pure helper in `src/assessment`); `attempt` = number of stored attempts for that item. Reload keeps the question; Try again moves to the next variant. Alternative, session state, was rejected because a reload would restart.
3. **Session actions.** `learnerReducer` gains `attempt-recorded` and `module-completed`; `LearnerSession` exposes `recordAttempt(attempt)` and `completeModule(id)`. Both go through the existing save effect. Attempts are validated with the existing attempt parser before storing; completion is idempotent. `currentModule` advances to the next module only when it equalled the completed one.
4. **Completion is a pure function** `checkComplete(module, attempts)`: every non-optional item has a correct attempt. C7's items are all optional, so for C7 it is "every item correct". The player calls `completeModule` when it becomes true after an answer; nothing else calls it.
5. **Routing input.** `recommendRoute(module, attempts)` counts required items whose first attempt (the earliest stored for that item) was not correct; at or above `REVIEW_AFTER_MISSES` (1, in `src/modules/config.ts`) it returns the module itself. `RouteChoice` marks "Suggested" on the button it names. Route events keep their types; `recommended` may now equal `from`.
6. **Feedback component.** A separate `CheckFeedback` (a Review link and Try again or Next, instead of PracticeFeedback's in-place review) takes its verdict words from `practiceModuleCopy` through `checkCopy`, so the wording stays in one place; the other check wording is in `src/content/check.ts`. The Review link navigates to `paths.activity(module, 'explore')`.
7. **Tree editor.** `TraceEditor` composes: the tree figure, a key list with an Insert button (plain BST insert from the engine, one key at a time in listed order), the existing `RotationMenu` and Undo/Reset logic from `DoItYourself`, and an edit log. It reports the current tree to the marker on Check answer. Alternative, a free drag-and-drop editor, rejected as larger than FR-ASM-04 needs.
8. **Confidence.** Two toggle buttons in a labelled group; unset by default, stored on the attempt.

## Risks / Trade-offs

- **No cap yet.** A student can retry forever; Back and the hub stay free (D20), and change 21 adds the cap. Recorded in the proposal.
- **Editor size.** `TraceEditor` reuses the rotation code but adds an insert control; keep it to the one item kind and state in tests that it works by keyboard.
- **Reload and Review.** Leaving the check drops on-screen state (the selected option) but not attempts; the step re-instantiates for the next attempt.
- **First-attempt miss rule is a guess** (routing cut-offs wait on the team); it is one constant.
