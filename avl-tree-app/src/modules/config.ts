// Practice and check numbers in one place (D21, D18). A team vote changes a constant here.

/** Hints per practice step: a nudge, then a fuller hint. */
export const PRACTICE_HINTS = 2

/** Keys already in the AVL tree of a rotation practice problem, before the one that unbalances it (proposal item 7). */
export const ROTATION_PRACTICE_KEYS = 5

/** Attempts per check question before a lecture question is recorded and the student continues (D9, FR-SCA-03). */
export const RETRY_CAP = 3

/** Keys in a "be the algorithm" practice tree, drawn from 1 to 99 (add-module-c4-search, proposal item 5). */
export const SEARCH_PRACTICE_KEYS = 7

/** Required check items answered wrongly first time that make "look over this module again" the suggested route (D20; routing cut-offs wait on the team). */
export const REVIEW_AFTER_MISSES = 1

/** Support levels on a check question: a hint, a worked example, a guided step-through (D21, FR-SCA-02). */
export const LADDER_LEVELS = 3

/** Mastery threshold per sub-skill: at least MASTERY_CORRECT of the last MASTERY_WINDOW attempts correct. Provisional (FR-SCA-01, SE TODO). */
export const MASTERY_WINDOW = 3
export const MASTERY_CORRECT = 2

/** Correct answers out of five at which the diagnostic routes straight to C2 (FR-DIA-03, D6). */
export const DIAGNOSTIC_ROUTE_MIN = 4
