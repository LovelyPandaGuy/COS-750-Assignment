// Practice and check numbers in one place (D21, D18). A team vote changes a constant here.

/** Hints per practice step: a nudge, then a fuller hint. */
export const PRACTICE_HINTS = 2

/** Keys already in the AVL tree of a rotation practice problem, before the one that unbalances it (proposal item 7). */
export const ROTATION_PRACTICE_KEYS = 5

/** Attempts per check question before a lecture question is recorded and the student continues (D9, FR-SCA-03). */
export const RETRY_CAP = 3

/** Keys in a "be the algorithm" practice tree, drawn from 1 to 99 (add-module-c4-search, proposal item 5). */
export const SEARCH_PRACTICE_KEYS = 7

/**
 * The scaffold ladder for a check question, in escalation order (FR-SCA-02, D9, D21). A wrong answer
 * or a request opens the next rung; at RETRY_CAP every rung opens.
 */
export const SCAFFOLD_LADDER = ['hint', 'worked-example', 'guided'] as const

/** Keys in the C9 combined item's sequence (build an AVL tree, then search it; add-readiness-c9). */
export const READINESS_BUILD_KEYS = 6

/** How many times a C9 item answered wrongly comes back, as a new variant, after the first pass (D14, FR-ASM-06). */
export const READINESS_RETURNS = 1

/** Question ID of a lecture question the student writes themselves (FR-RDY-02, D14); drafted ones carry an item ID. */
export const OWN_LECTURE_QUESTION = 'own'

/** Required check items answered wrongly first time that make "look over this module again" the suggested route (D20; routing cut-offs wait on the team). */
export const REVIEW_AFTER_MISSES = 1

/** Mastery threshold per sub-skill: at least MASTERY_CORRECT of the last MASTERY_WINDOW attempts correct. Provisional (FR-SCA-01, SE TODO). */
export const MASTERY_WINDOW = 3
export const MASTERY_CORRECT = 2

/** Correct answers out of five at which the diagnostic routes straight to C2 (FR-DIA-03, D6). */
export const DIAGNOSTIC_ROUTE_MIN = 4

/** The student's own lecture question is trimmed and capped at this length (FR-RDY-02). */
export const OWN_QUESTION_MAX_LENGTH = 300
