// Closed lists the question model and its content share (add-question-model-and-bank). No imports
// beyond types, so content records can import these without a cycle.
import type { NeedId } from '../modules/compare'

export const LO_IDS = ['LO1', 'LO2', 'LO3', 'LO4', 'LO5', 'LO6', 'LO7', 'LO8', 'LO9'] as const
export type LoId = (typeof LO_IDS)[number]

/** A C1 prerequisite item belongs to no learning outcome (add-diagnostic-c1-and-routing). */
export const OUTCOME_TAGS = [...LO_IDS, 'PRE'] as const
export type OutcomeTag = (typeof OUTCOME_TAGS)[number]

/** Bloom levels as the SE document names them (SE 6.3 `Level`). */
export const BLOOM_LEVELS = ['remember', 'understand', 'apply', 'analyse'] as const
export type BloomLevel = (typeof BLOOM_LEVELS)[number]

export const ANSWER_TYPES = ['choice', 'number', 'tree'] as const
export type AnswerType = (typeof ANSWER_TYPES)[number]

export type MisconceptionId = string

/** The scenario misconception for a need the chosen structure does not meet: one per need. */
export function needMisconception(need: NeedId): MisconceptionId {
  return `M-NEED-${need.toUpperCase()}`
}
