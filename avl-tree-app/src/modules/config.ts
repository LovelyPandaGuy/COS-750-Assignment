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
