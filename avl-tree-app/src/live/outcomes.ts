// The ID's objective table (ID 5.1 objectives and Bloom levels, ID 5.2 criteria counts, ID 7.1
// lesson-to-objective table). No JSON file holds it, so it is the one place these ID facts are
// typed in code (design 2). PRE is the C1 prerequisite set (ID 7.2: five questions).
export type OutcomeId = 'LO1' | 'LO2' | 'LO3' | 'LO4' | 'LO5' | 'LO6' | 'LO7' | 'PRE'

export interface OutcomeEntry {
  /** The objective as ID 5.1 words it. */
  statement: string
  lesson: string
  criteria: number
  /** Bloom levels allowed for its items (ID 5.1); null accepts any known level. */
  levels: readonly string[] | null
  optional?: boolean
}

export const OUTCOMES: Record<OutcomeId, OutcomeEntry> = {
  LO1: { statement: 'Explain how AVL trees address the inefficiencies of unbalanced BSTs.', lesson: 'c2', criteria: 2, levels: ['understand'] },
  LO2: {
    statement: 'Calculate node heights and balance factors to determine whether a given binary search tree satisfies the AVL balance property.',
    lesson: 'c3',
    criteria: 2,
    levels: ['apply'],
  },
  LO3: { statement: 'Trace AVL searches and explain their logarithmic time complexity.', lesson: 'c4', criteria: 4, levels: ['apply', 'understand'] },
  LO4: { statement: 'Identify and perform single or double rotations to restore AVL balance.', lesson: 'c5', criteria: 4, levels: ['apply'] },
  LO5: { statement: 'Perform AVL insertions while maintaining the AVL property.', lesson: 'c6', criteria: 4, levels: ['apply'] },
  LO6: { statement: 'Identify practical applications of AVL trees and justify their suitability.', lesson: 'c8', criteria: 2, levels: ['evaluate'] },
  LO7: { statement: 'Delete a leaf from an AVL tree and restore the AVL property.', lesson: 'c7', criteria: 3, levels: ['apply'], optional: true },
  PRE: { statement: 'Prerequisites from the BST lectures.', lesson: 'c1', criteria: 5, levels: null },
}

export const BLOOM_LEVELS = ['remember', 'understand', 'apply', 'analyse', 'evaluate', 'create'] as const

/** The objectives each lesson teaches (ID 7.1): C1 prerequisites only, C9 all. */
export const LESSON_OUTCOMES: Record<string, readonly string[]> = {
  c1: [],
  c2: ['LO1'],
  c3: ['LO2'],
  c4: ['LO3'],
  c5: ['LO4'],
  c6: ['LO5'],
  c7: ['LO7'],
  c8: ['LO6'],
  c9: ['LO1', 'LO2', 'LO3', 'LO4', 'LO5', 'LO6', 'LO7'],
}

/** The five C1 prerequisite skills, in ID 7.2's words ("tree terms, 'is this a BST?', where a new key is inserted, a BST search path, and the height of a node"). */
export const PREREQUISITES: Record<string, string> = {
  'PRE.1': 'Tree terms',
  'PRE.2': 'Is this a BST?',
  'PRE.3': 'Where a new key is inserted',
  'PRE.4': 'A BST search path',
  'PRE.5': 'The height of a node',
}
